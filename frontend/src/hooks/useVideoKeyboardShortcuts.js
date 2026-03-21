import { useEffect } from 'react';

/**
 * Custom hook for video player keyboard shortcuts
 * @param {Object} videoRef - Video element ref
 * @param {Object} handlers - Object containing handler functions
 * @param {Function} handlers.togglePlayPause - Play/pause handler
 * @param {Function} handlers.toggleFullscreen - Fullscreen handler
 * @param {Function} handlers.handleSpeedChange - Speed change handler
 * @param {number} playbackSpeed - Current playback speed
 * @param {Array} speedOptions - Available speed options
 * @param {Function} setShowShortcuts - Toggle shortcuts help
 * @param {boolean} showShortcuts - Current shortcuts help visibility
 */
export const useVideoKeyboardShortcuts = (
  videoRef,
  handlers,
  playbackSpeed,
  speedOptions,
  setShowShortcuts,
  showShortcuts
) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle if no input is focused
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      // Toggle shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
        return;
      }

      // Close shortcuts help on Escape
      if (e.key === 'Escape' && showShortcuts) {
        e.preventDefault();
        setShowShortcuts(false);
        return;
      }

      switch (e.key.toLowerCase()) {
        // Play/Pause
        case ' ':
        case 'k':
          e.preventDefault();
          handlers.togglePlayPause();
          break;

        // Fullscreen
        case 'f':
          e.preventDefault();
          handlers.toggleFullscreen();
          break;

        // Mute/Unmute
        case 'm':
          e.preventDefault();
          video.muted = !video.muted;
          break;

        // Seek backward 5 seconds
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;

        // Seek forward 5 seconds
        case 'arrowright':
        case 'l':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;

        // Volume up
        case 'arrowup':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;

        // Volume down
        case 'arrowdown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;

        // Jump to beginning
        case 'home':
        case '0':
          e.preventDefault();
          video.currentTime = 0;
          break;

        // Jump to end
        case 'end':
          e.preventDefault();
          video.currentTime = video.duration;
          break;

        // Jump to percentage (1-9 = 10%-90%)
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          video.currentTime = (video.duration * parseInt(e.key)) / 10;
          break;

        // Decrease playback speed
        case '<':
        case ',': {
          e.preventDefault();
          const slowerSpeed = speedOptions.reverse().find(s => s < playbackSpeed) || speedOptions[0];
          handlers.handleSpeedChange(slowerSpeed);
          speedOptions.reverse(); // Restore original order
          break;
        }

        // Increase playback speed
        case '>':
        case '.': {
          e.preventDefault();
          const fasterSpeed = speedOptions.find(s => s > playbackSpeed) || speedOptions[speedOptions.length - 1];
          handlers.handleSpeedChange(fasterSpeed);
          break;
        }

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [videoRef, handlers, playbackSpeed, speedOptions, showShortcuts, setShowShortcuts]);
};
