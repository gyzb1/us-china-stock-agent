import { NewsItem } from '@/types/stock';

/**
 * 新闻摘要服务
 * 将多条新闻汇总成简短的总结
 */

/**
 * 生成新闻摘要
 * 这里使用简单的规则提取关键信息
 * 如果需要更智能的摘要，可以集成AI服务
 */
export function generateNewsSummary(news: NewsItem[]): string {
  if (!news || news.length === 0) {
    return '暂无相关新闻';
  }

  // 统计情绪倾向
  const sentiments = news
    .filter(n => n.sentiment_label)
    .map(n => n.sentiment_label!);
  
  const positiveCount = sentiments.filter(s => s.toLowerCase().includes('positive')).length;
  const negativeCount = sentiments.filter(s => s.toLowerCase().includes('negative')).length;
  const neutralCount = sentiments.filter(s => s.toLowerCase().includes('neutral')).length;

  let sentimentSummary = '';
  if (positiveCount > negativeCount && positiveCount > 0) {
    sentimentSummary = '市场情绪偏正面';
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    sentimentSummary = '市场情绪偏负面';
  } else {
    sentimentSummary = '市场情绪中性';
  }

  // 提取最新的几条新闻标题
  const recentNews = news.slice(0, 3);
  const titles = recentNews.map(n => `• ${n.title}`).join('\n');

  return `${sentimentSummary}。\n\n最新动态：\n${titles}`;
}

/**
 * 计算平均情绪分数
 */
export function calculateAverageSentiment(news: NewsItem[]): number {
  const scores = news
    .filter(n => n.sentiment_score !== undefined)
    .map(n => n.sentiment_score!);
  
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}
