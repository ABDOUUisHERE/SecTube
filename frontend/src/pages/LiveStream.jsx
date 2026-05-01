import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { formatDistanceToNow } from 'date-fns';
import { FaUsers, FaPaperPlane, FaSignInAlt } from 'react-icons/fa';
import { BsBroadcast } from 'react-icons/bs';
import { IoRadioOutline } from 'react-icons/io5';
import { streamAPI } from '../services/api';
import { streamSocket } from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { getAvatarUrl } from '../config/constants';
import sanitize from '../utils/sanitize';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const getHlsUrl = (stream) => {
  if (!stream?.streamKey) return null;
  return `${BASE_URL}/hls/live/${stream.streamKey}/index.m3u8`;
};

const LiveStream = () => {
  const { streamId } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Lock body scroll for theatre mode
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load stream
  useEffect(() => {
    streamAPI.getStream(streamId)
      .then((res) => { setStream(res.data.data); setViewerCount(res.data.data?.viewerCount ?? 0); })
      .catch(() => addToast({ type: 'error', message: 'Stream not found' }))
      .finally(() => setLoading(false));
  }, [streamId]);

  // Listen for stream going live
  useEffect(() => {
    const onLive = ({ streamId: sid }) => {
      if (sid !== streamId) return;
      streamAPI.getStream(streamId).then((res) => setStream(res.data.data)).catch(() => {});
    };
    streamSocket.on('stream:live', onLive);
    return () => streamSocket.off('stream:live', onLive);
  }, [streamId]);

  // Socket: join room, viewer count, chat
  useEffect(() => {
    if (!stream || stream.status !== 'live') return;
    if (isAuthenticated) streamSocket.joinViewer(streamId);
    const onChatHistory = (msgs) => setChatMessages(msgs);
    const onViewerCount = ({ count }) => setViewerCount(count);
    const onChatMessage = (msg) => setChatMessages((prev) => [...prev.slice(-199), msg]);
    const onStreamEnded = ({ streamId: sid }) => {
      if (sid === streamId) setStream((s) => ({ ...s, status: 'ended' }));
    };
    streamSocket.on('chat:history', onChatHistory);
    streamSocket.on('viewer:count', onViewerCount);
    streamSocket.on('chat:message', onChatMessage);
    streamSocket.on('stream:ended', onStreamEnded);
    return () => {
      if (isAuthenticated) streamSocket.leaveViewer(streamId);
      streamSocket.off('chat:history', onChatHistory);
      streamSocket.off('viewer:count', onViewerCount);
      streamSocket.off('chat:message', onChatMessage);
      streamSocket.off('stream:ended', onStreamEnded);
    };
  }, [stream, streamId, isAuthenticated]);

  // Auto-scroll only when already at the bottom
  const handleChatScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Video.js player
  useEffect(() => {
    if (stream?.status !== 'live') return;
    const hlsUrl = getHlsUrl(stream);
    if (!hlsUrl) return;
    const t = setTimeout(() => {
      if (!videoRef.current) return;
      const player = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        muted: true,
        liveui: true,
        fluid: false,
        fill: true,
        html5: { vhs: { overrideNative: true } },
        sources: [{ src: hlsUrl, type: 'application/x-mpegURL' }],
      });
      playerRef.current = player;
    }, 50);
    return () => {
      clearTimeout(t);
      if (playerRef.current) { playerRef.current.dispose(); playerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream?._id, stream?.status]);

  const sendChat = useCallback((e) => {
    e.preventDefault();
    if (!chatInput.trim() || !isAuthenticated) return;
    streamSocket.sendChat(streamId, chatInput.trim());
    setChatInput('');
  }, [chatInput, streamId, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)] bg-dark-950">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] bg-dark-950 gap-3 text-gray-500">
        <IoRadioOutline size={40} />
        <p className="text-sm">Stream not found</p>
      </div>
    );
  }

  const isLive = stream.status === 'live';

  return (
    <div className="flex h-[calc(100vh-56px)] bg-dark-950 overflow-hidden">

      {/* ── Left: video + info strip ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Player — fills remaining height */}
        <div className={`flex-1 relative bg-black ${isLive ? 'ring-inset ring-1 ring-primary-500/20' : ''}`}>
          {isLive ? (
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center">
                <BsBroadcast size={32} className="text-gray-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400">
                  {stream.status === 'ended' ? 'Stream has ended' : 'Stream is offline'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {stream.status === 'ended' ? 'Thanks for watching' : 'Check back later'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info strip */}
        <div className="flex-shrink-0 bg-dark-900 border-t border-dark-800 px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Left: streamer + title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link to={`/channel/${stream.streamer?.username}`} className="flex-shrink-0">
                <img
                  src={getAvatarUrl(stream.streamer?.avatar)}
                  alt=""
                  className="w-9 h-9 rounded-full border border-dark-700 object-cover hover:border-primary-500/50 transition"
                />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isLive ? (
                    <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                      Live
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-dark-800 border border-dark-700 px-2 py-0.5 rounded">
                      {stream.status === 'ended' ? 'Ended' : 'Offline'}
                    </span>
                  )}
                  <span className="text-[9px] font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded">
                    {stream.category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white truncate mt-0.5 leading-tight">
                  {sanitize(stream.title)}
                </p>
                <p className="text-[11px] text-gray-500 leading-none mt-0.5">
                  <Link to={`/channel/${stream.streamer?.username}`} className="hover:text-primary-400 transition">
                    {stream.streamer?.displayName || stream.streamer?.username}
                  </Link>
                  {stream.startedAt && (
                    <span className="ml-2">
                      · Started {formatDistanceToNow(new Date(stream.startedAt), { addSuffix: true })}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: viewer count */}
            <span className="flex items-center gap-1.5 text-sm text-gray-400 flex-shrink-0">
              <FaUsers size={12} className="text-gray-500" />
              {viewerCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: live chat ── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-l border-dark-800 bg-dark-900">

        {/* Chat header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-800 flex-shrink-0">
          <BsBroadcast size={13} className={isLive ? 'text-red-400' : 'text-gray-600'} />
          <span className="text-sm font-semibold text-white">Live Chat</span>
          {isLive && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
              <FaUsers size={9} />
              {viewerCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent"
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center">
                <FaPaperPlane size={12} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-600">
                {isLive ? 'Be the first to say something!' : 'Chat is unavailable'}
              </p>
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <img
                  src={getAvatarUrl(msg.avatar)}
                  alt=""
                  className="w-6 h-6 rounded-full border border-dark-700 object-cover flex-shrink-0 mt-0.5"
                />
                <p className="text-[11px] leading-relaxed break-words min-w-0">
                  <span className="font-semibold text-primary-400 mr-1.5">
                    {msg.displayName || msg.username}
                  </span>
                  <span className="text-gray-300">{msg.message}</span>
                </p>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <div className="flex-shrink-0 border-t border-dark-800 p-3">
          {isLive ? (
            isAuthenticated ? (
              <form onSubmit={sendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Say something…"
                  maxLength={300}
                  className="flex-1 min-w-0 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/60 transition"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-primary-600 hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition"
                >
                  <FaPaperPlane size={11} />
                </button>
              </form>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-sm text-gray-400 hover:text-white rounded-lg transition"
              >
                <FaSignInAlt size={12} /> Sign in to chat
              </Link>
            )
          ) : (
            <p className="text-xs text-center text-gray-600 py-1">Chat unavailable</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default LiveStream;
