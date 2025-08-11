const Redis = require('ioredis');

let redisClient = null;

// Only connect to Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
    try {
        redisClient = new Redis(process.env.REDIS_URL);
        
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
            // Don't crash the app, just log the error
        });

        redisClient.on('connect', () => {
            console.log('Connected to Redis successfully');
        });
    } catch (error) {
        console.warn('Failed to initialize Redis client:', error.message);
        redisClient = null;
    }
} else {
    console.log('No REDIS_URL provided, running without Redis');
}

module.exports = redisClient; 