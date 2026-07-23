import { kv } from '@vercel/kv';

// Cache helper functions
export const cache = {
    // Get cached data
    get: async (key) => {
        try {
            const data = await kv.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    },
    
    // Set cache with TTL (seconds)
    set: async (key, data, ttl = 300) => {
        try {
            await kv.set(key, JSON.stringify(data), { ex: ttl });
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Delete cache
    delete: async (key) => {
        try {
            await kv.del(key);
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Generate cache key from request
    key: (req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        return `cache:${url.pathname}${url.search}`;
    },
    
    // Clear pattern
    clearPattern: async (pattern) => {
        try {
            const keys = await kv.keys(pattern);
            if (keys.length > 0) {
                await kv.del(...keys);
            }
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Middleware to cache responses
export function withCache(ttl = 300) {
    return async (req, res, next) => {
        const cacheKey = cache.key(req);
        
        // Try to get from cache
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        
        // Store original json method
        const originalJson = res.json;
        res.json = function(data) {
            // Cache the response
            if (res.statusCode === 200) {
                cache.set(cacheKey, data, ttl);
            }
            originalJson.call(this, data);
        };
        
        next();
    };
}
