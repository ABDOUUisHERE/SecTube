import { useState, useRef, useEffect } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { useVideoKeyboardShortcuts } from '../hooks/useVideoKeyboardShortcuts';
import { getAvailableQualities, getVideoUrlFromFile, SPEED_OPTIONS } from '../utils/videoHelpers';
import VideoControls from './video/VideoControls';
import PlayPauseOverlay from './video/PlayPauseOverlay';
import KeyboardShortcutsOverlay from './video/KeyboardShortcutsOverlay';

/**
 * Main video player component
 * @param {Object} video - Video metadata object
 */
const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Get available qualities
  const qualityKeys = getAvailableQualities(video.videoFile);

  // Get video URL
  const videoUrl = getVideoUrlFromFile(video.videoFile, selectedQuality, qualityKeys);

  // Use video player hook
  const {
    isPlaying,
    showPlayButton,
    togglePlayPause,
    toggleFullscreen,
    handlePlayPauseClick,
    handleDoubleClick
  } = useVideoPlayer(videoRef, videoUrl);

  // Handle speed change
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Set playback speed when video loads
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.playbackRate = playbackSpeed;
    }
  }, [videoUrl, playbackSpeed]);

  // Setup keyboard shortcuts
  useVideoKeyboardShortcuts(
    videoRef,
    { togglePlayPause, toggleFullscreen, handleSpeedChange },
    playbackSpeed,
    SPEED_OPTIONS,
    setShowShortcuts,
    showShortcuts
  );

  // Show error if no video URL
  if (!videoUrl) {
    return (
      <div className="relative w-full aspect-video bg-dark-800 rounded-none sm:rounded-md overflow-hidden flex items-center justify-center">
        <p className="text-gray-400 text-sm">Video not available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-none sm:rounded-md overflow-hidden group">
      <div className="relative">
        {/* Hide native controls play button */}
        <style>{`
          video::-webkit-media-controls-overlay-play-button {
            display: none;
          }
          video::-webkit-media-controls-start-playback-button {
            display: none;
          }
        `}</style>

        {/* Video element */}
        <video
          ref={videoRef}
          key={videoUrl}
          className="w-full aspect-video"
          controls
          preload="metadata"
          playsInline
          src={videoUrl}
          onDoubleClick={handleDoubleClick}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause overlay */}
        <PlayPauseOverlay
          isPlaying={isPlaying}
          showButton={showPlayButton}
          onClick={handlePlayPauseClick}
          onDoubleClick={handleDoubleClick}
        />

        {/* Settings controls (Quality & Speed) */}
        <VideoControls
          qualities={qualityKeys}
          selectedQuality={selectedQuality || qualityKeys[0]}
          onQualityChange={setSelectedQuality}
          playbackSpeed={playbackSpeed}
          onSpeedChange={handleSpeedChange}
          isPlaying={isPlaying}
        />

        {/* Keyboard shortcuts overlay */}
        <KeyboardShortcutsOverlay
          show={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
