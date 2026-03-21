import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to manage video player state and controls
 * @param {Object} videoRef - Video element ref
 * @param {string} videoUrl - Current video URL
 * @returns {Object} Player state and control functions
 */
export const useVideoPlayer = (videoRef, videoUrl) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Track video play/pause state
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setTimeout(() => setShowPlayButton(false), 500);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowPlayButton(true);
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [videoRef, videoUrl]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handlePlayPauseClick = () => {
    togglePlayPause();
    setShowPlayButton(true);
    setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowPlayButton(false);
      }
    }, 500);
  };

  const handleDoubleClick = () => {
    toggleFullscreen();
  };

  return {
    isPlaying,
    showPlayButton,
    togglePlayPause,
    toggleFullscreen,
    handlePlayPauseClick,
    handleDoubleClick
  };
};
