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
      className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none"
    >
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-black bg-opacity-70 backdrop-blur-sm border-2 border-primary-500 shadow-2xl transition-opacity duration-300 pointer-events-auto ${
          showButton || !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {isPlaying ? (
          <FaPause className="text-white text-lg sm:text-xl ml-0" />
        ) : (
          <FaPlay className="text-white text-lg sm:text-xl ml-0.5 sm:ml-1" />
        )}
      </div>
    </div>
  );
};

export default PlayPauseOverlay;
