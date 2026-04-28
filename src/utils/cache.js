class TTLCache {
  constructor(defaultTtlMs = 30_000) {
    this.store = new Map();
    this.defaultTtl = defaultTtlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtl) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(predicate) {
    if (typeof predicate !== 'function') {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (predicate(key)) this.store.delete(key);
    }
  }
}

const defaultInstance = new TTLCache(Number(process.env.CACHE_TTL_MS) || 30_000);

module.exports = defaultInstance;
module.exports.TTLCache = TTLCache;
