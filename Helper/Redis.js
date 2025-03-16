const redis = require("redis");

// Get Redis URL from Render
const REDIS_URL = process.env.REDIS_URL || "redis://red-cvbac8tsvqrc73c55860:6379";

// Create Redis client
const redisClient = redis.createClient({
    url: REDIS_URL,
    socket: {
        tls: true,  // Enable TLS for secure connection
        rejectUnauthorized: false,  // Avoid self-signed certificate issues
    }
});

// Handle Redis connection
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis Error:", err));

// Connect to Redis
(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;
