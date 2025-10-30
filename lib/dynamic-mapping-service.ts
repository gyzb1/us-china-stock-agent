/**
 * 动态映射服务 - 自动为任何美股公司生成A股/港股映射
 * 使用AI分析公司业务，智能匹配相关的中国公司
 */

import { RelatedStock } from '@/types/stock';
import axios from 'axios';

const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-fefa9fed5599445abd3532c3b8187488';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

interface DynamicMapping {
  symbol: string;
  business: string;
  relatedStocks: RelatedStock[];
  confidence: number; // 0-1，映射置信度
  generatedAt: string;
}

// 行业关键词到A股公司的映射库
const INDUSTRY_MAPPING: Record<string, RelatedStock[]> = {
  // 科技
  '人工智能': [
    { code: '002230', name: '科大讯飞', relation: 'AI技术', market: 'A股' },
    { code: '688981', name: '中芯国际', relation: 'AI芯片', market: 'A股' }
  ],
  '云计算': [
    { code: '600588', name: '用友网络', relation: '企业云服务', market: 'A股' },
    { code: '00700', name: '腾讯控股', relation: '云计算', market: '港股' }
  ],
  '芯片': [
    { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
    { code: '002049', name: '紫光国微', relation: '芯片设计', market: 'A股' },
    { code: '002371', name: '北方华创', relation: '半导体设备', market: 'A股' }
  ],
  '半导体': [
    { code: '688981', name: '中芯国际', relation: '半导体制造', market: 'A股' },
    { code: '002371', name: '北方华创', relation: '半导体设备', market: 'A股' }
  ],
  
  // 消费
  '电商': [
    { code: '09988', name: '阿里巴巴', relation: '电商', market: '港股' },
    { code: '09618', name: '京东集团', relation: '电商', market: '港股' }
  ],
  '零售': [
    { code: '601933', name: '永辉超市', relation: '零售', market: 'A股' },
    { code: '600827', name: '百联股份', relation: '零售', market: 'A股' }
  ],
  '消费': [
    { code: '600887', name: '伊利股份', relation: '消费品', market: 'A股' },
    { code: '600519', name: '贵州茅台', relation: '消费品', market: 'A股' }
  ],
  
  // 金融
  '银行': [
    { code: '600036', name: '招商银行', relation: '商业银行', market: 'A股' },
    { code: '601166', name: '兴业银行', relation: '商业银行', market: 'A股' }
  ],
  '支付': [
    { code: '002065', name: '东华软件', relation: '金融IT', market: 'A股' },
    { code: '300468', name: '四方精创', relation: '金融科技', market: 'A股' }
  ],
  '保险': [
    { code: '601318', name: '中国平安', relation: '综合金融', market: 'A股' },
    { code: '601628', name: '中国人寿', relation: '保险', market: 'A股' }
  ],
  
  // 医药
  '医药': [
    { code: '600276', name: '恒瑞医药', relation: '制药', market: 'A股' },
    { code: '603259', name: '药明康德', relation: '医药研发', market: 'A股' }
  ],
  '医疗器械': [
    { code: '300760', name: '迈瑞医疗', relation: '医疗器械', market: 'A股' }
  ],
  
  // 能源
  '石油': [
    { code: '600028', name: '中国石化', relation: '石油炼化', market: 'A股' },
    { code: '601857', name: '中国石油', relation: '石油开采', market: 'A股' }
  ],
  '新能源': [
    { code: '002594', name: '比亚迪', relation: '新能源汽车', market: 'A股' },
    { code: '300750', name: '宁德时代', relation: '动力电池', market: 'A股' }
  ],
  
  // 工业
  '制造': [
    { code: '600031', name: '三一重工', relation: '工程机械', market: 'A股' }
  ],
  '物流': [
    { code: '002352', name: '顺丰控股', relation: '快递物流', market: 'A股' }
  ],
  
  // 通信
  '通信': [
    { code: '000063', name: '中兴通讯', relation: '通信设备', market: 'A股' },
    { code: '600050', name: '中国联通', relation: '通信运营', market: 'A股' }
  ]
};

/**
 * 使用AI分析公司业务并生成映射
 */
export async function generateDynamicMapping(
  symbol: string,
  companyName: string,
  companyInfo?: string
): Promise<DynamicMapping | null> {
  try {
    // 构建AI提示词
    const prompt = `请分析以下美股公司，并提供其主营业务和对应的中国A股/港股公司：

公司代码：${symbol}
公司名称：${companyName}
${companyInfo ? `公司信息：${companyInfo}` : ''}

请按以下JSON格式返回（只返回JSON，不要其他内容）：
{
  "business": "公司主营业务描述（20字以内）",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "relatedStocks": [
    {
      "code": "股票代码",
      "name": "公司名称",
      "relation": "关联关系",
      "market": "A股或港股"
    }
  ]
}

要求：
1. business要简洁准确，突出核心业务
2. keywords提取3-5个行业关键词
3. relatedStocks列出2-4家最相关的A股或港股公司
4. 优先选择行业龙头和直接竞品
5. 如果是中概股，直接返回对应的港股代码
6. 如果实在找不到对应公司，返回同行业的A股龙头

示例：
对于Apple (AAPL)，应返回：
{
  "business": "消费电子、智能手机、个人电脑",
  "keywords": ["消费电子", "智能手机", "芯片"],
  "relatedStocks": [
    {"code": "002475", "name": "立讯精密", "relation": "iPhone组装供应商", "market": "A股"},
    {"code": "300433", "name": "蓝思科技", "relation": "玻璃盖板供应商", "market": "A股"}
  ]
}`;

    // 调用通义千问API
    const response = await axios.post(
      QWEN_API_URL,
      {
        model: 'qwen-plus',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的股票分析师，精通中美股市和产业链关系。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message',
          max_tokens: 1000,
          temperature: 0.3
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data?.output?.choices?.[0]?.message?.content) {
      const content = response.data.output.choices[0].message.content;
      
      // 提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        return {
          symbol,
          business: result.business || '暂无业务描述',
          relatedStocks: result.relatedStocks || [],
          confidence: 0.8,
          generatedAt: new Date().toISOString()
        };
      }
    }

    // AI失败，使用关键词匹配
    return generateMappingByKeywords(symbol, companyName);

  } catch (error) {
    console.error(`Error generating dynamic mapping for ${symbol}:`, error);
    
    // 降级到关键词匹配
    return generateMappingByKeywords(symbol, companyName);
  }
}

