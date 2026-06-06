import { createClient } from "redis";
import { config } from "../config";

export const redisClient = createClient({
    socket: {
    host: process.env.REDIS_HOST || "freelancecollab.com",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
  password: process.env.REDIS_PASSWORD || 'thlukumar',
});

redisClient.on("error", (error: unknown) => {
  console.error("Redis client error", error);
});

redisClient.on("connect", () => {
  console.log("✅ Redis client connected");
});

export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
}

export async function disconnectRedis() {
  try {
    await redisClient.disconnect();
    console.log("Redis client disconnected");
  } catch (error) {
    console.error("Failed to disconnect from Redis:", error);
  }
}

// Redis utility functions
export async function setCache(key: string, value: unknown, expiryInSeconds: number = 3600) {
  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    if (expiryInSeconds > 0) {
      await redisClient.setEx(key, expiryInSeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
  } catch (error) {
    console.error(`Error setting cache key ${key}:`, error);
  }
}

export async function getCache(key: string) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting cache key ${key}:`, error);
    return null;
  }
}

export async function deleteCache(key: string) {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Error deleting cache key ${key}:`, error);
  }
}

export async function flushCache() {
  try {
    await redisClient.flushDb();
    console.log("Redis cache flushed");
  } catch (error) {
    console.error("Error flushing Redis cache:", error);
  }
}

export async function getCacheWithPattern(pattern: string) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return {};

    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = await getCache(key);
    }
    return result;
  } catch (error) {
    console.error(`Error getting cache with pattern ${pattern}:`, error);
    return {};
  }
}
