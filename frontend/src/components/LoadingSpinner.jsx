import { FaShieldAlt } from 'react-icons/fa';

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Logo */}
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>

            {/* Middle pulsing ring */}
            <div className="absolute inset-2 w-20 h-20 border-4 border-primary-600/30 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

            {/* Center shield icon */}
            <div className="w-24 h-24 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-xl animate-pulse"></div>
                <FaShieldAlt className="relative text-primary-500 animate-pulse" size={32} />
              </div>
            </div>
          </div>

          {/* Loading text */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-bold text-lg tracking-wider">{message}</p>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline spinner
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaShieldAlt className="text-primary-500/50 animate-pulse" size={16} />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
