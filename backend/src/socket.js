import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import Stream from './models/Stream.js';
import { createNotification } from './controllers/notificationController.js';

// userId -> socketId
const onlineUsers = new Map();
// streamId -> last 100 chat messages (in-memory replay buffer)
const chatHistory = new Map();
const CHAT_HISTORY_LIMIT = 100;
let ioInstance = null;

export const getIO = () => ioInstance;

export const clearChatHistory = (streamId) => chatHistory.delete(String(streamId));

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

    // ─── Messaging ────────────────────────────────────────────────────────────

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

        emitToUser(String(receiverId), 'message:receive', populated);

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

        ack?.({ success: true, data: populated });
      } catch (err) {
        ack?.({ success: false, message: err.message });
      }
    });

    // ─── Live Viewers ─────────────────────────────────────────────────────────

    socket.on('viewer:join', async ({ streamId }) => {
      socket.join(`stream:${streamId}`);
      socket.watchingStream = streamId;

      // Replay buffered chat messages to the joining viewer
      const history = chatHistory.get(String(streamId));
      if (history?.length) socket.emit('chat:history', history);

      const updated = await Stream.findByIdAndUpdate(
        streamId,
        { $inc: { viewerCount: 1 } },
        { new: true }
      ).catch(() => null);
      if (updated && updated.viewerCount > updated.peakViewers) {
        await Stream.findByIdAndUpdate(streamId, { peakViewers: updated.viewerCount });
      }
      ioInstance.to(`stream:${streamId}`).emit('viewer:count', { count: updated?.viewerCount ?? 0 });
    });

    socket.on('viewer:leave', async ({ streamId }) => {
      socket.leave(`stream:${streamId}`);
      socket.watchingStream = null;
      const updated = await Stream.findByIdAndUpdate(
        streamId,
        [{ $set: { viewerCount: { $max: [{ $subtract: ['$viewerCount', 1] }, 0] } } }],
        { new: true }
      ).catch(() => null);
      ioInstance.to(`stream:${streamId}`).emit('viewer:count', { count: updated?.viewerCount ?? 0 });
    });

    // ─── Live Chat ────────────────────────────────────────────────────────────

    socket.on('chat:message', ({ streamId, message }) => {
      if (!message?.trim()) return;
      const msg = {
        userId:      String(socket.user._id),
        username:    socket.user.username,
        displayName: socket.user.displayName,
        avatar:      socket.user.avatar,
        message:     message.trim().slice(0, 300),
        ts:          Date.now(),
      };
      // Buffer for replay
      if (!chatHistory.has(String(streamId))) chatHistory.set(String(streamId), []);
      const buf = chatHistory.get(String(streamId));
      buf.push(msg);
      if (buf.length > CHAT_HISTORY_LIMIT) buf.shift();

      ioInstance.to(`stream:${streamId}`).emit('chat:message', msg);
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      if (socket.watchingStream) {
        const updated = await Stream.findByIdAndUpdate(
          socket.watchingStream,
          [{ $set: { viewerCount: { $max: [{ $subtract: ['$viewerCount', 1] }, 0] } } }],
          { new: true }
        ).catch(() => null);
        if (updated) {
          ioInstance.to(`stream:${socket.watchingStream}`).emit('viewer:count', { count: updated.viewerCount });
        }
      }
    });
  });

  return ioInstance;
};
