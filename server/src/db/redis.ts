// Redis 缓存连接
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function initRedis(): Promise<RedisClientType | null> {
  try {
    redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });
    
    await redisClient.connect();
    console.log('[Redis] Connected');
    return redisClient;
  } catch (error) {
    console.error('[Redis] Connection failed:', error);
    return null;
  }
}

export function getRedis(): RedisClientType | null {
  return redisClient;
}
