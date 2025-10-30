export interface RelatedStock {
  code: string;
  name: string;
  relation: string;
  market: 'A股' | '港股'; // 市场类型
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number; // 成交额
  business?: string; // 主营业务
  relatedStocks?: RelatedStock[]; // 对应的A股和港股公司
}

export interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  source: string;
  sentiment_score?: number;
  sentiment_label?: string;
}

export interface StockWithNews extends StockData {
  news: NewsItem[];
  newsSummary?: string;
}
