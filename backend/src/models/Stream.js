import mongoose from 'mongoose';
import crypto from 'crypto';

const streamSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  category: {
    type: String,
    enum: ['Web Application Security', 'Network Security', 'Bug Bounty', 'Penetration Testing',
           'Malware Analysis', 'Reverse Engineering', 'Mobile Security', 'Cloud Security',
           'CTF Writeup', 'OSINT', 'Cryptography', 'IoT Security', 'Security Tools', 'Tutorial', 'Other'],
    default: 'Tutorial',
  },
  streamer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  streamKey:    { type: String, unique: true },
  status:       { type: String, enum: ['offline', 'live', 'ended'], default: 'offline' },
  source:       { type: String, enum: ['rtmp', 'browser'], default: 'rtmp' },
  viewerCount:  { type: Number, default: 0 },
  peakViewers:  { type: Number, default: 0 },
  thumbnail:    String,
  startedAt:    Date,
  endedAt:      Date,
}, { timestamps: true });

streamSchema.pre('save', function (next) {
  if (!this.streamKey) this.streamKey = crypto.randomBytes(16).toString('hex');
  next();
});

streamSchema.index({ status: 1, createdAt: -1 });
streamSchema.index({ streamer: 1 });

export default mongoose.model('Stream', streamSchema);
