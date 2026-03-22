import QualitySelector from './QualitySelector';
import SpeedSelector from './SpeedSelector';

/**
 * Video player control buttons overlay
 * @param {Array} qualities - Available quality levels
 * @param {string} selectedQuality - Current quality
 * @param {Function} onQualityChange - Quality change handler
 * @param {number} playbackSpeed - Current playback speed
 * @param {Function} onSpeedChange - Speed change handler
 * @param {boolean} isPlaying - Whether video is currently playing
 */
const VideoControls = ({
  qualities,
  selectedQuality,
  onQualityChange,
  playbackSpeed,
  onSpeedChange,
  isPlaying
}) => {
  return (
    <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 z-10 transition-opacity duration-200 flex gap-1.5 sm:gap-2 ${
      !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
    }`}>
      {/* Speed selector */}
      <SpeedSelector
        playbackSpeed={playbackSpeed}
        onSpeedChange={onSpeedChange}
      />

      {/* Quality selector */}
      {qualities.length > 0 && (
        <QualitySelector
          qualities={qualities}
          selectedQuality={selectedQuality}
          onQualityChange={onQualityChange}
        />
      )}
    </div>
  );
};

export default VideoControls;
