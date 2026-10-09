import Redis from "ioredis";
import { env } from "../config/env";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    throw new Error("Redis not initialized. Call connectRedis() first.");
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    lazyConnect: true,
    retryStrategy: () => null, // don't retry in dev if Redis is not running
  });

  redis.on("error", (err) => console.warn("Redis error:", err.message));
  redis.on("reconnecting", () => console.warn("Redis reconnecting..."));

  try {
    await redis.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    redis.disconnect();
    redis = null;
    throw err;
  }
}

export { redis };
