import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import useToastStore from '../store/toastStore';
import Z_INDEX from '../config/zIndex';

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto sm:top-auto sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0 max-w-md space-y-2 pointer-events-none" style={{ zIndex: Z_INDEX.TOAST }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  useEffect(() => {
    // Start exit animation before auto-close
    if (toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);

      return () => clearTimeout(exitTimer);
    }
  }, [toast.duration]);

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle className={`text-green-500 ${iconClass}`} />;
      case 'error':
        return <FaExclamationCircle className={`text-red-500 ${iconClass}`} />;
      case 'warning':
        return <FaExclamationTriangle className={`text-yellow-500 ${iconClass}`} />;
      default:
        return <FaInfoCircle className={`text-primary-500 ${iconClass}`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-dark-900/95 border-green-500';
      case 'error':
        return 'bg-dark-900/95 border-red-500';
      case 'warning':
        return 'bg-dark-900/95 border-yellow-500';
      default:
        return 'bg-dark-900/95 border-primary-500';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg border shadow-xl w-full sm:min-w-[320px] transition-all duration-300 backdrop-blur-sm ${getBackgroundColor()} ${
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <p className="flex-1 text-sm text-gray-100 leading-relaxed">{toast.message}</p>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-200 transition flex-shrink-0 p-1.5 -mt-1 -mr-1 rounded hover:bg-white/10"
        aria-label="Close notification"
      >
        <FaTimes size={14} />
      </button>
    </div>
  );
};

export default Toast;
