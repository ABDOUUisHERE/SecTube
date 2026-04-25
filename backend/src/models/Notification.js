import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:        { type: String, enum: ['comment', 'reply', 'subscribe', 'message'], required: true },
  actor:       {
    _id:         mongoose.Schema.Types.ObjectId,
    username:    String,
    displayName: String,
    avatar:      String,
  },
  entityId:    mongoose.Schema.Types.ObjectId,
  entityType:  { type: String, enum: ['video', 'comment', 'message'] },
  entityTitle: String,
  read:        { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
