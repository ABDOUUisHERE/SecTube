import { FaTimes } from 'react-icons/fa';

/**
 * Keyboard shortcuts help overlay
 * @param {boolean} show - Whether to show the overlay
 * @param {Function} onClose - Close handler
 */
const KeyboardShortcutsOverlay = ({ show, onClose }) => {
  if (!show) return null;

  const shortcuts = [
    {
      category: 'Playback',
      items: [
        { keys: ['Space', 'K'], description: 'Play / Pause' },
        { keys: ['←', 'J'], description: 'Seek backward 5 seconds' },
        { keys: ['→', 'L'], description: 'Seek forward 5 seconds' },
        { keys: ['0', 'Home'], description: 'Jump to beginning' },
        { keys: ['End'], description: 'Jump to end' },
        { keys: ['1-9'], description: 'Jump to 10%-90%' },
      ]
    },
    {
      category: 'Audio',
      items: [
        { keys: ['M'], description: 'Mute / Unmute' },
        { keys: ['↑'], description: 'Volume up' },
        { keys: ['↓'], description: 'Volume down' },
      ]
    },
    {
      category: 'Display',
      items: [
        { keys: ['F'], description: 'Fullscreen' },
        { keys: ['Esc'], description: 'Exit fullscreen / Close help' },
      ]
    },
    {
      category: 'Speed',
      items: [
        { keys: ['<', ','], description: 'Decrease speed' },
        { keys: ['>', '.'], description: 'Increase speed' },
      ]
    },
    {
      category: 'Help',
      items: [
        { keys: ['?'], description: 'Show / Hide shortcuts' },
      ]
    }
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-900 border border-dark-700 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-dark-800 rounded"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 bg-dark-800 border border-dark-700 rounded text-xs font-mono text-gray-200 min-w-[32px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-dark-700 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-2 py-1 bg-dark-800 border border-dark-700 rounded text-xs font-mono text-gray-300">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsOverlay;
