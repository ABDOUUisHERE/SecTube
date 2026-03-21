import { useEffect } from 'react';

/**
 * Custom hook for video player keyboard shortcuts
 * @param {Object} playerRef - Video.js player instance ref
 * @param {Object} controls - Player control functions
 */
export const useKeyboardShortcuts = (playerRef, controls) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const player = playerRef.current;
      if (!player) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          controls.togglePlayPause();
          break;

        case 'f':
          e.preventDefault();
          controls.toggleFullscreen();
          break;

        case 'm':
          e.preventDefault();
          controls.toggleMute();
          break;

        case 'arrowleft':
          e.preventDefault();
          controls.seek(Math.max(0, player.currentTime() - 5));
          break;

        case 'arrowright':
          e.preventDefault();
          controls.seek(Math.min(player.duration(), player.currentTime() + 5));
          break;

        case 'arrowup':
          e.preventDefault();
          controls.setVolume(Math.min(1, player.volume() + 0.1));
          break;

        case 'arrowdown':
          e.preventDefault();
          controls.setVolume(Math.max(0, player.volume() - 0.1));
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [playerRef, controls]);
};
