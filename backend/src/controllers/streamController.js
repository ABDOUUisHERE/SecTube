import crypto from 'crypto';
import Stream from '../models/Stream.js';

// POST /api/streams
export const createStream = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    const stream = await Stream.create({
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'Tutorial',
      streamer: req.user._id,
      streamKey: crypto.randomBytes(16).toString('hex'),
    });

    const populated = await stream.populate('streamer', 'username displayName avatar channelName');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/streams/following  (protected — live streams from people you follow)
export const getFollowingLive = async (req, res) => {
  try {
    const followingIds = req.user.subscribedTo ?? [];
    const streams = await Stream.find({ status: 'live', streamer: { $in: followingIds } })
      .populate('streamer', 'username displayName avatar channelName')
      .sort({ viewerCount: -1 });
    res.json({ success: true, data: streams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/streams/live
export const getLiveStreams = async (req, res) => {
  try {
    const streams = await Stream.find({ status: 'live' })
      .populate('streamer', 'username displayName avatar channelName')
      .sort({ viewerCount: -1 })
      .limit(20);
    res.json({ success: true, data: streams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/streams/mine
export const getMyStreams = async (req, res) => {
  try {
    const streams = await Stream.find({ streamer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: streams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/streams/:streamId
export const getStream = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.streamId)
      .populate('streamer', 'username displayName avatar channelName');
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.json({ success: true, data: stream });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/streams/:streamId
export const updateStream = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const stream = await Stream.findOneAndUpdate(
      { _id: req.params.streamId, streamer: req.user._id },
      { ...(title && { title: title.trim() }), ...(description !== undefined && { description }), ...(category && { category }) },
      { new: true }
    );
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.json({ success: true, data: stream });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/streams/:streamId/end
export const endStream = async (req, res) => {
  try {
    const stream = await Stream.findOneAndUpdate(
      { _id: req.params.streamId, streamer: req.user._id },
      { status: 'ended', endedAt: new Date() },
      { new: true }
    );
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.json({ success: true, data: stream });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/streams/:streamId/regenerate-key
export const regenerateKey = async (req, res) => {
  try {
    const stream = await Stream.findOneAndUpdate(
      { _id: req.params.streamId, streamer: req.user._id, status: { $ne: 'live' } },
      { streamKey: crypto.randomBytes(16).toString('hex') },
      { new: true }
    );
    if (!stream) return res.status(400).json({ success: false, message: 'Stream not found or currently live' });
    res.json({ success: true, data: stream });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
