import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import { createNotification } from './controllers/notificationController.js';

// userId -> socketId
const onlineUsers = new Map();
let ioInstance = null;

export const emitToUser = (userId, event, data) => {
  const socketId = onlineUsers.get(String(userId));
  if (socketId && ioInstance) ioInstance.to(socketId).emit(event, data);
};

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Auth middleware
  ioInstance.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.isBlocked) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = String(socket.user._id);
    onlineUsers.set(userId, socket.id);
    socket.focusedConversation = null;

    // Client tells us which conversation they have open (null = none)
    socket.on('conversation:focus', (otherUserId) => {
      socket.focusedConversation = otherUserId ? String(otherUserId) : null;
    });

    socket.on('message:send', async ({ receiverId, content }, ack) => {
      try {
        if (!content?.trim() || String(receiverId) === userId) return;

        const message = await Message.create({
          sender:   socket.user._id,
          receiver: receiverId,
          content:  content.trim(),
        });

        const populated = await message.populate([
          { path: 'sender',   select: 'username displayName avatar' },
          { path: 'receiver', select: 'username displayName avatar' },
        ]);

        // Deliver to recipient if online
        emitToUser(String(receiverId), 'message:receive', populated);

        // Skip notification if recipient currently has this conversation open
        const recipientSocketId = onlineUsers.get(String(receiverId));
        const recipientSocket = recipientSocketId ? ioInstance.sockets.sockets.get(recipientSocketId) : null;
        const recipientFocused = recipientSocket?.focusedConversation === userId;

        if (!recipientFocused) {
          createNotification({
            recipient:   receiverId,
            type:        'message',
            actor:       { _id: socket.user._id, username: socket.user.username, displayName: socket.user.displayName, avatar: socket.user.avatar },
            entityId:    message._id,
            entityType:  'message',
            entityTitle: content.trim().slice(0, 60),
          });
        }

        // Confirm back to sender
        ack?.({ success: true, data: populated });
      } catch (err) {
        ack?.({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
    });
  });

  return ioInstance;
};
