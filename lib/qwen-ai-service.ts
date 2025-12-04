import axios from 'axios';
import { NewsItem } from '@/types/stock';

/**
 * 通义千问AI服务
 * 使用千问API总结新闻
 */

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const QWEN_API_KEY = process.env.QWEN_API_KEY;

interface QwenResponse {
  output: {
    text: string;
  };
  usage: {
    total_tokens: number;
  };
}

/**
 * 使用通义千问总结新闻
 */
export async function summarizeNewsWithQwen(
  symbol: string,
  companyName: string,
  news: NewsItem[]
): Promise<string> {
  try {
    // 构建新闻内容
    const newsContent = news.slice(0, 5).map((item, idx) => 
      `${idx + 1}. ${item.title}\n   ${item.summary || ''}`
    ).join('\n\n');

    // 构建提示词
    const prompt = `请阅读以下关于 ${companyName}(${symbol}) 的最新新闻，总结最重要的事件和趋势：

${newsContent}

重点关注：
1. 重大正面事件：爆表业绩、繁荣期、历史新高、大幅增长、突破性进展
2. 重大负面事件：暴雷、暴跌、业绩下滑、裁员、调查、诉讼
3. 价格趋势：涨价、降价、价格周期
4. 财报数据：营收、利润、增长率、超预期、不及预期
5. 行业趋势：供需关系、市场格局、技术变革
6. 华尔街观点：分析师评级、机构看法、目标价调整

输出要求：
- 80-120字简洁中文
- 突出最重要的1-2个事件
- 包含具体数据（如有）
- 分析对股价的影响
- 直接陈述，不要"根据新闻"等开头

示例（正面）：
"存储芯片迎来前所未有繁荣期，DRAM和NAND价格持续上涨15-20%。美光Q3业绩爆表，营收增长34%超预期。华尔街分析师上调目标价，预计涨价周期将持续至明年Q2。"

示例（负面）：
"Fiserv突然暴雷，股价单日暴跌40%创历史最大跌幅。公司下调全年业绩指引，EPS预期从10.15美元降至8.50美元。CEO表示无法兑现此前对投资者的承诺，市场信心严重受挫。"`;

    // 调用通义千问API
    const response = await axios.post<QwenResponse>(
      QWEN_API_URL,
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的金融分析师，擅长总结股市新闻。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          max_tokens: 300,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.output?.text) {
      return `🤖 AI总结：\n\n${response.data.output.text}`;
    }

    // 如果AI总结失败，返回简单摘要
    return generateSimpleSummary(news);
  } catch (error) {
    console.error(`Error summarizing news with Qwen for ${symbol}:`, error);
    // 失败时返回简单摘要
    return generateSimpleSummary(news);
  }
}

/**
 * 生成简单摘要（作为后备方案）
 */
function generateSimpleSummary(news: NewsItem[]): string {
  const titles = news.slice(0, 3).map((n, idx) => {
    const title = n.title || '无标题';
    const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
    return `${idx + 1}. ${shortTitle}`;
  }).join('\n');

  return `📰 最新资讯（共${news.length}条）\n\n${titles}\n\n💡 点击下方链接查看详情`;
}

/**
 * 批量总结新闻
 */
export async function batchSummarizeNews(
  stocksWithNews: Array<{ symbol: string; name: string; news: NewsItem[] }>
): Promise<Map<string, string>> {
  const summaries = new Map<string, string>();

  // 并行处理所有股票的新闻总结
  const promises = stocksWithNews.map(async ({ symbol, name, news }) => {
    try {
      const summary = await summarizeNewsWithQwen(symbol, name, news);
      return { symbol, summary };
    } catch (error) {
      console.error(`Failed to summarize news for ${symbol}:`, error);
      return { symbol, summary: generateSimpleSummary(news) };
    }
  });

  const results = await Promise.all(promises);
  
  results.forEach(({ symbol, summary }) => {
    summaries.set(symbol, summary);
  });

  return summaries;
}
