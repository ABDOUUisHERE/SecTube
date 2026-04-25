import Notification from '../models/Notification.js';
import { emitToUser } from '../socket.js';

// Create & emit a notification (called internally by other controllers)
export const createNotification = async ({ recipient, type, actor, entityId, entityType, entityTitle }) => {
  try {
    if (String(recipient) === String(actor._id)) return; // never notify yourself
    const notif = await Notification.create({ recipient, type, actor, entityId, entityType, entityTitle });
    emitToUser(recipient, 'notification:receive', notif);
  } catch {
    // non-critical — don't let notification failure break the main action
  }
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unread = await Notification.countDocuments({ recipient: req.user._id, read: false });
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
