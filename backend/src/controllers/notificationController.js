import Notification from '../models/Notification.js';
import { emitToUser } from '../socket.js';

// Create & emit a notification (called internally by other controllers)
export const createNotification = async ({ recipient, type, actor, entityId, entityType, entityTitle }) => {
  try {
    if (String(recipient) === String(actor._id)) return; // never notify yourself

    // For messages: upsert — increment count on existing unread notification from same sender
    if (type === 'message') {
      const existing = await Notification.findOneAndUpdate(
        { recipient, type: 'message', 'actor._id': actor._id, read: false },
        { $inc: { count: 1 }, $set: { entityTitle, updatedAt: new Date() } },
        { new: true }
      );
      if (existing) {
        emitToUser(String(recipient), 'notification:receive', existing);
        return;
      }
    }

    const notif = await Notification.create({ recipient, type, actor, entityId, entityType, entityTitle });
    emitToUser(String(recipient), 'notification:receive', notif);
  } catch {
    // non-critical — don't let notification failure break the main action
  }
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(30);
    // Sum counts of unread notifications (grouped messages count as their count value)
    const unreadNotifs = await Notification.find({ recipient: req.user._id, read: false }).select('count');
    const unread = unreadNotifs.reduce((sum, n) => sum + (n.count || 1), 0);
    res.json({ success: true, data: notifications, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ success: true, data: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
