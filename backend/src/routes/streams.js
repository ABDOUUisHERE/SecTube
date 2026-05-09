import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createStream,
  getLiveStreams,
  getFollowingLive,
  getMyStreams,
  getStream,
  updateStream,
  endStream,
  regenerateKey,
} from '../controllers/streamController.js';

const router = express.Router();

router.get('/live',        getLiveStreams);
router.get('/following',   protect, getFollowingLive);
router.get('/mine',        protect, getMyStreams);
router.post('/',           protect, createStream);
router.get('/:streamId',   getStream);
router.put('/:streamId',               protect, updateStream);
router.put('/:streamId/end',           protect, endStream);
router.put('/:streamId/regenerate-key', protect, regenerateKey);

export default router;
