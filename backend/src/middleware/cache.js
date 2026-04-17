import redis from '../config/redis.js';

/**
 * Response cache middleware.
 * @param {number} ttl - Cache TTL in seconds
 */
export const cacheMiddleware = (ttl = 30) => async (req, res, next) => {
  if (!redis) return next();

  const key = `cache:${req.originalUrl}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        redis.setex(key, ttl, JSON.stringify(data)).catch(() => {});
      }
      return originalJson(data);
    };
  } catch {
    // Redis failure — serve uncached
  }
  next();
};

/**
 * Delete a specific cache key or a pattern (e.g. 'cache:/api/videos*').
 */
export const invalidateCache = async (keyOrPattern) => {
  if (!redis) return;
  try {
    if (keyOrPattern.includes('*')) {
      const keys = await redis.keys(keyOrPattern);
      if (keys.length) await redis.del(...keys);
    } else {
      await redis.del(keyOrPattern);
    }
  } catch {}
};
