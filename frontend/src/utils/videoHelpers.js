import { getVideoUrl } from '../config/constants';

/**
 * Get available quality levels from video file data
 * @param {Object} videoFile - Video file object with processedPaths
 * @returns {Array} Sorted array of quality keys
 */
export const getAvailableQualities = (videoFile) => {
  const qualities = videoFile?.processedPaths || {};
  return Object.keys(qualities)
    .filter(q => q !== 'original')
    .sort((a, b) => {
      const getHeight = (q) => parseInt(q) || 9999;
      return getHeight(b) - getHeight(a);
    });
};

/**
 * Format quality label for display
 * @param {string} quality - Quality key (e.g., "1080p")
 * @returns {string} Formatted label
 */
export const formatQualityLabel = (quality) => {
  const height = parseInt(quality);
  if (height >= 1080) return `${quality} (Full HD)`;
  if (height >= 720) return `${quality} (HD)`;
  return quality;
};

/**
 * Get video URL from video file data and selected quality
 * @param {Object} videoFile - Video file object
 * @param {string} selectedQuality - Selected quality level
 * @param {Array} qualityKeys - Available quality keys
 * @returns {string|null} Video URL or null
 */
export const getVideoUrlFromFile = (videoFile, selectedQuality, qualityKeys) => {
  const qualities = videoFile?.processedPaths || {};
  const defaultQuality = selectedQuality || qualityKeys[0];
  const videoPath = defaultQuality
    ? qualities[defaultQuality]
    : videoFile?.originalPath;

  if (!videoPath) return null;

  // If it's already a full URL (Cloudinary), use as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    return videoPath;
  }

  // Otherwise, prepend backend URL
  return getVideoUrl(videoPath.startsWith('/') ? videoPath : `/videos/${videoPath}`);
};

/**
 * Available playback speed options
 */
export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
