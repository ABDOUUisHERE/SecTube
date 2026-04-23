import { FaExclamationTriangle } from 'react-icons/fa';
import Z_INDEX from '../config/zIndex';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  type = 'danger',
  showInput = false,
  inputValue = '',
  onInputChange = () => {},
  inputPlaceholder = 'Enter value...',
  inputType = 'text'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 border-red-700',
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-700',
    },
    info: {
      icon: 'text-primary-500',
      button: 'bg-primary-600 hover:bg-primary-700 border-primary-700',
    },
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div
      className="fixed flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50"
      onClick={onClose}
      style={{
        top: '-50px',
        left: '-50px',
        right: '-50px',
        bottom: '-50px',
        zIndex: Z_INDEX.MODAL_OVERLAY,
        position: 'fixed',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div
        className="bg-dark-900 border border-dark-700 rounded-lg shadow-2xl w-[90%] sm:w-full max-w-sm sm:max-w-md p-4 sm:p-5 animate-fadeIn mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <FaExclamationTriangle className={`${styles.icon} flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5`} />
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{message}</p>
          </div>
        </div>

        {showInput && (
          <div className="mt-3 sm:mt-4 px-0 sm:px-1">
            <input
              type={inputType}
              autoFocus
              className="w-full bg-dark-950 border border-dark-700 rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary-500 transition-all"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end mt-4 sm:mt-5">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md font-medium transition text-xs sm:text-sm border border-dark-700"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm(inputValue);
              onClose();
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 ${styles.button} text-white rounded-md font-medium transition text-xs sm:text-sm border shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
