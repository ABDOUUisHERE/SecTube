import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCopy, FaEye, FaEyeSlash, FaRedo, FaExternalLinkAlt, FaUsers, FaClock } from 'react-icons/fa';
import { BsBroadcast } from 'react-icons/bs';
import { IoRadioOutline } from 'react-icons/io5';
import { streamAPI } from '../services/api';
import { streamSocket } from '../hooks/useSocket';
import useToastStore from '../store/toastStore';
import CustomSelect from '../components/CustomSelect';

const RTMP_SERVER = `rtmp://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:1935/live`;

const categories = [
  'Web Application Security', 'Network Security', 'Bug Bounty', 'Penetration Testing',
  'Malware Analysis', 'Reverse Engineering', 'Mobile Security', 'Cloud Security',
  'CTF Writeup', 'OSINT', 'Cryptography', 'IoT Security', 'Security Tools', 'Tutorial', 'Other',
];

const GoLive = () => {
  const { addToast } = useToastStore();
  const [stream, setStream] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', category: 'Tutorial' });
  const timerRef = useRef(null);

  useEffect(() => {
    streamAPI.getMine().then((res) => {
      const active = (res.data.data || []).find((s) => s.status !== 'ended');
      if (active) {
        setStream(active);
        setIsLive(active.status === 'live');
        setForm({ title: active.title, description: active.description || '', category: active.category });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isLive) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isLive]);

  useEffect(() => {
    if (!stream) return;
    const onViewerCount = ({ count }) => setViewerCount(count);
    const onLive = ({ streamId }) => { if (streamId === String(stream._id)) setIsLive(true); };
    const onEnded = ({ streamId }) => {
      if (streamId === String(stream._id)) { setIsLive(false); setStream((s) => ({ ...s, status: 'ended' })); }
    };
    streamSocket.on('viewer:count', onViewerCount);
    streamSocket.on('stream:live', onLive);
    streamSocket.on('stream:ended', onEnded);
    return () => {
      streamSocket.off('viewer:count', onViewerCount);
      streamSocket.off('stream:live', onLive);
      streamSocket.off('stream:ended', onEnded);
    };
  }, [stream]);

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${m}:${String(sec).padStart(2, '0')}`;
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => addToast({ type: 'success', message: `${label} copied!` }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const res = await (stream
        ? streamAPI.update(stream._id, form)
        : streamAPI.create(form));
      setStream(res.data.data);
      addToast({ type: 'success', message: stream ? 'Stream updated' : 'Stream created! Connect OBS to go live.' });
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleRegenKey = async () => {
    try {
      const res = await streamAPI.regenerateKey(stream._id);
      setStream(res.data.data);
      addToast({ type: 'success', message: 'Stream key regenerated' });
    } catch {
      addToast({ type: 'error', message: 'Could not regenerate key' });
    }
  };

  // ── Stream ended ──────────────────────────────────────────────────────────
  if (stream?.status === 'ended') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center">
          <BsBroadcast size={28} className="text-gray-600" />
        </div>
        <div>
          <p className="text-white font-semibold mb-1">Stream ended</p>
          <p className="text-sm text-gray-500">Thanks for streaming! Ready to go again?</p>
        </div>
        <button
          onClick={() => { setStream(null); setForm({ title: '', description: '', category: 'Tutorial' }); }}
          className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition border border-primary-700"
        >
          Start a new stream
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-screen-xl mx-auto">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <IoRadioOutline size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-none">Go Live</h1>
          <p className="text-xs text-gray-500 mt-0.5">Stream cybersecurity content to your audience via OBS</p>
        </div>
        {isLive && (
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                Live
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <FaClock size={10} className="text-gray-500" />
                {formatDuration(duration)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <FaUsers size={10} className="text-gray-500" />
                {viewerCount.toLocaleString()}
              </span>
              <Link
                to={`/live/${stream._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition font-medium"
              >
                <FaExternalLinkAlt size={9} /> Watch live
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column: Stream info form ── */}
        <div className="flex flex-col gap-6">
          <div className="bg-dark-900 border border-dark-800 rounded-md p-6">
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary-500 rounded-full" />
              Stream Info
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Live Bug Bounty Hunt — HackerOne"
                  className="w-full bg-dark-800 border border-dark-700 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/70 focus:ring-1 focus:ring-primary-500/20 transition"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                <CustomSelect
                  value={form.category}
                  onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  options={categories.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell viewers what you'll be streaming…"
                  rows={3}
                  className="w-full bg-dark-800 border border-dark-700 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/70 focus:ring-1 focus:ring-primary-500/20 transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !form.title.trim()}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-md transition border border-primary-700"
              >
                {creating ? 'Saving…' : stream ? 'Save Changes' : 'Create Stream'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right column: OBS credentials + guide ── */}
        {stream && stream.status !== 'ended' ? (
          <div className="flex flex-col gap-6">

            {/* Credentials card */}
            <div className="bg-dark-900 border border-dark-800 rounded-md p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-yellow-500 rounded-full" />
                OBS Credentials
              </h2>

              {/* RTMP URL */}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">RTMP Server URL</p>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-md px-4 py-2.5">
                  <code className="flex-1 text-xs text-primary-300 font-mono truncate">{RTMP_SERVER}</code>
                  <button
                    onClick={() => copy(RTMP_SERVER, 'Server URL')}
                    className="flex-shrink-0 p-1.5 text-gray-500 hover:text-white hover:bg-dark-700 rounded-md transition"
                    title="Copy"
                  >
                    <FaCopy size={12} />
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Stream Key</p>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-md px-4 py-2.5">
                  <code className="flex-1 text-xs text-yellow-300 font-mono truncate">
                    {showKey ? stream.streamKey : '•'.repeat(32)}
                  </code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setShowKey((v) => !v)}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-700 rounded-md transition"
                      title={showKey ? 'Hide' : 'Show'}
                    >
                      {showKey ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                    </button>
                    <button
                      onClick={() => copy(stream.streamKey, 'Stream key')}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-700 rounded-md transition"
                      title="Copy"
                    >
                      <FaCopy size={12} />
                    </button>
                    <button
                      onClick={handleRegenKey}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-dark-700 rounded-md transition"
                      title="Regenerate key"
                    >
                      <FaRedo size={11} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5">
                  Keep this secret — anyone with this key can stream to your channel.
                </p>
              </div>
            </div>

            {/* OBS Guide card */}
            <div className="bg-dark-900 border border-dark-800 rounded-md p-6">
              <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full" />
                Setup Guide
              </h2>
              <ol className="space-y-3">
                {[
                  ['Open OBS', 'Go to Settings → Stream'],
                  ['Set Service', 'Select Custom from the dropdown'],
                  ['Paste Server', 'Copy & paste the RTMP URL above'],
                  ['Paste Key', 'Copy & paste your stream key above'],
                  ['Go Live', 'Click Start Streaming in OBS'],
                ].map(([title, desc], i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-dark-700 border border-dark-600 text-[10px] font-bold text-gray-400 flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 pt-4 border-t border-dark-800 flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mt-0.5">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">To end your stream</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Click <span className="text-white font-medium">Stop Streaming</span> in OBS — the stream ends automatically.
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Placeholder when no stream created yet */
          <div className="bg-dark-900 border border-dark-800 rounded-md p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
            <div className="w-14 h-14 rounded-md bg-dark-800 border border-dark-700 flex items-center justify-center">
              <BsBroadcast size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">OBS credentials will appear here</p>
              <p className="text-xs text-gray-600 mt-1">Create your stream first to get the RTMP URL and stream key.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoLive;
