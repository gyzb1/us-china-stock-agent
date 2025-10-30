import axios from 'axios';
import { NewsItem } from '@/types/stock';

/**
 * 东方财富新闻API服务
 * 获取美股相关新闻资讯
 */

// 东财新闻API
const EASTMONEY_NEWS_API = 'https://search-api-web.eastmoney.com/search/jsonp';

interface EastMoneyNewsItem {
  title: string;
  url: string;
  date: string;
  content: string;
  source: string;
}

interface EastMoneyNewsResponse {
  Data: EastMoneyNewsItem[];
}

/**
 * 从东财获取股票相关新闻
 */
export async function getStockNewsFromEastMoney(symbol: string, limit: number = 5): Promise<NewsItem[]> {
  try {
    // 东财新闻搜索API
    const params = {
      type: 'news',
      keyword: symbol,
      pageindex: 1,
      pagesize: limit,
      _: Date.now()
    };

    const response = await axios.get(EASTMONEY_NEWS_API, {
      params,
      headers: {
        'Referer': 'https://so.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    // 东财返回的是JSONP格式，需要解析
    let jsonData = response.data;
    if (typeof jsonData === 'string') {
      // 移除JSONP包装
      jsonData = jsonData.replace(/^[^{]*\(/, '').replace(/\)[^)]*$/, '');
      jsonData = JSON.parse(jsonData);
    }

    if (!jsonData?.Data) {
      return [];
    }

    const news: NewsItem[] = jsonData.Data.map((item: any) => ({
      title: item.title || item.Title || '',
      url: item.url || item.Url || '',
      time_published: item.date || item.ShowTime || new Date().toISOString(),
      summary: item.content || item.Content || item.title || '',
      source: item.source || item.MediaName || '东方财富',
      sentiment_score: 0,
      sentiment_label: 'neutral'
    }));

    return news;
  } catch (error) {
    console.error(`Error fetching news for ${symbol} from EastMoney:`, error);
    return [];
  }
}

/**
 * 过滤新闻，只保留近1-2天的
 */
function filterRecentNews(news: NewsItem[], daysLimit: number = 2): NewsItem[] {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

  return news.filter(item => {
    try {
      const newsDate = new Date(item.time_published);
      return newsDate >= cutoffTime;
    } catch {
      // 如果日期解析失败，保留该新闻
      return true;
    }
  });
}

/**
 * 使用东财全球财经API获取美股新闻
 */
export async function getUSStockNews(symbol: string, limit: number = 5): Promise<NewsItem[]> {
  try {
    // 方案1: 使用东财全球快讯API
    try {
      const response = await axios.get('https://np-listapi.eastmoney.com/comm/wap/getListInfo', {
        params: {
          cb: 'callback',
          type: 1,
          keyword: symbol,
          pageSize: 20, // 增加获取数量，后面再过滤
          pageIndex: 1,
          _: Date.now()
        },
        headers: {
          'Referer': 'https://wap.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
      });

      let data = response.data;
      if (typeof data === 'string') {
        data = data.replace(/^callback\(/, '').replace(/\)$/, '');
        data = JSON.parse(data);
      }

      if (data?.data?.list && data.data.list.length > 0) {
        const allNews: NewsItem[] = data.data.list.map((item: any) => ({
          title: item.title || '',
          url: item.url || `https://finance.eastmoney.com/`,
          time_published: item.showtime || new Date().toISOString(),
          summary: item.digest || item.title || '',
          source: item.source || '东方财富',
          sentiment_score: 0,
          sentiment_label: 'neutral'
        }));
        
        // 先尝试过滤近2天的新闻
        let recentNews = filterRecentNews(allNews, 2);
        
        // 如果近2天没有新闻，放宽到5天
        if (recentNews.length === 0) {
          console.log(`No news in 2 days for ${symbol}, trying 5 days...`);
          recentNews = filterRecentNews(allNews, 5);
        }
        
        if (recentNews.length > 0) {
          return recentNews.slice(0, limit);
        }
      }
    } catch (err) {
      console.log('Global news API failed, trying alternative...');
    }

    // 方案2: 使用公司名称+行业关键词搜索（更可靠）
    try {
      // 获取公司全名和行业关键词
      const companySearchTerms: Record<string, string[]> = {
        'AAPL': ['Apple 苹果', 'iPhone'],
        'MSFT': ['Microsoft 微软', '云计算'],
        'GOOGL': ['Google Alphabet', '谷歌'],
        'AMZN': ['Amazon 亚马逊', '电商'],
        'NVDA': ['NVIDIA 英伟达', 'GPU', 'AI芯片'],
        'TSLA': ['Tesla 特斯拉', '电动车'],
        'META': ['Meta Facebook', '社交媒体'],
        'PLTR': ['Palantir', '大数据'],
        'AVGO': ['Broadcom 博通', '芯片'],
        'AMD': ['AMD', '处理器'],
        'INTC': ['Intel 英特尔', '芯片'],
        'MU': ['Micron 美光', '存储芯片', 'DRAM', 'NAND'],
        'NFLX': ['Netflix', '流媒体'],
        'DIS': ['Disney 迪士尼', '娱乐'],
        'BABA': ['Alibaba 阿里巴巴', '电商'],
        'BIDU': ['Baidu 百度', '搜索'],
        'PDD': ['Pinduoduo 拼多多', '电商'],
        'JD': ['JD.com 京东', '电商'],
        'CRM': ['Salesforce', 'CRM'],
        'ORCL': ['Oracle 甲骨文', '数据库'],
        'ADBE': ['Adobe', '设计软件'],
        'V': ['Visa', '支付'],
        'MA': ['Mastercard', '支付'],
        'PYPL': ['PayPal', '支付'],
        'LLY': ['Eli Lilly 礼来', '制药'],
        'WMT': ['Walmart 沃尔玛', '零售'],
        'JPM': ['JPMorgan 摩根大通', '银行'],
        'UNH': ['UnitedHealth', '医疗保险'],
        'NKE': ['Nike 耐克', '运动'],
        'COST': ['Costco', '超市'],
        'UBER': ['Uber', '网约车'],
        'ABNB': ['Airbnb', '民宿'],
        'FI': ['Fiserv', '金融科技', '支付处理'],
        'GOOG': ['Google 谷歌', 'Alphabet'],
        'BRK.B': ['Berkshire 伯克希尔', '巴菲特'],
        'XOM': ['ExxonMobil 埃克森美孚', '石油'],
        'CVX': ['Chevron 雪佛龙', '石油'],
        'PG': ['Procter Gamble 宝洁', '日用品'],
        'KO': ['Coca-Cola 可口可乐', '饮料'],
        'PEP': ['PepsiCo 百事', '饮料'],
        'MCD': ['McDonald 麦当劳', '快餐'],
        'ABT': ['Abbott 雅培', '医疗器械'],
        'TMO': ['Thermo Fisher', '生命科学'],
        'DHR': ['Danaher 丹纳赫', '生命科学'],
        'BAC': ['Bank of America 美国银行', '银行'],
        'WFC': ['Wells Fargo 富国银行', '银行'],
        'HD': ['Home Depot', '家居建材'],
        'LOW': ['Lowes', '家居建材'],
        'UPS': ['UPS', '快递物流'],
        'FDX': ['FedEx 联邦快递', '物流'],
        'QCOM': ['Qualcomm 高通', '芯片 5G'],
        'TXN': ['Texas Instruments 德州仪器', '芯片'],
        'CSCO': ['Cisco 思科', '网络设备'],
        'TSM': ['TSMC 台积电', '晶圆代工', '芯片制造'],
        'ASML': ['ASML 阿斯麦', '光刻机', '半导体设备']
      };
      
      const searchTerms = companySearchTerms[symbol.toUpperCase()] || [symbol];
      const searchTerm = searchTerms[0]; // 使用第一个关键词
      
      const response = await axios.get('https://search-api-web.eastmoney.com/search/jsonp', {
        params: {
          cb: 'jQuery',
          param: JSON.stringify({
            uid: '',
            keyword: searchTerm,
            type: ['cmsArticleWebOld'],
            client: 'web',
            clientType: 'web',
            clientVersion: 'curr',
            param: {
              cmsArticleWebOld: {
                searchScope: 'default',
                sort: 'default',
                pageIndex: 1,
                pageSize: 20 // 增加获取数量
              }
            }
          }),
          _: Date.now()
        },
        headers: {
          'Referer': 'https://so.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      let data = response.data;
      if (typeof data === 'string') {
        data = data.replace(/^jQuery[^(]*\(/, '').replace(/\);?$/, '');
        data = JSON.parse(data);
      }

      if (data?.result?.cmsArticleWebOld) {
        const articles = data.result.cmsArticleWebOld;
        const allNews: NewsItem[] = articles.map((item: any) => ({
          title: item.title || item.Title || '',
          url: item.url || item.Url || `https://finance.eastmoney.com/`,
          time_published: item.date || item.ShowTime || new Date().toISOString(),
          summary: item.content || item.Content || item.title || '',
          source: item.mediaName || item.MediaName || '东方财富',
          sentiment_score: 0,
          sentiment_label: 'neutral'
        }));

        // 先尝试过滤近2天的新闻
        let recentNews = filterRecentNews(allNews, 2);
        
        // 如果近2天没有新闻，放宽到5天
        if (recentNews.length === 0) {
          console.log(`No news in 2 days for ${symbol} (search), trying 5 days...`);
          recentNews = filterRecentNews(allNews, 5);
        }
        
        if (recentNews.length > 0) {
          return recentNews.slice(0, limit);
        }
      }
    } catch (err) {
      console.log('Search API failed, using fallback...');
    }

    // 方案3: 生成通用新闻
    return generateFallbackNews(symbol);
  } catch (error) {
    console.error(`Error fetching US stock news for ${symbol}:`, error);
    return generateFallbackNews(symbol);
  }
}

/**
 * 生成后备新闻（当API都失败时）
 */
function generateFallbackNews(symbol: string): NewsItem[] {
  const now = new Date().toISOString();
  return [
    {
      title: `${symbol} 实时行情追踪`,
      url: `https://quote.eastmoney.com/us/${symbol}.html`,
      time_published: now,
      summary: `查看${symbol}的实时行情、财务数据和市场分析`,
      source: '东方财富',
      sentiment_score: 0,
      sentiment_label: 'neutral'
    },
    {
      title: `${symbol} 公司资料`,
      url: `https://emweb.securities.eastmoney.com/PC_USF10/pages/index.html?code=${symbol}`,
      time_published: now,
      summary: `了解${symbol}的公司概况、业务范围和财务状况`,
      source: '东方财富',
      sentiment_score: 0,
      sentiment_label: 'neutral'
    },
    {
      title: `美股市场动态`,
      url: 'https://finance.eastmoney.com/a/cgnjj.html',
      time_published: now,
      summary: '查看最新美股市场动态和行业资讯',
      source: '东方财富',
      sentiment_score: 0,
      sentiment_label: 'neutral'
    }
  ];
}

/**
 * 批量获取多个股票的新闻（无需延迟，东财API无限制）
 */
export async function getBatchUSStockNews(symbols: string[], limitPerStock: number = 3): Promise<Map<string, NewsItem[]>> {
  const newsMap = new Map<string, NewsItem[]>();
  
  // 并行获取所有股票的新闻
  const promises = symbols.map(async (symbol) => {
    try {
      const news = await getUSStockNews(symbol, limitPerStock);
      return { symbol, news };
    } catch (error) {
      console.error(`Failed to fetch news for ${symbol}:`, error);
      return { symbol, news: [] };
    }
  });

  const results = await Promise.all(promises);
  
  results.forEach(({ symbol, news }) => {
    newsMap.set(symbol, news);
  });
  
  return newsMap;
}

/**
 * 生成基于东财新闻的简单摘要
 */
export function generateNewsDigest(news: NewsItem[]): string {
  if (!news || news.length === 0) {
    return '暂无相关新闻\n\n提示：点击"获取新闻"按钮获取最新资讯';
  }

  // 提取最新的3条新闻标题
  const recentNews = news.slice(0, 3);
  const titles = recentNews.map((n, idx) => {
    const title = n.title || '无标题';
    // 限制标题长度
    const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
    return `${idx + 1}. ${shortTitle}`;
  }).join('\n');

  const summary = `📰 最新资讯（共${news.length}条）\n\n${titles}`;
  
  // 如果有新闻链接，添加提示
  if (news.length > 0 && news[0].url) {
    return summary + '\n\n💡 点击下方链接查看详情';
  }
  
  return summary;
}
