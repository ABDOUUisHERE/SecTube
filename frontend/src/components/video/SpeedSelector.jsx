import { useState, useRef, useEffect } from 'react';
import { FaTachometerAlt, FaCheck } from 'react-icons/fa';

/**
 * Playback speed selector dropdown component
 * @param {number} playbackSpeed - Current playback speed
 * @param {Function} onSpeedChange - Callback when speed is changed
 */
const SpeedSelector = ({ playbackSpeed, onSpeedChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

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

  const handleSpeedSelect = (speed) => {
    onSpeedChange(speed);
    setShowMenu(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-black bg-opacity-80 hover:bg-opacity-90 text-white px-3 py-1.5 rounded-md text-sm font-medium transition border border-gray-700 shadow-lg backdrop-blur-sm"
        title="Playback speed"
      >
        <FaTachometerAlt size={14} />
        <span>{playbackSpeed}x</span>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-1 w-28 bg-dark-900 rounded border border-dark-700 py-1 z-50">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedSelect(speed)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-dark-800 transition text-left text-xs"
            >
              <span
                className={`${
                  playbackSpeed === speed
                    ? 'text-primary-400'
                    : 'text-gray-300'
                }`}
              >
                {speed === 1 ? 'Normal' : `${speed}x`}
              </span>
              {playbackSpeed === speed && (
                <FaCheck size={10} className="text-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeedSelector;
