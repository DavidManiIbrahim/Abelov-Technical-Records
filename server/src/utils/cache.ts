import Redis from "ioredis";
import { logger } from "../middlewares/logger";

let redis: Redis | null = null;
let redisConnected = false;

const memoryCache = new Map<string, { value: string; expiry: number }>();
const DEFAULT_TTL = 60;

export const initCache = async (redisUrl?: string) => {
  if (redisUrl) {
    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      await redis.connect();
      redisConnected = true;
      logger.info("Redis connected");
      return;
    } catch (err) {
      logger.warn({ err }, "Redis unavailable, using in-memory cache");
      redis = null;
      redisConnected = false;
    }
  } else {
    logger.info("No REDIS_URL provided, using in-memory cache");
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (redisConnected && redis) {
    try {
      const val = await redis.get(key);
      if (val) return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
};

export const setCache = async <T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> => {
  const data = JSON.stringify(value);
  if (redisConnected && redis) {
    try {
      await redis.setex(key, ttlSeconds, data);
      return;
    } catch {
      // fall through to memory
    }
  }
  memoryCache.set(key, { value: data, expiry: Date.now() + ttlSeconds * 1000 });
};

export const delCache = async (key: string): Promise<void> => {
  if (redisConnected && redis) {
    try {
      await redis.del(key);
    } catch { /* ignore */ }
  }
  memoryCache.delete(key);
};

export const delCachePattern = async (pattern: string): Promise<void> => {
  if (redisConnected && redis) {
    try {
      const stream = redis.scanStream({ match: pattern, count: 100 });
      for await (const keys of stream) {
        if (keys.length) await redis.del(...keys);
      }
    } catch { /* ignore */ }
  }
  const prefix = pattern.replace("*", "");
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
};

export const closeCache = async () => {
  if (redis) {
    try {
      await redis.quit();
    } catch { /* ignore */ }
    redis = null;
    redisConnected = false;
  }
  memoryCache.clear();
};
