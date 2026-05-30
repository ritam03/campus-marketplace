import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Redis using the REDIS_URL environment variable provided by Railway
// Fallback to local Redis for local testing if needed
const redisUrl = process.env.REDIS_URL;

let redisClient = null;

if (redisUrl) {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
  });
} else {
  console.warn('⚠️ REDIS_URL is not set. Caching and advanced rate limiting will be disabled or run in memory.');
}

export default redisClient;
