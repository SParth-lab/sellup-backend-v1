const redis = require("redis");

const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient({
    url: REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false,
        connectTimeout: 10000,
    }
});

client.on("connect", () => console.log("✅ Connected to Redis"));
client.on("error", (err) => console.error("❌ Redis Error:", err));

(async () => {
    try {
        await client.connect();
        console.log("🔗 Redis connection successful!");
    } catch (err) {
        console.error("🚨 Redis connection failed:", err);
    }
})();
