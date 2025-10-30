'use client';

import { useState, useEffect } from 'react';
import { StockWithNews } from '@/types/stock';
import StockCard from '@/components/StockCard';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
  const [stocks, setStocks] = useState<StockWithNews[]>([]);
  const [newEntrants, setNewEntrants] = useState<StockWithNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNewEntrants, setLoadingNewEntrants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 先获取基本股票数据
      const response = await fetch('/api/stocks');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stocks');
      }
      
      // 显示前15个公司，不带新闻
      const topStocks = data.data.map((stock: any) => ({
        ...stock,
        news: [],
        newsSummary: '点击"获取新闻"按钮查看东财最新资讯'
      }));
      
      // 按涨跌幅排序（从高到低）
      topStocks.sort((a: any, b: any) => b.changePercent - a.changePercent);
      
      setStocks(topStocks);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStocksWithNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stocks-with-news?limit=15');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stocks with news');
      }
      
      // 按涨跌幅排序（从高到低）
      const sortedStocks = [...data.data].sort((a: any, b: any) => b.changePercent - a.changePercent);
      
      setStocks(sortedStocks);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewEntrants = async () => {
    try {
      setLoadingNewEntrants(true);
      setError(null);
      
      const response = await fetch('/api/new-entrants');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch new entrants');
      }
      
      setNewEntrants(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingNewEntrants(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchNewEntrants(); // 同时获取新进入的公司
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            美股成交额排行榜 Top 15
          </h1>
          <p className="text-gray-600">
            实时追踪成交额最大的15家美股公司及其新闻动态（已过滤ETF）
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              最后更新: {lastUpdate.toLocaleString('zh-CN')}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={fetchStocks}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            刷新数据
          </button>
          <button
            onClick={fetchStocksWithNews}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            获取新闻
          </button>
        </div>

        {/* 提示信息 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">使用说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"刷新数据"按钮：快速获取最新股票行情数据（显示15家公司）</li>
                <li>"获取新闻"按钮：获取东财最新资讯（无需API Key，响应快速）</li>
                <li>数据来源：东方财富（行情 + 新闻）</li>
                <li>已自动过滤ETF（如SPY、QQQ等），仅显示公司股票</li>
                <li>每个卡片显示：主营业务、对应A股龙头、最新资讯</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="font-semibold">错误: {error}</span>
            </div>
          </div>
        )}

        {/* 新进入Top 30板块 */}
        {newEntrants.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-3xl">🌟</span>
                新星公司 - 首次进入Top 30
              </h2>
              <p className="text-green-100">
                以下公司首次出现在成交额前30名，值得重点关注！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newEntrants.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        )}

        {loadingNewEntrants && newEntrants.length === 0 && (
          <div className="text-center py-8 mb-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCw className="animate-spin" size={20} />
              <span>正在检测新进入公司...</span>
            </div>
          </div>
        )}

        {/* 暂无新进入公司提示 */}
        {!loadingNewEntrants && newEntrants.length === 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-3xl">💤</span>
                新星公司追踪
              </h2>
              <p className="text-gray-100">
                今日暂无新进入Top 30的公司。系统会持续追踪，一旦有新公司进入前30名，将在此处显示。
              </p>
              <p className="text-gray-200 text-sm mt-2">
                💡 提示：首次运行时会记录当前所有Top 30公司，下次运行才能检测到新进入的公司。
              </p>
            </div>
          </div>
        )}

        {/* 分隔线 */}
        {newEntrants.length > 0 && (
          <div className="border-t-2 border-gray-300 my-12"></div>
        )}

        {/* Top 15 标题 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            📊 成交额Top 15（按涨跌幅排序）
          </h2>
          <p className="text-blue-100">
            成交额最大的15家公司，按涨跌幅从高到低排序
          </p>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        )}

        {/* 股票列表 */}
        {!loading && stocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && stocks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>暂无数据</p>
          </div>
        )}
      </div>
    </main>
  );
}
