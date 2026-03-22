import { useState, useRef, useEffect } from 'react';
import { FaCog, FaCheck } from 'react-icons/fa';

/**
 * Quality selector dropdown component
 * @param {Object} props
 * @param {string[]} props.qualities - Array of available quality levels
 * @param {string} props.selectedQuality - Currently selected quality
 * @param {Function} props.onQualityChange - Callback when quality is changed
 */
const QualitySelector = ({ qualities, selectedQuality, onQualityChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const formatQualityLabel = (quality) => {
    const height = parseInt(quality);
    if (height >= 1080) return `${quality} (Full HD)`;
    if (height >= 720) return `${quality} (HD)`;
    return quality;
  };

  const handleQualitySelect = (quality) => {
    onQualityChange(quality);
    setShowMenu(false);
  };

  if (qualities.length === 0) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 sm:gap-1.5 bg-black bg-opacity-80 hover:bg-opacity-90 active:bg-opacity-95 text-white px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition border border-gray-700 shadow-lg backdrop-blur-sm min-h-[28px] sm:min-h-[36px]"
        title="Quality settings"
      >
        <FaCog size={11} className="sm:w-[13px] sm:h-[13px]" />
        <span>{selectedQuality}</span>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-1 w-20 sm:w-28 bg-dark-900 rounded border border-dark-700 py-1 z-50 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-dark-900">
          {qualities.map((quality) => (
            <button
              key={quality}
              onClick={() => handleQualitySelect(quality)}
              className="w-full flex items-center justify-between px-2 sm:px-2.5 py-1.5 sm:py-1.5 hover:bg-dark-800 active:bg-dark-700 transition text-left text-[10px] sm:text-xs min-h-[32px] sm:min-h-[36px]"
            >
              <span
                className={`${
                  selectedQuality === quality
                    ? 'text-primary-400'
                    : 'text-gray-300'
                }`}
              >
                {quality}
              </span>
              {selectedQuality === quality && (
                <FaCheck size={10} className="text-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualitySelector;
