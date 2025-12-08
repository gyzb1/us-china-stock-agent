import { NextResponse } from 'next/server';
import { getTopUSStocksByVolume } from '@/lib/eastmoney-service';
import { getBatchUSStockNews } from '@/lib/eastmoney-news-service';
import { summarizeNewsWithQwen } from '@/lib/qwen-ai-service';
import { StockWithNews } from '@/types/stock';
import { topStocksCache, generateCacheKey } from '@/lib/cache-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/display/top-stocks
 * 
 * 获取页面展示的Top 15成交额公司完整数据
 * 包含：股票基本信息、新闻、AI总结
 * 按涨跌幅从高到低排序
 * 
 * 查询参数：
 * - limit: 返回数量，默认15
 * - includeNews: 是否包含新闻，默认true
 * - noCache: 是否跳过缓存，默认false
 * 
 * 缓存机制：
 * - 缓存时间：5分钟
 * - 缓存键：基于 limit 和 includeNews 参数
 * - 可通过 noCache=true 强制刷新
 * 
 * 返回格式：
 * {
 *   success: true,
 *   data: [
 *     {
 *       symbol: "AAPL",
 *       name: "苹果公司",
 *       price: 180.50,
 *       changePercent: 2.5,
 *       volume: 50000000000,
 *       volumeFormatted: "500亿",
 *       business: "主营业务描述",
 *       aShareLeader: "A股龙头信息",
 *       news: [...],
 *       newsSummary: "AI总结的新闻摘要"
 *     }
 *   ],
 *   count: 15,
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   sortBy: "changePercent",
 *   sortOrder: "desc"
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '15');
    const includeNews = searchParams.get('includeNews') !== 'false';
    const noCache = searchParams.get('noCache') === 'true';

    // 生成缓存键
    const cacheKey = generateCacheKey('top-stocks', { limit, includeNews });

    // 检查缓存
    if (!noCache) {
      const cached = topStocksCache.get<any>(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return NextResponse.json({
          ...cached,
          fromCache: true,
          cacheInfo: topStocksCache.getInfo(cacheKey)
        });
      }
      console.log(`[Cache MISS] ${cacheKey}`);
    } else {
      console.log(`[Cache SKIP] ${cacheKey}`);
    }

    // 1. 获取成交额排名前N的公司股票（已过滤ETF）
    const topStocks = await getTopUSStocksByVolume(limit);

    let stocksWithNews: StockWithNews[];

    if (includeNews) {
      // 2. 获取这些股票的新闻（从东财）
      const symbols = topStocks.map(s => s.symbol);
      const newsMap = await getBatchUSStockNews(symbols, 5);

      // 3. 使用通义千问AI总结新闻
      stocksWithNews = await Promise.all(
        topStocks.map(async (stock) => {
          const news = newsMap.get(stock.symbol) || [];
          
          // 使用AI总结新闻
          const newsSummary = await summarizeNewsWithQwen(
            stock.symbol,
            stock.name,
            news
          );

          return {
            ...stock,
            news,
            newsSummary
          };
        })
      );
    } else {
      // 不包含新闻，只返回基本信息
      stocksWithNews = topStocks.map(stock => ({
        ...stock,
        news: [],
        newsSummary: '未获取新闻'
      }));
    }

    // 4. 按涨跌幅排序（从高到低）
    stocksWithNews.sort((a, b) => b.changePercent - a.changePercent);

    // 构建响应数据
    const responseData = {
      success: true,
      data: stocksWithNews,
      count: stocksWithNews.length,
      timestamp: new Date().toISOString(),
      sortBy: 'changePercent',
      sortOrder: 'desc',
      includeNews,
      fromCache: false
    };

    // 保存到缓存
    if (!noCache) {
      topStocksCache.set(cacheKey, responseData);
      console.log(`[Cache SET] ${cacheKey}`);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in /api/display/top-stocks:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch top stocks display data',
        data: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
