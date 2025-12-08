import { NextResponse } from 'next/server';
import { getTopUSStocksByVolume } from '@/lib/eastmoney-service';
import { getBatchUSStockNews } from '@/lib/eastmoney-news-service';
import { summarizeNewsWithQwen } from '@/lib/qwen-ai-service';
import { detectNewEntrants } from '@/lib/history-tracker';
import { StockWithNews } from '@/types/stock';
import { newEntrantsCache, generateCacheKey } from '@/lib/cache-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/display/new-entrants
 * 
 * 获取页面展示的"新星公司"完整数据
 * 检测并返回首次进入Top 30的新公司
 * 包含：股票基本信息、新闻、AI总结、进入排名等
 * 按涨跌幅从高到低排序
 * 
 * 查询参数：
 * - includeNews: 是否包含新闻，默认true
 * - noCache: 是否跳过缓存，默认false
 * 
 * 缓存机制：
 * - 缓存时间：10分钟
 * - 缓存键：基于 includeNews 参数
 * - 可通过 noCache=true 强制刷新
 * 
 * 返回格式：
 * {
 *   success: true,
 *   data: [
 *     {
 *       symbol: "NVDA",
 *       name: "英伟达",
 *       price: 450.00,
 *       changePercent: 5.2,
 *       volume: 30000000000,
 *       volumeFormatted: "300亿",
 *       business: "主营业务描述",
 *       aShareLeader: "A股龙头信息",
 *       news: [...],
 *       newsSummary: "AI总结的新闻摘要"
 *     }
 *   ],
 *   newEntrants: [
 *     {
 *       symbol: "NVDA",
 *       volume: 30000000000,
 *       rank: 15,
 *       timestamp: "2024-01-01T00:00:00.000Z"
 *     }
 *   ],
 *   count: 1,
 *   message: "发现1家新进入Top 30的公司",
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   sortBy: "changePercent",
 *   sortOrder: "desc"
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeNews = searchParams.get('includeNews') !== 'false';
    const noCache = searchParams.get('noCache') === 'true';

    // 生成缓存键
    const cacheKey = generateCacheKey('new-entrants', { includeNews });

    // 检查缓存
    if (!noCache) {
      const cached = newEntrantsCache.get<any>(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return NextResponse.json({
          ...cached,
          fromCache: true,
          cacheInfo: newEntrantsCache.getInfo(cacheKey)
        });
      }
      console.log(`[Cache MISS] ${cacheKey}`);
    } else {
      console.log(`[Cache SKIP] ${cacheKey}`);
    }

    // 1. 获取Top 30公司
    const top30 = await getTopUSStocksByVolume(30);
    
    // 2. 检测新进入的公司
    const newEntrants = detectNewEntrants(
      top30.map((stock, index) => ({
        symbol: stock.symbol,
        volume: stock.volume,
        rank: index + 1
      }))
    );

    // 3. 如果有新公司，获取它们的详细信息
    if (newEntrants.length > 0) {
      const newSymbols = newEntrants.map(e => e.symbol);
      const newStocks = top30.filter(s => newSymbols.includes(s.symbol));

      let stocksWithNews: StockWithNews[];

      if (includeNews) {
        // 4. 获取新闻
        const newsMap = await getBatchUSStockNews(newSymbols, 5);

        // 5. AI总结新闻
        stocksWithNews = await Promise.all(
          newStocks.map(async (stock) => {
            const news = newsMap.get(stock.symbol) || [];
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
        stocksWithNews = newStocks.map(stock => ({
          ...stock,
          news: [],
          newsSummary: '未获取新闻'
        }));
      }

      // 6. 按涨跌幅排序
      stocksWithNews.sort((a, b) => b.changePercent - a.changePercent);

      // 构建响应数据
      const responseData = {
        success: true,
        data: stocksWithNews,
        newEntrants: newEntrants,
        count: newEntrants.length,
        message: `发现${newEntrants.length}家新进入Top 30的公司`,
        timestamp: new Date().toISOString(),
        sortBy: 'changePercent',
        sortOrder: 'desc',
        includeNews,
        fromCache: false
      };

      // 保存到缓存
      if (!noCache) {
        newEntrantsCache.set(cacheKey, responseData);
        console.log(`[Cache SET] ${cacheKey}`);
      }

      return NextResponse.json(responseData);
    }

    // 没有新公司
    const emptyResponseData = {
      success: true,
      data: [],
      newEntrants: [],
      count: 0,
      message: '今日暂无新进入Top 30的公司',
      timestamp: new Date().toISOString(),
      sortBy: 'changePercent',
      sortOrder: 'desc',
      includeNews,
      fromCache: false
    };

    // 保存到缓存
    if (!noCache) {
      newEntrantsCache.set(cacheKey, emptyResponseData);
      console.log(`[Cache SET] ${cacheKey} (empty)`);
    }

    return NextResponse.json(emptyResponseData);

  } catch (error) {
    console.error('Error in /api/display/new-entrants:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch new entrants display data',
        data: [],
        newEntrants: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
