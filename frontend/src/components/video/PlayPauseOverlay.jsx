import { FaPlay, FaPause } from 'react-icons/fa';

/**
 * Center play/pause overlay button
 * @param {boolean} isPlaying - Whether video is currently playing
 * @param {boolean} showButton - Whether to show the button
 * @param {Function} onClick - Click handler
 * @param {Function} onDoubleClick - Double click handler
 */
const PlayPauseOverlay = ({ isPlaying, showButton, onClick, onDoubleClick }) => {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className="absolute top-0 left-0 right-0 flex items-center justify-center cursor-pointer pointer-events-none"
      style={{ bottom: '55px' }}
    >
      <div
        className={`w-20 h-20 flex items-center justify-center rounded-full bg-black bg-opacity-70 backdrop-blur-sm border-2 border-primary-500 shadow-2xl transition-opacity duration-300 pointer-events-auto ${
          showButton || !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {isPlaying ? (
          <FaPause className="text-white text-2xl ml-0" />
        ) : (
          <FaPlay className="text-white text-2xl ml-1" />
        )}
      </div>
    </div>
  );
};

export default PlayPauseOverlay;
