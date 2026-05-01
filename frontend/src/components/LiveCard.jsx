import { Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { BsBroadcast } from 'react-icons/bs';
import { getAvatarUrl, getAssetUrl } from '../config/constants';
import sanitize from '../utils/sanitize';

const LiveCard = ({ stream }) => {
  const thumbnailSrc = stream.thumbnail
    ? (stream.thumbnail.startsWith('/hls') ? getAssetUrl(stream.thumbnail) : stream.thumbnail)
    : null;

  return (
  <div className="flex flex-col group">
    <Link to={`/live/${stream._id}`} className="relative block">
      <div className="relative aspect-video bg-dark-900 rounded-md overflow-hidden mb-2 border border-dark-800">
        {thumbnailSrc ? (
          <img src={thumbnailSrc} alt={stream.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-900 to-dark-950">
            <BsBroadcast size={28} className="text-gray-700" />
          </div>
        )}

        {/* LIVE badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          Live
        </div>

        {/* Viewer count */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
          <FaUsers size={9} />
          <span>{stream.viewerCount ?? 0}</span>
        </div>
      </div>
    </Link>

    <div className="flex gap-1.5 sm:gap-2 px-3 sm:px-0">
      <Link to={`/channel/${stream.streamer?.username}`} className="flex-shrink-0">
        <img
          src={getAvatarUrl(stream.streamer?.avatar)}
          alt=""
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-dark-800 object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/live/${stream._id}`}>
          <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2 leading-snug hover:text-primary-400 transition-colors mb-0.5">
            {sanitize(stream.title)}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 flex-wrap">
          <Link to={`/channel/${stream.streamer?.username}`} className="hover:text-gray-400 truncate">
            {stream.streamer?.displayName || stream.streamer?.username}
          </Link>
          <span>•</span>
          <span className="truncate">{stream.category}</span>
        </div>
      </div>
    </div>
  </div>
  );
};

export default LiveCard;
