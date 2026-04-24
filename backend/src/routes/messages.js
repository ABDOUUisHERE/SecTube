import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getConversations,
  getThread,
  markRead,
  getUnreadCount,
} from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);

router.get('/unread-count',   getUnreadCount);
router.get('/conversations',  getConversations);
router.get('/:userId',        getThread);
router.post('/',              sendMessage);
router.put('/:userId/read',   markRead);

export default router;
