// Note: Vercel KV is deprecated, using simple in-memory cache
// For production, use Upstash Redis from Vercel Marketplace

const cacheStore = new Map();

export const cache = {
    get: async (key) => {
        try {
            const data = cacheStore.get(key);
            if (data && data.expiry > Date.now()) {
                return data.value;
            }
            cacheStore.delete(key);
            return null;
        } catch (error) {
            return null;
        }
    },
    
    set: async (key, data, ttl = 300) => {
        try {
            cacheStore.set(key, {
                value: data,
                expiry: Date.now() + (ttl * 1000)
            });
            return true;
        } catch (error) {
            return false;
        }
    },
    
    delete: async (key) => {
        try {
            cacheStore.delete(key);
            return true;
        } catch (error) {
            return false;
        }
    },
    
    key: (req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        return `cache:${url.pathname}${url.search}`;
    },
    
    clearPattern: async (pattern) => {
        try {
            for (const key of cacheStore.keys()) {
                if (key.startsWith(pattern)) {
                    cacheStore.delete(key);
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    }
};
