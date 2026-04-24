import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';

// userId -> socketId
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
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

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    onlineUsers.set(userId, socket.id);

    // Notify sender's other tabs / presence updates if needed
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
        const recipientSocketId = onlineUsers.get(String(receiverId));
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message:receive', populated);
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

  return io;
};
