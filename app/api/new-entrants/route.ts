import { NextResponse } from 'next/server';
import { getTopUSStocksByVolume } from '@/lib/eastmoney-service';
import { getBatchUSStockNews } from '@/lib/eastmoney-news-service';
import { summarizeNewsWithQwen } from '@/lib/qwen-ai-service';
import { detectNewEntrants, getTodayNewEntrants } from '@/lib/history-tracker';
import { StockWithNews } from '@/types/stock';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/new-entrants
 * 检测并返回首次进入Top 30的新公司
 */
export async function GET(request: Request) {
  try {
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

    // 3. 如果有新公司，获取它们的详细信息和新闻
    if (newEntrants.length > 0) {
      const newSymbols = newEntrants.map(e => e.symbol);
      const newStocks = top30.filter(s => newSymbols.includes(s.symbol));

      // 4. 获取新闻
      const newsMap = await getBatchUSStockNews(newSymbols, 5);

      // 5. AI总结新闻
      const stocksWithNews: StockWithNews[] = await Promise.all(
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

      // 6. 按涨跌幅排序
      stocksWithNews.sort((a, b) => b.changePercent - a.changePercent);

      return NextResponse.json({
        success: true,
        data: stocksWithNews,
        newEntrants: newEntrants,
        count: newEntrants.length,
        timestamp: new Date().toISOString()
      });
    }

    // 没有新公司
    return NextResponse.json({
      success: true,
      data: [],
      newEntrants: [],
      count: 0,
      message: '今日暂无新进入Top 30的公司',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/new-entrants:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        newEntrants: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
