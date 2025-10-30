/**
 * 历史追踪器 - Vercel适配版本
 * 使用内存存储，适用于无服务器环境
 */

export interface HistoryRecord {
  symbol: string;
  firstSeenDate: string;
  firstSeenRank: number;
  firstSeenVolume: number;
}

export interface HistoryData {
  lastUpdate: string;
  symbols: Set<string>;
  records: HistoryRecord[];
}

// 内存缓存（仅在当前请求周期有效）
let memoryCache: HistoryData | null = null;

/**
 * 从环境变量或内存加载历史记录
 */
export function loadHistory(): HistoryData {
  // 优先使用内存缓存
  if (memoryCache) {
    return memoryCache;
  }

  // 尝试从环境变量加载（如果配置了）
  try {
    const envData = process.env.TOP30_HISTORY;
    if (envData) {
      const data = JSON.parse(envData);
      memoryCache = {
        lastUpdate: data.lastUpdate,
        symbols: new Set(data.symbols || []),
        records: data.records || []
      };
      return memoryCache;
    }
  } catch (error) {
    console.error('Error loading history from env:', error);
  }

  // 返回空历史
  memoryCache = {
    lastUpdate: new Date().toISOString(),
    symbols: new Set<string>(),
    records: []
  };
  return memoryCache;
}

/**
 * 保存历史记录到内存
 * 注意：在无服务器环境中，这只在当前请求周期有效
 */
export function saveHistory(history: HistoryData) {
  memoryCache = history;
  
  // 在生产环境中，这里可以：
  // 1. 保存到数据库（如Vercel KV、Redis等）
  // 2. 保存到外部存储（如S3）
  // 3. 暂时只保存到内存（当前实现）
  
  console.log('History saved to memory (session only)');
}

/**
 * 检测新进入Top 30的公司
 */
export function detectNewEntrants(currentTop30: Array<{ symbol: string; volume: number; rank: number }>) {
  const history = loadHistory();
  const newEntrants: HistoryRecord[] = [];
  const today = new Date().toISOString().split('T')[0];

  currentTop30.forEach((stock) => {
    if (!history.symbols.has(stock.symbol)) {
      const record: HistoryRecord = {
        symbol: stock.symbol,
        firstSeenDate: today,
        firstSeenRank: stock.rank,
        firstSeenVolume: stock.volume
      };
      
      newEntrants.push(record);
      history.symbols.add(stock.symbol);
      history.records.push(record);
    }
  });

  if (newEntrants.length > 0) {
    history.lastUpdate = new Date().toISOString();
    saveHistory(history);
  }

  return newEntrants;
}

/**
 * 获取最近N天的新进入公司
 */
export function getRecentNewEntrants(days: number = 7): HistoryRecord[] {
  const history = loadHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  return history.records.filter(record => record.firstSeenDate >= cutoffStr);
}

/**
 * 获取今天的新进入公司
 */
export function getTodayNewEntrants(): HistoryRecord[] {
  const history = loadHistory();
  const today = new Date().toISOString().split('T')[0];

  return history.records.filter(record => record.firstSeenDate === today);
}

/**
 * 清除历史记录
 */
export function clearHistory() {
  memoryCache = {
    lastUpdate: new Date().toISOString(),
    symbols: new Set<string>(),
    records: []
  };
}
