const CACHE_PREFIX = "giv:cache:";
export const DEFAULT_TTL = 300_000; // 5分

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export function getCache<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const raw = localStorage.getItem(cacheKey);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as unknown;
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof (entry as { timestamp?: unknown }).timestamp !== "number"
    ) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    const cacheEntry = entry as CacheEntry<T>;
    if (Date.now() - cacheEntry.timestamp > ttl) return null;
    return cacheEntry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
}

export function clearCache(key: string): void {
  localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

export function clearAllCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) keysToRemove.push(k);
  }
  for (const k of keysToRemove) {
    localStorage.removeItem(k);
  }
}
