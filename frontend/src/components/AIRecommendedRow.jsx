import { useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { videoAPI } from '../services/api';
import VideoCard from './VideoCard';
import VideoCardSkeleton from './VideoCardSkeleton';
import ConfirmDialog from './ConfirmDialog';
import useToastStore from '../store/toastStore';

const STORAGE_KEY = 'ai_recommended_hidden';

const AIRecommendedRow = ({ excludeVideoId }) => {
  const trackRef = useRef(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [collapsed, setCollapsed] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const { addToast } = useToastStore();

  const { data, isLoading, isError } = useQuery(
    ['ai-recommendations', excludeVideoId],
    () => videoAPI.getRecommendations({ limit: 12, ...(excludeVideoId && { excludeVideoId }) }),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !hidden,
      onError: (e) => console.error('[AIRecommendedRow]', e?.response?.data || e.message),
    }
  );

  const videos = data?.data?.data?.videos ?? [];
  const reason = data?.data?.data?.reason ?? 'Recommended for you';

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const hide = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHidden(true);
    addToast({ type: 'info', message: 'You can restore AI Recommendations any time in Settings → Preferences.' });
  };

  if (hidden) return null;
  if (!isLoading && (isError || videos.length === 0)) return null;

  return (
    <div className={`mb-8 sm:mb-10 rounded-xl border border-dark-700/60 bg-dark-800/40 px-4 sm:px-5 transition-all ${collapsed ? 'py-2.5' : 'py-4 sm:py-5'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${collapsed ? 'mb-0' : 'mb-3 sm:mb-4'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 flex items-center gap-1.5 bg-primary-600/15 border border-primary-500/30 text-primary-400 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
            <BsStars size={10} />
            AI Recommended
          </span>
          {!isLoading && (
            <span className="text-xs text-gray-500 italic truncate">{reason}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!collapsed && (
            <>
              <button onClick={() => scroll(-1)} className="p-1.5 rounded-md bg-dark-800 border border-dark-700 text-gray-400 hover:text-white hover:border-dark-600 transition-colors">
                <FaChevronLeft size={12} />
              </button>
              <button onClick={() => scroll(1)} className="p-1.5 rounded-md bg-dark-800 border border-dark-700 text-gray-400 hover:text-white hover:border-dark-600 transition-colors">
                <FaChevronRight size={12} />
              </button>
            </>
          )}

          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-md bg-dark-800 border border-dark-700 text-gray-400 hover:text-white hover:border-dark-600 transition-colors"
            title={collapsed ? 'Show' : 'Collapse'}
          >
            {collapsed ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
          </button>

          <button
            onClick={() => setShowHideConfirm(true)}
            className="p-1.5 rounded-md bg-dark-800 border border-dark-700 text-gray-400 hover:text-red-400 hover:border-dark-600 transition-colors"
            title="Hide this section"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showHideConfirm}
        onClose={() => setShowHideConfirm(false)}
        onConfirm={hide}
        type="info"
        title="Hide AI Recommendations?"
        message="This section will no longer appear on your home page. You can bring it back any time from Settings → Preferences."
        confirmText="Hide"
        cancelText="Keep it"
      />

      {/* Scrollable track */}
      {!collapsed && (
        <div
          ref={trackRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 sm:-mx-5 px-4 sm:px-5"
        >
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 sm:w-64 snap-start">
                  <VideoCardSkeleton />
                </div>
              ))
            : videos.map(video => (
                <div key={video._id} className="flex-shrink-0 w-56 sm:w-64 snap-start">
                  <VideoCard video={video} compact />
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
};

export default AIRecommendedRow;
