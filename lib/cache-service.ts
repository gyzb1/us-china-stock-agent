/**
 * 简单的内存缓存服务
 * 用于缓存 API 响应数据，减少重复请求
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // 默认缓存时间（毫秒）

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 默认5分钟
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（毫秒），不传则使用默认值
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果不存在或已过期则返回 null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 检查缓存是否存在且有效
   * @param key 缓存键
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除指定缓存
   * @param key 缓存键
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount
    };
  }

  /**
   * 获取缓存信息（包含剩余时间）
   * @param key 缓存键
   */
  getInfo(key: string) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const ttl = entry.expiresAt - now;
    const isExpired = ttl <= 0;

    return {
      key,
      timestamp: new Date(entry.timestamp).toISOString(),
      age: Math.floor(age / 1000), // 秒
      ttl: Math.floor(ttl / 1000), // 秒
      isExpired
    };
  }
}

// 创建全局缓存实例
// Top stocks 缓存：5分钟
export const topStocksCache = new CacheService(5 * 60 * 1000);

// New entrants 缓存：10分钟（变化较少）
export const newEntrantsCache = new CacheService(10 * 60 * 1000);

// 定期清理过期缓存（每10分钟）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const topStocksCleared = topStocksCache.cleanExpired();
    const newEntrantsCleared = newEntrantsCache.cleanExpired();
    
    if (topStocksCleared > 0 || newEntrantsCleared > 0) {
      console.log(`[Cache] 清理过期缓存: topStocks=${topStocksCleared}, newEntrants=${newEntrantsCleared}`);
    }
  }, 10 * 60 * 1000);
}

/**
 * 生成缓存键
 * @param prefix 前缀
 * @param params 参数对象
 */
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
}

export default CacheService;
