import QualitySelector from './QualitySelector';
import SpeedSelector from './SpeedSelector';

/**
 * Video player control buttons overlay
 * @param {Array} qualities - Available quality levels
 * @param {string} selectedQuality - Current quality
 * @param {Function} onQualityChange - Quality change handler
 * @param {number} playbackSpeed - Current playback speed
 * @param {Function} onSpeedChange - Speed change handler
 */
const VideoControls = ({
  qualities,
  selectedQuality,
  onQualityChange,
  playbackSpeed,
  onSpeedChange
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
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
