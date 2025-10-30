import axios from 'axios';
import { NewsItem } from '@/types/stock';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const ALPHA_VANTAGE_NEWS_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageNewsItem {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  source: string;
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
}

interface AlphaVantageNewsResponse {
  feed: AlphaVantageNewsItem[];
}

/**
 * 从Alpha Vantage获取指定股票的新闻
 */
export async function getStockNews(symbol: string, limit: number = 5): Promise<NewsItem[]> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API key is not configured');
    }

    const params = {
      function: 'NEWS_SENTIMENT',
      tickers: symbol,
      limit: limit,
      apikey: ALPHA_VANTAGE_API_KEY
    };

    const response = await axios.get<AlphaVantageNewsResponse>(ALPHA_VANTAGE_NEWS_URL, {
      params,
      timeout: 10000
    });

    if (!response.data?.feed) {
      return [];
    }

    const news: NewsItem[] = response.data.feed.map(item => ({
      title: item.title,
      url: item.url,
      time_published: item.time_published,
      summary: item.summary,
      source: item.source,
      sentiment_score: item.overall_sentiment_score,
      sentiment_label: item.overall_sentiment_label
    }));

    return news;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

/**
 * 批量获取多个股票的新闻
 */
export async function getBatchStockNews(symbols: string[], limitPerStock: number = 3): Promise<Map<string, NewsItem[]>> {
  const newsMap = new Map<string, NewsItem[]>();
  
  // Alpha Vantage有API调用频率限制，所以需要串行调用
  for (const symbol of symbols) {
    try {
      const news = await getStockNews(symbol, limitPerStock);
      newsMap.set(symbol, news);
      
      // 添加延迟以避免超过API限制 (免费版: 5 calls/min)
      await new Promise(resolve => setTimeout(resolve, 12000)); // 12秒间隔
    } catch (error) {
      console.error(`Failed to fetch news for ${symbol}:`, error);
      newsMap.set(symbol, []);
    }
  }
  
  return newsMap;
}
