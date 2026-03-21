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
        className="flex items-center gap-2 bg-black bg-opacity-80 hover:bg-opacity-90 text-white px-3 py-1.5 rounded-md text-sm font-medium transition border border-gray-700 shadow-lg backdrop-blur-sm"
        title="Quality settings"
      >
        <FaCog size={14} />
        <span>{selectedQuality}</span>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-dark-900 rounded-md shadow-xl border border-dark-700 py-1.5 z-50">
          <div className="px-3 py-2 border-b border-dark-700">
            <p className="text-xs font-medium text-gray-400">Quality</p>
          </div>
          {qualities.map((quality) => (
            <button
              key={quality}
              onClick={() => handleQualitySelect(quality)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-dark-800 transition text-left text-sm"
            >
              <span
                className={`${
                  selectedQuality === quality
                    ? 'text-primary-400 font-medium'
                    : 'text-gray-300'
                }`}
              >
                {quality}
              </span>
              {selectedQuality === quality && (
                <FaCheck size={12} className="text-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualitySelector;
