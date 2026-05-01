import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import Stream from '../models/Stream.js';
import { getIO, clearChatHistory } from '../socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STREAMS_DIR = path.join(__dirname, '../../streams');

// streamKey -> ffmpeg child process
const hlsProcesses = new Map();
// streamKey -> stream doc (set in prePublish so postPublish can use it)
const pendingStreams = new Map();
// streamKey -> thumbnail interval id
const thumbnailIntervals = new Map();

function captureThumbnail(streamKey) {
  const segDir  = path.join(STREAMS_DIR, 'live', streamKey);
  const thumbDir = path.join(STREAMS_DIR, 'thumbnails');
  fs.mkdirSync(thumbDir, { recursive: true });

  let files;
  try { files = fs.readdirSync(segDir).filter(f => f.endsWith('.ts')).sort(); }
  catch { return; }
  if (files.length === 0) return;

  const latestSeg = path.join(segDir, files[files.length - 1]).replace(/\\/g, '/');
  const outFile   = path.join(thumbDir, `${streamKey}.jpg`).replace(/\\/g, '/');
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

  const proc = spawn(ffmpegPath, [
    '-y', '-i', latestSeg,
    '-vframes', '1', '-q:v', '3',
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black',
    outFile,
  ]);
  proc.stderr.on('data', () => {});
  proc.on('error', () => {});
  proc.on('close', async (code) => {
    if (code === 0) {
      await Stream.findOneAndUpdate(
        { streamKey },
        { thumbnail: `/hls/thumbnails/${streamKey}.jpg?t=${Date.now()}` }
      ).catch(() => {});
    }
  });
}

function startThumbnailCapture(streamKey) {
  setTimeout(() => captureThumbnail(streamKey), 8000);          // first grab after 8s
  const id = setInterval(() => captureThumbnail(streamKey), 60_000); // then every 60s
  thumbnailIntervals.set(streamKey, id);
}

function stopThumbnailCapture(streamKey) {
  const id = thumbnailIntervals.get(streamKey);
  if (id) { clearInterval(id); thumbnailIntervals.delete(streamKey); }
}

function spawnHls(streamKey) {
  const outputDir = path.join(STREAMS_DIR, 'live', streamKey);
  fs.mkdirSync(outputDir, { recursive: true });

  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const rtmpPort  = process.env.RTMP_PORT || 1935;
  const rtmpUrl   = `rtmp://127.0.0.1:${rtmpPort}/live/${streamKey}`;
  const segPat    = outputDir.replace(/\\/g, '/') + '/seg%03d.ts';
  const outFile   = outputDir.replace(/\\/g, '/') + '/index.m3u8';

  console.log(`[HLS] Spawning FFmpeg for key ${streamKey}`);
  console.log(`[HLS] Input:  ${rtmpUrl}`);
  console.log(`[HLS] Output: ${outFile}`);

  const proc = spawn(ffmpegPath, [
    '-i', rtmpUrl,
    '-c:v', 'copy',
    '-c:a', 'aac', '-ar', '44100', '-b:a', '128k',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '6',
    '-hls_flags', 'delete_segments+append_list',
    '-hls_segment_filename', segPat,
    outFile,
  ]);

  proc.stderr.on('data', (d) => {
    const line = d.toString().trim();
    if (line && !line.startsWith('frame=') && !line.startsWith('size=') && !line.startsWith('video:')) {
      console.log('[HLS]', line);
    }
  });
  proc.on('error', (err) => console.error('[HLS spawn error]', err.message));
  proc.on('close', (code) => {
    console.log(`[HLS] FFmpeg exited (code ${code}) for key ${streamKey}`);
    hlsProcesses.delete(streamKey);
  });

  hlsProcesses.set(streamKey, proc);
}

export const initNMS = async () => {
  let NodeMediaServer;
  try {
    ({ default: NodeMediaServer } = await import('node-media-server'));
  } catch {
    console.warn('[NMS] node-media-server not available — RTMP disabled');
    return null;
  }

  const nms = new NodeMediaServer({
    rtmp: {
      port: parseInt(process.env.RTMP_PORT) || 1935,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: parseInt(process.env.NMS_HTTP_PORT) || 8888,
      mediaroot: STREAMS_DIR,
      allow_origin: '*',
    },
  });

  // prePublish: validate key, update DB, store stream doc for postPublish
  nms.on('prePublish', async (session) => {
    const streamKey = session.streamPath?.split('/').pop();
    console.log(`[RTMP] prePublish — key: ${streamKey}`);

    const stream = await Stream.findOne({ streamKey }).catch((e) => {
      console.error('[RTMP] DB lookup error:', e.message);
      return null;
    });

    if (!stream) {
      console.warn(`[RTMP] Unknown stream key "${streamKey}" — closing session`);
      session.close();
      return;
    }

    await Stream.findOneAndUpdate(
      { streamKey },
      { status: 'live', source: 'rtmp', startedAt: new Date(), viewerCount: 0 }
    ).catch((e) => console.error('[RTMP] DB update error:', e.message));

    pendingStreams.set(streamKey, stream);
    console.log(`[RTMP] Stream live: ${streamKey} (id: ${stream._id})`);

    const io = getIO();
    if (io) io.emit('stream:live', { streamId: String(stream._id) });
  });

  // postPublish fires after publisher is registered in NMS — safe to spawn FFmpeg
  // NMS does NOT await our prePublish handler, so we read from pendingStreams
  // and retry until it resolves (max ~3 seconds)
  nms.on('postPublish', (session) => {
    const streamKey = session.streamPath?.split('/').pop();
    if (!streamKey) return;

    const trySpawn = (attempts) => {
      if (pendingStreams.has(streamKey)) {
        pendingStreams.delete(streamKey);
        spawnHls(streamKey);
        startThumbnailCapture(streamKey);
        return;
      }
      if (attempts > 0) {
        setTimeout(() => trySpawn(attempts - 1), 300);
      } else {
        console.warn(`[RTMP] postPublish: prePublish never resolved for key ${streamKey} — skipping HLS`);
      }
    };
    setTimeout(() => trySpawn(10), 200); // wait up to ~3.2s for prePublish async to finish
  });

  nms.on('donePublish', async (session) => {
    const streamKey = session.streamPath?.split('/').pop();
    console.log(`[RTMP] donePublish — key: ${streamKey}`);

    const proc = hlsProcesses.get(streamKey);
    if (proc) { proc.kill('SIGTERM'); hlsProcesses.delete(streamKey); }
    pendingStreams.delete(streamKey);
    stopThumbnailCapture(streamKey);

    const stream = await Stream.findOneAndUpdate(
      { streamKey },
      { status: 'ended', endedAt: new Date() }
    ).catch(() => null);

    console.log(`[RTMP] Stream ended: ${streamKey}`);
    if (stream) {
      clearChatHistory(String(stream._id));
      const io = getIO();
      if (io) io.emit('stream:ended', { streamId: String(stream._id) });
    }
  });

  nms.run();
  console.log(`[RTMP] Server started on port ${process.env.RTMP_PORT || 1935}`);
  return nms;
};
