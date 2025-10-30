import axios from 'axios';
import { StockData } from '@/types/stock';
import { getStockMapping } from './stock-mapping-data';

/**
 * 东方财富API服务
 * 获取美股市场成交额排名前20的股票
 */

// 东财美股行情API
const EASTMONEY_US_STOCK_API = 'http://push2.eastmoney.com/api/qt/clist/get';

// 常见的ETF列表（需要过滤掉）
const ETF_LIST = new Set([
  'SPY', 'QQQ', 'IWM', 'DIA', 'VOO', 'VTI', 'IVV', 'EEM', 'VEA', 'AGG',
  'BND', 'VWO', 'GLD', 'SLV', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLP',
  'XLY', 'XLU', 'XLB', 'XLRE', 'XLC', 'TLT', 'HYG', 'LQD', 'VNQ', 'EFA',
  'IEMG', 'IJH', 'IJR', 'VGK', 'VIG', 'VYM', 'SCHD', 'VTV', 'VUG', 'VXUS',
  'ARKK', 'ARKG', 'ARKW', 'SQQQ', 'TQQQ', 'SPXL', 'SPXS', 'UVXY', 'VXX'
]);

interface EastMoneyStockItem {
  f12: string; // 股票代码
  f14: string; // 股票名称
  f2: number;  // 最新价
  f3: number;  // 涨跌幅
  f4: number;  // 涨跌额
  f5: number;  // 成交量
  f6: number;  // 成交额
}

interface EastMoneyResponse {
  data: {
    diff: EastMoneyStockItem[];
  };
}

/**
 * 检查是否为ETF
 */
function isETF(symbol: string): boolean {
  return ETF_LIST.has(symbol.toUpperCase());
}

/**
 * 获取美股成交额排名前N的公司股票（过滤ETF）
 */
export async function getTopUSStocksByVolume(limit: number = 15): Promise<StockData[]> {
  try {
    // 获取更多数据以确保过滤后有足够的结果
    const fetchSize = Math.max(50, limit * 3);
    
    const params = {
      pn: 1,
      pz: fetchSize,
      po: 1,
      np: 1,
      ut: 'bd1d9ddb04089700cf9c27f6f7426281',
      fltt: 2,
      invt: 2,
      fid: 'f6', // 按成交额排序
      fs: 'm:105,m:106,m:107', // 美股市场
      fields: 'f12,f14,f2,f3,f4,f5,f6',
      _: Date.now()
    };

    const response = await axios.get<EastMoneyResponse>(EASTMONEY_US_STOCK_API, {
      params,
      headers: {
        'Referer': 'http://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.data?.data?.diff) {
      throw new Error('Invalid response from EastMoney API');
    }

    // 过滤掉ETF，只保留公司股票
    const allStocks: StockData[] = response.data.data.diff
      .filter((item: EastMoneyStockItem) => !isETF(item.f12))
      .map((item: EastMoneyStockItem) => {
        const mapping = getStockMapping(item.f12);
        return {
          symbol: item.f12,
          name: item.f14,
          price: item.f2 || 0,
          change: item.f4 || 0,
          changePercent: item.f3 || 0,
          volume: item.f5 || 0,
          amount: item.f6 || 0,
          business: mapping?.business,
          relatedStocks: mapping?.relatedStocks
        };
      });

    // 返回前N个
    return allStocks.slice(0, limit);
  } catch (error) {
    console.error('Error fetching stocks from EastMoney:', error);
    throw new Error('Failed to fetch stock data from EastMoney');
  }
}
