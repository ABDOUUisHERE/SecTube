import Redis from 'ioredis';

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    commandTimeout: 2000,
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.warn('⚠️  Redis error (degraded mode):', err.message));
} else {
  console.warn('⚠️  REDIS_URL not set — caching and view buffering disabled');
}

export default redis;
