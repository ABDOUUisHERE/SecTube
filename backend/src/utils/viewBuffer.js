import redis from '../config/redis.js';
import Video from '../models/Video.js';

const BUFFER_PREFIX = 'views:buffer:';
const DEDUP_PREFIX  = 'views:dedup:';
const DEDUP_TTL     = 60; // seconds — matches the existing 1-minute cooldown

/**
 * Returns true if this view should be counted (first view in the cooldown window).
 * Uses Redis SET NX EX to atomically check-and-set in one round-trip,
 * replacing the previous View.findOne() MongoDB query.
 * Falls back to false (always count) when Redis is unavailable.
 */
export const isDuplicateView = async (videoId, userId, ip) => {
  if (!redis) return false;
  const key = `${DEDUP_PREFIX}${videoId}:${userId || ip}`;
  try {
    const result = await redis.set(key, '1', 'NX', 'EX', DEDUP_TTL);
    return result === null; // null = key already existed = duplicate
  } catch {
    return false;
  }
};

/**
 * Increment the in-Redis view buffer for a video.
 * Returns true if buffered, false if Redis unavailable (caller should write directly).
 */
export const bufferView = async (videoId) => {
  if (!redis) return false;
  try {
    await redis.incr(`${BUFFER_PREFIX}${videoId}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Flush all buffered view counts to MongoDB.
 * Called on a recurring interval from server.js.
 */
export const flushViewBuffer = async () => {
  if (!redis) return;
  try {
    const keys = await redis.keys(`${BUFFER_PREFIX}*`);
    if (!keys.length) return;

    await Promise.all(keys.map(async (key) => {
      const count = parseInt(await redis.getdel(key), 10);
      if (!count || count <= 0) return;
      const videoId = key.slice(BUFFER_PREFIX.length);
      await Video.findByIdAndUpdate(videoId, { $inc: { views: count } });
    }));
  } catch (err) {
    console.error('View buffer flush error:', err.message);
  }
};
