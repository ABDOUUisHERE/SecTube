import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaUsers } from 'react-icons/fa';
import { userAPI } from '../services/api';
import { getAvatarUrl } from '../config/constants';

const RightPanel = () => {
  const { data, isLoading } = useQuery(
    'following-streamers-panel',
    () => userAPI.getFollowingStreamers(),
    { staleTime: 30 * 1000, refetchInterval: 30 * 1000 }
  );

  const streamers = data?.data?.data ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800 flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Following</span>
        {streamers.filter((s) => s.liveStream).length > 0 && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
            <span className="w-1 h-1 bg-red-400 rounded-full animate-ping" />
            {streamers.filter((s) => s.liveStream).length} live
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
        {isLoading ? (
          <div className="space-y-1 px-2 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2 py-1.5 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-dark-800 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 bg-dark-800 rounded w-3/4" />
                  <div className="h-1.5 bg-dark-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : streamers.length === 0 ? (
          <p className="text-[11px] text-gray-600 text-center mt-6 px-4">
            Follow streamers to see them here
          </p>
        ) : (
          streamers.map((streamer) => {
            const isLive = !!streamer.liveStream;
            return (
              <Link
                key={streamer._id}
                to={isLive ? `/live/${streamer.liveStream._id}` : `/channel/${streamer.username}`}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors group rounded-lg mx-1"
              >
                {/* Avatar with live dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={getAvatarUrl(streamer.avatar)}
                    alt=""
                    className={`w-7 h-7 rounded-full object-cover border ${isLive ? 'border-red-500/50' : 'border-dark-700'} ${!isLive ? 'opacity-50 grayscale' : ''}`}
                  />
                  {isLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-900" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate leading-none ${isLive ? 'text-white group-hover:text-primary-300' : 'text-gray-500 group-hover:text-gray-400'} transition-colors`}>
                    {streamer.displayName || streamer.username}
                  </p>
                  <p className="text-[10px] mt-0.5 truncate">
                    {isLive ? (
                      <span className="text-gray-500">
                        {streamer.liveStream.category}
                      </span>
                    ) : (
                      <span className="text-gray-700">Offline</span>
                    )}
                  </p>
                </div>

                {/* Viewer count */}
                {isLive && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-600 flex-shrink-0">
                    <FaUsers size={8} />
                    {(streamer.liveStream.viewerCount ?? 0).toLocaleString()}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RightPanel;
