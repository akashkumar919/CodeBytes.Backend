import redisClient from "../config/redis.js"; // assuming your Redis client setup

const coolDown = async (req, res, next) => {
  const key = `cooldown:${req.ip}`;
  const ttl = await redisClient.ttl(key); // Get remaining time

  if (ttl > 0) {
    return res.status(429).json({
      error: `Please wait ${ttl} seconds before sending another request.`,
    });
  }

  // Set key with 10 seconds expiration
  await redisClient.set(key, "true", { EX: 10,NX:true }); // EX = expire in seconds

  next();
};

export default coolDown;