'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, Target, Award, BarChart3, Lightbulb, Shield } from 'lucide-react';

interface AShareAnalysis {
  code: string;
  name: string;
  mainBusiness: string;
  marketShare: string;
  competitiveAdvantage: string;
  industryPosition: string;
  recentPerformance: string;
  growthPotential: string;
  risks: string;
  investmentSuggestion: string;
}

interface AShareAnalysisModalProps {
  code: string;
  name: string;
  relation?: string;
  onClose: () => void;
}

export default function AShareAnalysisModal({ code, name, relation, onClose }: AShareAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<AShareAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [code, name]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        code,
        name,
        ...(relation && { relation })
      });

      const response = await fetch(`/api/a-share-analysis?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
      } else {
        setError(data.error || '分析失败');
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('获取分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">{name}</h2>
            <div className="flex items-center gap-3 text-blue-100">
              <span className="font-mono text-sm">{code}</span>
              {relation && (
                <>
                  <span className="text-blue-300">•</span>
                  <span className="text-sm">{relation}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">AI正在分析中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-semibold mb-1">分析失败</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* 行业地位 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-yellow-600" size={20} />
                  <h3 className="font-semibold text-gray-900">行业地位</h3>
                </div>
                <p className="text-gray-700">{analysis.industryPosition}</p>
              </div>

              {/* 主营业务 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-gray-900">主营业务</h3>
                </div>
                <p className="text-gray-700">{analysis.mainBusiness}</p>
              </div>

              {/* 市场占有率 */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="text-green-600" size={18} />
                  <h3 className="font-semibold text-gray-900">市场占有率</h3>
                </div>
                <p className="text-gray-700">{analysis.marketShare}</p>
              </div>

              {/* 竞争优势 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-purple-600" size={18} />
                  <h3 className="font-semibold text-gray-900">核心竞争优势</h3>
                </div>
                <p className="text-gray-700">{analysis.competitiveAdvantage}</p>
              </div>

              {/* 近期业绩 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-gray-900">近期业绩表现</h3>
                </div>
                <p className="text-gray-700">{analysis.recentPerformance}</p>
              </div>

              {/* 成长潜力 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="text-green-600" size={18} />
                  <h3 className="font-semibold text-gray-900">成长潜力</h3>
                </div>
                <p className="text-gray-700">{analysis.growthPotential}</p>
              </div>

              {/* 主要风险 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-600" size={18} />
                  <h3 className="font-semibold text-gray-900">主要风险</h3>
                </div>
                <p className="text-gray-700">{analysis.risks}</p>
              </div>

              {/* 投资建议 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-indigo-600" size={20} />
                  <h3 className="font-semibold text-gray-900">投资建议</h3>
                </div>
                <p className="text-gray-800 font-medium">{analysis.investmentSuggestion}</p>
              </div>

              {/* 免责声明 */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 mt-4">
                <p className="font-semibold mb-1">⚠️ 免责声明</p>
                <p>以上分析由AI生成，仅供参考，不构成投资建议。投资有风险，入市需谨慎。请以公司公告和专业投资顾问意见为准。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
