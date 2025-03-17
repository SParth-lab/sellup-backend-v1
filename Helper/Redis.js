const redis = require("redis");
 
//  const REDIS_URL = process.env.REDIS_URL || "redis://red-cvbac8tsvqrc73c55860:6379";
 const REDIS_URL = process.env.REDIS_URL;
 
 const client = redis.createClient({ url: REDIS_URL });
 
 // Handle errors properly
 client.on("connect", () => console.log("✅ Connected to Redis"));
 client.on("error", (err) => console.error("❌ Redis Error:", err));
 
 // Connect to Redis
 (async () => {
     try {
         await client.connect();
         console.log("🔗 Redis connection successful!");
     } catch (err) {
         console.error("🚨 Redis connection failed:", err);
     }
 })();
 
 module.exports = client;