const redis = require("redis");

let client;

const getRedisClient = async () => {
    if (client && client.isReady) {
        return client;
    }

    // Supports REDIS_URL (e.g. Upstash rediss://... TLS URL) or host/port for local dev
    if (process.env.REDIS_URL) {
        client = redis.createClient({ url: process.env.REDIS_URL });
    } else {
        client = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || "localhost",
                port: parseInt(process.env.REDIS_PORT) || 6379,
            },
        });
    }

    client.on("error", (err) => {
        console.warn("Redis connection error (caching disabled):", err.message);
        client = null;
    });

    client.on("ready", () => {
        console.log("Redis connected - caching enabled ✓");
    });

    try {
        await client.connect();
    } catch (err) {
        console.warn("Could not connect to Redis. Skipping cache:", err.message);
        client = null;
    }

    return client;
};

module.exports = { getRedisClient };
