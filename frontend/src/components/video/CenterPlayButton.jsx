import { FaPlay, FaPause } from 'react-icons/fa';

/**
 * Center play/pause overlay button
 * @param {Object} props
 * @param {boolean} props.isPlaying - Whether video is currently playing
 * @param {boolean} props.showControls - Whether controls are visible
 * @param {Function} props.onClick - Click handler
 */
const CenterPlayButton = ({ isPlaying, showControls, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
      style={{ bottom: '60px' }}
    >
      <div
        className={`w-20 h-20 flex items-center justify-center rounded-full bg-black bg-opacity-70 backdrop-blur-sm border-2 border-primary-500 shadow-2xl transition-all duration-300 ${
          showControls || !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {isPlaying ? (
          <FaPause className="text-white text-2xl" />
        ) : (
          <FaPlay className="text-white text-2xl ml-1" />
        )}
      </div>
    </div>
  );
};

export default CenterPlayButton;
