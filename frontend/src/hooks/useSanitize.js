import { useMemo } from 'react';
import sanitize from '../utils/sanitize';

/**
 * Hook to sanitize content
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export const useSanitize = (content) => {
  return useMemo(() => sanitize(content), [content]);
};

export default useSanitize;
