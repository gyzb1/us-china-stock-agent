'use client';

import { StockWithNews } from '@/types/stock';
import { TrendingUp, TrendingDown, DollarSign, Activity, Briefcase, ArrowRightLeft } from 'lucide-react';

interface StockCardProps {
  stock: StockWithNews;
}

/**
 * 清理HTML标签，只保留纯文本
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // 移除所有HTML标签
    .replace(/&nbsp;/g, ' ') // 替换&nbsp;
    .replace(/&lt;/g, '<')   // 替换&lt;
    .replace(/&gt;/g, '>')   // 替换&gt;
    .replace(/&amp;/g, '&')  // 替换&amp;
    .replace(/&quot;/g, '"') // 替换&quot;
    .trim();
}

export default function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.changePercent >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* 股票基本信息 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-600">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${stock.price.toFixed(2)}</p>
          <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 主营业务 */}
      {stock.business && (
        <div className="mb-4 pb-4 border-b">
          <div className="flex items-start gap-2">
            <Briefcase size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-1">主营业务</p>
              <p className="text-sm text-gray-700">{stock.business}</p>
            </div>
          </div>
        </div>
      )}

      {/* 成交数据 */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">成交额</p>
            <p className="font-semibold text-gray-900">
              ${(stock.amount / 1e8).toFixed(2)}亿
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-purple-600" />
          <div>
            <p className="text-xs text-gray-500">成交量</p>
            <p className="font-semibold text-gray-900">
              {(stock.volume / 1e6).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>

      {/* A股/港股映射 */}
      {stock.relatedStocks && stock.relatedStocks.length > 0 && (
        <div className="mb-4 pb-4 border-b">
          <div className="flex items-start gap-2 mb-2">
            <ArrowRightLeft size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <h4 className="text-sm font-semibold text-gray-900">对应A股/港股公司</h4>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {stock.relatedStocks.map((related, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    related.market === 'A股' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {related.market}
                  </span>
                  <span className="text-xs font-mono text-gray-600">{related.code}</span>
                  <span className="text-sm font-medium text-gray-900">{related.name}</span>
                </div>
                <span className="text-xs text-gray-500">{related.relation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新闻摘要 */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">新闻摘要</h4>
        {stock.newsSummary ? (
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {stock.newsSummary}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">暂无新闻数据</p>
        )}
      </div>

      {/* 新闻链接 */}
      {stock.news && stock.news.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 mb-2">📎 相关新闻链接：</p>
          <div className="space-y-2">
            {stock.news.slice(0, 3).map((newsItem, idx) => (
              newsItem.title && (
                <a
                  key={idx}
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline block"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">{idx + 1}.</span>
                    <span className="line-clamp-2">{stripHtmlTags(newsItem.title)}</span>
                  </div>
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
