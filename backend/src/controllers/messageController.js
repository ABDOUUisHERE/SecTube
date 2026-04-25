import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    if (String(receiverId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    const receiver = await User.findById(receiverId).select('_id');
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    const populated = await message.populate([
      { path: 'sender',   select: 'username displayName avatar' },
      { path: 'receiver', select: 'username displayName avatar' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$sender', '$receiver'] },
              { a: '$sender', b: '$receiver' },
              { a: '$receiver', b: '$sender' },
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'receiverInfo',
        },
      },
    ]);

    // Shape: expose the "other user" per conversation
    const result = conversations.map((c) => {
      const sender   = c.senderInfo[0];
      const receiver = c.receiverInfo[0];
      const other    = String(sender?._id) === String(userId) ? receiver : sender;
      return {
        otherUser:   other,
        lastMessage: c.lastMessage,
        unread:      c.unread,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/:userId
export const getThread = async (req, res) => {
  try {
    const me     = req.user._id;
    const other  = req.params.userId;
    const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before; // oldest message _id cursor

    const match = {
      $or: [
        { sender: me,    receiver: other },
        { sender: other, receiver: me },
      ],
    };

    if (before) {
      const cursor = await Message.findById(before).select('createdAt').lean();
      if (cursor) match.createdAt = { $lt: cursor.createdAt };
    }

    const messages = await Message.find(match)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('sender',   'username displayName avatar')
      .populate('receiver', 'username displayName avatar');

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    res.json({ success: true, data: messages.reverse(), hasMore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/messages/:userId/read
export const markRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, read: false });
    res.json({ success: true, data: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
