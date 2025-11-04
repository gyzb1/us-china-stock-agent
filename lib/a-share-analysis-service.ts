/**
 * A股公司基本面分析服务
 * 使用AI分析A股公司的基本面信息
 */

import axios from 'axios';

const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-fefa9fed5599445abd3532c3b8187488';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export interface AShareAnalysis {
  code: string;
  name: string;
  mainBusiness: string;          // 主营业务
  marketShare: string;            // 市场占有率
  competitiveAdvantage: string;   // 竞争优势
  industryPosition: string;       // 行业地位
  recentPerformance: string;      // 近期业绩
  growthPotential: string;        // 成长潜力
  risks: string;                  // 主要风险
  investmentSuggestion: string;   // 投资建议
  generatedAt: string;
}

/**
 * 使用AI分析A股公司基本面
 */
export async function analyzeAShareCompany(
  code: string,
  name: string,
  relation?: string
): Promise<AShareAnalysis | null> {
  try {
    // 获取当前日期，用于确定最新财报期
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-11，需要+1
    
    // 判断最新财报期
    let latestReport = '';
    if (currentMonth >= 11) {
      latestReport = `${currentYear}年三季报`;
    } else if (currentMonth >= 9) {
      latestReport = `${currentYear}年中报`;
    } else if (currentMonth >= 5) {
      latestReport = `${currentYear}年一季报`;
    } else {
      latestReport = `${currentYear - 1}年年报`;
    }

    const prompt = `请对以下A股公司进行全面的基本面分析：

公司代码：${code}
公司名称：${name}
${relation ? `业务关系：${relation}` : ''}
当前时间：${currentYear}年${currentMonth}月

请按以下结构进行分析（只返回JSON，不要其他内容）：
{
  "mainBusiness": "主营业务描述（50字以内，说明公司核心业务和产品）",
  "marketShare": "市场占有率情况（30字以内，说明在细分市场的地位和份额）",
  "competitiveAdvantage": "核心竞争优势（80字以内，说明技术、品牌、渠道等优势）",
  "industryPosition": "行业地位（30字以内，如：行业龙头、细分领域第一等）",
  "recentPerformance": "近期业绩表现（60字以内，基于最新财报数据说明营收、利润增长情况）",
  "growthPotential": "成长潜力（60字以内，说明未来增长点和发展空间）",
  "risks": "主要风险（60字以内，说明行业风险、竞争风险等）",
  "investmentSuggestion": "投资建议（40字以内，给出简要投资观点）"
}

重要要求：
1. 【近期业绩表现】必须使用最新的财报数据（${latestReport}或更新的数据）
2. 如果有${currentYear}年三季报数据，优先使用三季报
3. 如果没有三季报，使用${currentYear}年中报数据
4. 明确标注财报期，例如："${currentYear}年三季报营收XXX亿元，同比增长XX%"
5. 避免使用过时的2023年、2024年数据
6. 基于真实的公开财报信息
7. 语言简洁专业，数据准确客观
8. 如果最新财报信息不确定，说明"最新财报数据待披露"

示例：
对于立讯精密（002475），如果当前是2025年11月，应返回：
{
  "mainBusiness": "消费电子精密组件及组装业务，主要为苹果等客户提供连接器、声学、无线充电等产品",
  "marketShare": "全球消费电子连接器市场份额约15%，苹果供应链核心厂商",
  "competitiveAdvantage": "深度绑定苹果产业链，具备垂直整合能力，从零部件到整机组装全覆盖，技术研发实力强",
  "industryPosition": "消费电子精密制造龙头，苹果最大组装厂商之一",
  "recentPerformance": "2025年三季报营收1156亿元，同比增长15.2%，净利润78.5亿元，同比增长10.8%",
  "growthPotential": "受益于AI硬件、VR/AR设备增长，向汽车电子、医疗电子等领域拓展",
  "risks": "过度依赖苹果订单（占比超60%），消费电子需求波动，中美贸易摩擦影响",
  "investmentSuggestion": "业绩稳健，长期成长性好，适合中长期配置"
}`;

    const response = await axios.post(
      QWEN_API_URL,
      {
        model: 'qwen-plus',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的A股分析师，精通基本面分析和价值投资。你的分析基于公开信息，客观准确。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message',
          max_tokens: 1500,
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
          code,
          name,
          mainBusiness: result.mainBusiness || '信息有限',
          marketShare: result.marketShare || '信息有限',
          competitiveAdvantage: result.competitiveAdvantage || '信息有限',
          industryPosition: result.industryPosition || '信息有限',
          recentPerformance: result.recentPerformance || '信息有限',
          growthPotential: result.growthPotential || '信息有限',
          risks: result.risks || '信息有限',
          investmentSuggestion: result.investmentSuggestion || '信息有限',
          generatedAt: new Date().toISOString()
        };
      }
    }

    return null;

  } catch (error) {
    console.error(`Error analyzing A-share company ${code}:`, error);
    return null;
  }
}

/**
 * 批量分析多个A股公司
 */
export async function analyzeBatchAShareCompanies(
  companies: Array<{ code: string; name: string; relation?: string }>
): Promise<Map<string, AShareAnalysis>> {
  const analyses = new Map<string, AShareAnalysis>();

  // 并发分析（限制并发数为2，避免API限流）
  const batchSize = 2;
  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(company => 
        analyzeAShareCompany(company.code, company.name, company.relation)
      )
    );

    results.forEach((analysis, index) => {
      if (analysis) {
        analyses.set(batch[index].code, analysis);
      }
    });

    // 批次间延迟，避免API限流
    if (i + batchSize < companies.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return analyses;
}
