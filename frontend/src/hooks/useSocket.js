import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';
import { messageAPI } from '../services/api';

const SOCKET_URL = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// Module-level singletons — shared across every useSocket() call
let socketInstance = null;
let onMessageHandler = null; // only one active handler (Messages page or null)

const attachListeners = (socket, setUnreadCount) => {
  socket.off('message:receive'); // remove before re-attaching to avoid duplicates
  socket.on('message:receive', (message) => {
    // Always refresh from server — prevents drift and own-message false positives
    messageAPI.getUnreadCount()
      .then((r) => setUnreadCount(r.data.data))
      .catch(() => {});
    onMessageHandler?.(message);
  });
};

export const useSocket = () => {
  const { isAuthenticated, token } = useAuthStore();
  const { setUnreadCount } = useMessageStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }
      onMessageHandler = null;
      return;
    }

    if (socketInstance?.connected) {
      // Re-attach listeners so they capture the latest setUnreadCount
      attachListeners(socketInstance, setUnreadCount);
      return;
    }

    if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      transports: ['websocket'],
    });

    attachListeners(socketInstance, setUnreadCount);

    socketInstance.on('reconnect', () => {
      attachListeners(socketInstance, setUnreadCount);
    });
  }, [isAuthenticated, token, setUnreadCount]);

  // Register the active message handler (module-level, so Messages.jsx actually works)
  const setOnMessage = useCallback((fn) => {
    onMessageHandler = fn;
  }, []);

  const sendMessage = useCallback((receiverId, content, ack) => {
    if (!socketInstance?.connected) {
      ack?.({ success: false, message: 'Not connected to server. Please try again.' });
      return;
    }
    socketInstance.emit('message:send', { receiverId, content }, ack);
  }, []);

  return { sendMessage, setOnMessage };
};
