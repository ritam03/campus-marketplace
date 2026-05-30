import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import { AppError } from '../utils/AppError.js';

// Define the rate limit rule: 100 requests per 15 minutes per IP
const windowMs = 15 * 60 * 1000;
const maxRequests = 100;

export const globalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Use Redis as the store if available, otherwise fallback to MemoryStore
  ...(redisClient && {
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
  }),

  // Custom handler when limit is exceeded
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP, please try again after 15 minutes', 429));
  }
});

// Stricter rate limiter for authentication routes (login/register) to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 login/register requests per window
  standardHeaders: true,
  legacyHeaders: false,
  
  ...(redisClient && {
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
  }),

  handler: (req, res, next) => {
    next(new AppError('Too many authentication attempts. Please try again in an hour.', 429));
  }
});