/**
 * 基于关键词匹配生成映射（降级方案）
 */
function generateMappingByKeywords(
  symbol: string,
  companyName: string
): DynamicMapping | null {
  try {
    // 从公司名称提取关键词
    const name = companyName.toLowerCase();
    const relatedStocks: RelatedStock[] = [];
    let business = '暂无业务描述';

    // 匹配行业关键词
    for (const [keyword, stocks] of Object.entries(INDUSTRY_MAPPING)) {
      if (name.includes(keyword.toLowerCase()) || 
          name.includes(keyword)) {
        relatedStocks.push(...stocks.slice(0, 2));
        business = keyword;
        break;
      }
    }

    // 特殊处理：中概股
    if (symbol === 'BABA') {
      return {
        symbol,
        business: '电商、云计算、数字支付',
        relatedStocks: [
          { code: '09988', name: '阿里巴巴', relation: '港股同一公司', market: '港股' }
        ],
        confidence: 1.0,
        generatedAt: new Date().toISOString()
      };
    }

    if (relatedStocks.length === 0) {
      // 默认返回大盘指数相关
      relatedStocks.push(
        { code: '600036', name: '招商银行', relation: '金融龙头', market: 'A股' },
        { code: '601318', name: '中国平安', relation: '综合金融', market: 'A股' }
      );
      business = '综合业务';
    }

    return {
      symbol,
      business,
      relatedStocks: relatedStocks.slice(0, 4),
      confidence: 0.5,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error in keyword matching for ${symbol}:`, error);
    return null;
  }
}

/**
 * 批量生成动态映射
 */
export async function generateBatchMappings(
  stocks: Array<{ symbol: string; name: string }>
): Promise<Map<string, DynamicMapping>> {
  const mappings = new Map<string, DynamicMapping>();

  // 并发生成映射（限制并发数为3，避免API限流）
  const batchSize = 3;
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(stock => generateDynamicMapping(stock.symbol, stock.name))
    );

    results.forEach((mapping, index) => {
      if (mapping) {
        mappings.set(batch[index].symbol, mapping);
      }
    });

    // 避免API限流，批次间延迟
    if (i + batchSize < stocks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return mappings;
}
