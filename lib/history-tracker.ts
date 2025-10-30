/**
 * 历史追踪器 - 记录和检测首次进入Top 30的公司
 * 自动适配本地开发和生产环境
 */

import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'top30-history.json');

// 检测是否在只读文件系统中（如Vercel）
let isReadOnlyFileSystem = false;
let memoryCache: HistoryData | null = null;

export interface HistoryRecord {
  symbol: string;
  firstSeenDate: string; // ISO date string
  firstSeenRank: number;
  firstSeenVolume: number;
}

export interface HistoryData {
  lastUpdate: string;
  symbols: Set<string>; // 所有曾经出现过的股票代码
  records: HistoryRecord[];
}

/**
 * 确保数据目录存在
 * 如果文件系统只读，标记使用内存存储
 */
function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error: any) {
    // 文件系统只读（如Vercel），使用内存存储
    if (error.code === 'EROFS' || error.code === 'EACCES') {
      console.warn('Read-only file system detected, using memory storage');
      isReadOnlyFileSystem = true;
    }
  }
}

/**
 * 读取历史记录
 */
export function loadHistory(): HistoryData {
  ensureDataDir();
  
  // 如果是只读文件系统，使用内存缓存
  if (isReadOnlyFileSystem) {
    if (memoryCache) {
      return memoryCache;
    }
    memoryCache = {
      lastUpdate: new Date().toISOString(),
      symbols: new Set<string>(),
      records: []
    };
    return memoryCache;
  }
  
  // 本地开发环境，使用文件存储
  if (!fs.existsSync(HISTORY_FILE)) {
    return {
      lastUpdate: new Date().toISOString(),
      symbols: new Set<string>(),
      records: []
    };
  }

  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return {
      lastUpdate: data.lastUpdate,
      symbols: new Set(data.symbols || []),
      records: data.records || []
    };
  } catch (error) {
    console.error('Error loading history:', error);
    // 如果读取失败，标记为只读并使用内存
    isReadOnlyFileSystem = true;
    return {
      lastUpdate: new Date().toISOString(),
      symbols: new Set<string>(),
      records: []
    };
  }
}

/**
 * 保存历史记录
 */
export function saveHistory(history: HistoryData) {
  // 如果是只读文件系统，只保存到内存
  if (isReadOnlyFileSystem) {
    memoryCache = history;
    console.log('History saved to memory (read-only file system)');
    return;
  }
  
  // 本地开发环境，保存到文件
  try {
    ensureDataDir();
    
    const data = {
      lastUpdate: history.lastUpdate,
      symbols: Array.from(history.symbols),
      records: history.records
    };

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error: any) {
    // 如果写入失败，标记为只读并使用内存
    if (error.code === 'EROFS' || error.code === 'EACCES') {
      console.warn('Cannot write to file system, using memory storage');
      isReadOnlyFileSystem = true;
      memoryCache = history;
    } else {
      console.error('Error saving history:', error);
    }
  }
}

/**
 * 检测新进入Top 30的公司
 */
export function detectNewEntrants(currentTop30: Array<{ symbol: string; volume: number; rank: number }>) {
  const history = loadHistory();
  const newEntrants: HistoryRecord[] = [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  currentTop30.forEach((stock) => {
    if (!history.symbols.has(stock.symbol)) {
      // 这是首次出现的公司
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

  // 更新历史记录
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
 * 清除历史记录（用于测试或重置）
 */
export function clearHistory() {
  ensureDataDir();
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
}
