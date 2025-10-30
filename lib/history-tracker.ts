/**
 * 历史追踪器 - 记录和检测首次进入Top 30的公司
 */

import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'top30-history.json');

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
 */
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * 读取历史记录
 */
export function loadHistory(): HistoryData {
  ensureDataDir();
  
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
  ensureDataDir();
  
  const data = {
    lastUpdate: history.lastUpdate,
    symbols: Array.from(history.symbols),
    records: history.records
  };

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
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
