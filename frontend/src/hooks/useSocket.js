import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';
import useNotificationStore from '../store/notificationStore';
import { messageAPI } from '../services/api';

const SOCKET_URL = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// Module-level singletons
let socketInstance = null;
let onMessageHandler = null;

const attachListeners = (socket, setUnreadCount, incrementNotif) => {
  socket.off('message:receive');
  socket.off('notification:receive');

  socket.on('message:receive', (message) => {
    messageAPI.getUnreadCount()
      .then((r) => setUnreadCount(r.data.data))
      .catch(() => {});
    onMessageHandler?.(message);
  });

  socket.on('notification:receive', (notif) => {
    // notif.count is the grouped count; increment by the delta (1 for new, or just increment)
    incrementNotif(notif?.count ?? 1);
  });
};

export const useSocket = () => {
  const { isAuthenticated, token } = useAuthStore();
  const { setUnreadCount } = useMessageStore();
  const { increment: incrementNotif } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }
      onMessageHandler = null;
      return;
    }

    if (socketInstance?.connected) {
      attachListeners(socketInstance, setUnreadCount, incrementNotif);
      return;
    }

    if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      transports: ['websocket'],
    });

    attachListeners(socketInstance, setUnreadCount, incrementNotif);

    socketInstance.on('reconnect', () => {
      attachListeners(socketInstance, setUnreadCount, incrementNotif);
    });
  }, [isAuthenticated, token, setUnreadCount, incrementNotif]);

  const setOnMessage = useCallback((fn) => { onMessageHandler = fn; }, []);

  const sendMessage = useCallback((receiverId, content, ack) => {
    if (!socketInstance?.connected) {
      ack?.({ success: false, message: 'Not connected to server. Please try again.' });
      return;
    }
    socketInstance.emit('message:send', { receiverId, content }, ack);
  }, []);

  const setFocusedConversation = useCallback((userId) => {
    socketInstance?.emit('conversation:focus', userId ?? null);
  }, []);

  return { sendMessage, setOnMessage, setFocusedConversation };
};
