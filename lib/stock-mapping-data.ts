/**
 * 美股到A股/港股的映射关系数据库
 * 包含主营业务和对应的A股、港股龙头公司
 * 
 * 注意：只映射有明确对应关系的公司，没有对应的不强行映射
 */

import { RelatedStock } from '@/types/stock';

export interface StockMapping {
  symbol: string;
  business: string; // 主营业务
  relatedStocks: RelatedStock[]; // 对应的A股和港股公司
}

// 美股公司映射数据
export const US_TO_STOCK_MAPPING: Record<string, StockMapping> = {
  // 科技巨头
  'AAPL': {
    symbol: 'AAPL',
    business: '消费电子、智能手机、个人电脑、可穿戴设备',
    relatedStocks: [
      { code: '002475', name: '立讯精密', relation: 'iPhone组装供应商', market: 'A股' },
      { code: '300433', name: '蓝思科技', relation: '玻璃盖板供应商', market: 'A股' },
      { code: '002241', name: '歌尔股份', relation: 'AirPods供应商', market: 'A股' },
      { code: '02382', name: '舜宇光学', relation: '摄像头供应商', market: '港股' }
    ]
  },
  'MSFT': {
    symbol: 'MSFT',
    business: '云计算、操作系统、办公软件、游戏',
    relatedStocks: [
      { code: '600588', name: '用友网络', relation: '企业软件', market: 'A股' },
      { code: '002230', name: '科大讯飞', relation: 'AI与云服务', market: 'A股' },
      { code: '688111', name: '金山办公', relation: '办公软件', market: 'A股' },
      { code: '00700', name: '腾讯控股', relation: '云计算与游戏', market: '港股' }
    ]
  },
  'GOOGL': {
    symbol: 'GOOGL',
    business: '搜索引擎、在线广告、云计算、AI',
    relatedStocks: [
      { code: '002230', name: '科大讯飞', relation: 'AI技术', market: 'A股' },
      { code: '300059', name: '东方财富', relation: '互联网广告', market: 'A股' },
      { code: '00700', name: '腾讯控股', relation: '互联网广告', market: '港股' },
      { code: '09888', name: '百度集团', relation: '搜索引擎', market: '港股' }
    ]
  },
  'GOOG': {
    symbol: 'GOOG',
    business: '搜索引擎、在线广告、云计算、AI（C类股）',
    relatedStocks: [
      { code: '002230', name: '科大讯飞', relation: 'AI技术', market: 'A股' },
      { code: '300059', name: '东方财富', relation: '互联网广告', market: 'A股' },
      { code: '00700', name: '腾讯控股', relation: '互联网广告', market: '港股' },
      { code: '09888', name: '百度集团', relation: '搜索引擎', market: '港股' }
    ]
  },
  'AMZN': {
    symbol: 'AMZN',
    business: '电商、云计算AWS、物流、AI',
    relatedStocks: [
      { code: '002352', name: '顺丰控股', relation: '物流快递', market: 'A股' },
      { code: '09618', name: '京东集团', relation: '电商物流', market: '港股' },
      { code: '09988', name: '阿里巴巴', relation: '电商云计算', market: '港股' }
    ]
  },
  'NVDA': {
    symbol: 'NVDA',
    business: 'GPU芯片、AI计算、数据中心',
    relatedStocks: [
      { code: '688256', name: '寒武纪', relation: 'AI芯片', market: 'A股' },
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
      { code: '002371', name: '北方华创', relation: '半导体设备', market: 'A股' }
    ]
  },
  'TSLA': {
    symbol: 'TSLA',
    business: '电动汽车、自动驾驶、储能',
    relatedStocks: [
      { code: '002594', name: '比亚迪', relation: '电动汽车', market: 'A股' },
      { code: '300750', name: '宁德时代', relation: '动力电池', market: 'A股' },
      { code: '002920', name: '德赛西威', relation: '智能驾驶', market: 'A股' },
      { code: '01211', name: '比亚迪股份', relation: '电动汽车', market: '港股' }
    ]
  },
  'META': {
    symbol: 'META',
    business: '社交媒体、元宇宙、在线广告',
    relatedStocks: [
      { code: '00700', name: '腾讯控股', relation: '社交媒体', market: '港股' },
      { code: '300059', name: '东方财富', relation: '互联网广告', market: 'A股' },
      { code: '002555', name: '三七互娱', relation: '游戏社交', market: 'A股' }
    ]
  },
  'BABA': {
    symbol: 'BABA',
    business: '电商、云计算、数字支付',
    relatedStocks: [
      { code: '09988', name: '阿里巴巴', relation: '同一公司', market: '港股' },
      { code: '002352', name: '顺丰控股', relation: '物流', market: 'A股' },
      { code: '09618', name: '京东集团', relation: '电商竞品', market: '港股' }
    ]
  },
  'BIDU': {
    symbol: 'BIDU',
    business: '搜索引擎、AI、自动驾驶',
    relatedStocks: [
      { code: '09888', name: '百度集团', relation: '同一公司', market: '港股' },
      { code: '002230', name: '科大讯飞', relation: 'AI技术', market: 'A股' },
      { code: '002920', name: '德赛西威', relation: '智能驾驶', market: 'A股' }
    ]
  },
  'PDD': {
    symbol: 'PDD',
    business: '社交电商、跨境电商',
    relatedStocks: [
      { code: '002352', name: '顺丰控股', relation: '物流', market: 'A股' },
      { code: '09618', name: '京东集团', relation: '电商竞品', market: '港股' },
      { code: '09988', name: '阿里巴巴', relation: '电商竞品', market: '港股' }
    ]
  },
  'JD': {
    symbol: 'JD',
    business: '电商、物流、零售',
    relatedStocks: [
      { code: '09618', name: '京东集团', relation: '同一公司', market: '港股' },
      { code: '002352', name: '顺丰控股', relation: '物流快递', market: 'A股' }
    ]
  },
  'PLTR': {
    symbol: 'PLTR',
    business: '大数据分析、AI平台、政府和企业软件',
    relatedStocks: [
      { code: '002230', name: '科大讯飞', relation: 'AI技术平台', market: 'A股' },
      { code: '600588', name: '用友网络', relation: '企业软件', market: 'A股' },
      { code: '300454', name: '深信服', relation: '数据安全', market: 'A股' }
    ]
  },
  'AVGO': {
    symbol: 'AVGO',
    business: '半导体芯片、网络设备、存储解决方案',
    relatedStocks: [
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
      { code: '002049', name: '紫光国微', relation: '芯片设计', market: 'A股' },
      { code: '603986', name: '兆易创新', relation: '存储芯片', market: 'A股' }
    ]
  },
  'AMD': {
    symbol: 'AMD',
    business: 'CPU、GPU芯片、数据中心',
    relatedStocks: [
      { code: '688256', name: '寒武纪', relation: 'AI芯片', market: 'A股' },
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
      { code: '002049', name: '紫光国微', relation: '芯片设计', market: 'A股' }
    ]
  },
  'INTC': {
    symbol: 'INTC',
    business: 'CPU芯片、半导体制造',
    relatedStocks: [
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
      { code: '002371', name: '北方华创', relation: '半导体设备', market: 'A股' },
      { code: '688008', name: '澜起科技', relation: '芯片设计', market: 'A股' }
    ]
  },
  'CRM': {
    symbol: 'CRM',
    business: '企业CRM软件、云服务',
    relatedStocks: [
      { code: '600588', name: '用友网络', relation: '企业软件', market: 'A股' },
      { code: '600845', name: '宝信软件', relation: '企业云服务', market: 'A股' },
      { code: '002410', name: '广联达', relation: '企业管理软件', market: 'A股' }
    ]
  },
  'ORCL': {
    symbol: 'ORCL',
    business: '数据库、企业软件、云服务',
    relatedStocks: [
      { code: '600588', name: '用友网络', relation: '企业软件', market: 'A股' },
      { code: '600845', name: '宝信软件', relation: '企业云服务', market: 'A股' }
    ]
  },
  'LLY': {
    symbol: 'LLY',
    business: '制药、生物医药、糖尿病治疗',
    relatedStocks: [
      { code: '600276', name: '恒瑞医药', relation: '创新药', market: 'A股' },
      { code: '300760', name: '迈瑞医疗', relation: '医疗器械', market: 'A股' },
      { code: '603259', name: '药明康德', relation: '医药研发', market: 'A股' }
    ]
  },
  'WMT': {
    symbol: 'WMT',
    business: '连锁超市、零售、电商',
    relatedStocks: [
      { code: '601933', name: '永辉超市', relation: '连锁超市', market: 'A股' },
      { code: '600827', name: '百联股份', relation: '零售', market: 'A股' }
    ]
  },
  'JPM': {
    symbol: 'JPM',
    business: '投资银行、资产管理、金融服务',
    relatedStocks: [
      { code: '601318', name: '中国平安', relation: '综合金融', market: 'A股' },
      { code: '600036', name: '招商银行', relation: '商业银行', market: 'A股' },
      { code: '600030', name: '中信证券', relation: '证券投资', market: 'A股' }
    ]
  },
  'UNH': {
    symbol: 'UNH',
    business: '医疗保险、健康管理',
    relatedStocks: [
      { code: '601318', name: '中国平安', relation: '保险', market: 'A股' },
      { code: '601601', name: '中国太保', relation: '保险', market: 'A股' },
      { code: '601628', name: '中国人寿', relation: '人寿保险', market: 'A股' }
    ]
  },
  'MU': {
    symbol: 'MU',
    business: '存储芯片、DRAM、NAND闪存、固态硬盘',
    relatedStocks: [
      { code: '301308', name: '江波龙', relation: '存储模组龙头', market: 'A股' },
      { code: '301055', name: '香农芯创', relation: '存储控制芯片', market: 'A股' },
      { code: '603986', name: '兆易创新', relation: 'NOR Flash存储', market: 'A股' },
      { code: '688981', name: '中芯国际', relation: '存储芯片制造', market: 'A股' }
    ]
  },
  'NFLX': {
    symbol: 'NFLX',
    business: '流媒体、视频订阅、内容制作',
    relatedStocks: [
      { code: '300413', name: '芒果超媒', relation: '视频平台', market: 'A股' },
      { code: '002739', name: '万达电影', relation: '影视内容', market: 'A股' },
      { code: '00700', name: '腾讯控股', relation: '视频平台', market: '港股' }
    ]
  },
  'DIS': {
    symbol: 'DIS',
    business: '娱乐、主题公园、影视制作',
    relatedStocks: [
      { code: '002739', name: '万达电影', relation: '影视娱乐', market: 'A股' },
      { code: '300251', name: '光线传媒', relation: '影视制作', market: 'A股' },
      { code: '000069', name: '华侨城A', relation: '主题公园', market: 'A股' }
    ]
  },
  'ADBE': {
    symbol: 'ADBE',
    business: '创意软件、PDF、设计工具',
    relatedStocks: [
      { code: '688111', name: '金山办公', relation: '办公软件', market: 'A股' },
      { code: '300182', name: '捷成股份', relation: '数字内容', market: 'A股' }
    ]
  },
  'V': {
    symbol: 'V',
    business: '支付网络、信用卡、金融科技',
    relatedStocks: [
      { code: '002065', name: '东华软件', relation: '金融IT', market: 'A股' },
      { code: '002152', name: '广电运通', relation: '支付设备', market: 'A股' },
      { code: '300468', name: '四方精创', relation: '金融科技', market: 'A股' }
    ]
  },
  'MA': {
    symbol: 'MA',
    business: '支付网络、信用卡处理',
    relatedStocks: [
      { code: '002065', name: '东华软件', relation: '金融IT', market: 'A股' },
      { code: '002152', name: '广电运通', relation: '支付设备', market: 'A股' },
      { code: '300468', name: '四方精创', relation: '金融科技', market: 'A股' }
    ]
  },
  'PYPL': {
    symbol: 'PYPL',
    business: '在线支付、数字钱包',
    relatedStocks: [
      { code: '002065', name: '东华软件', relation: '金融IT', market: 'A股' },
      { code: '300468', name: '四方精创', relation: '金融科技', market: 'A股' }
    ]
  },
  'NKE': {
    symbol: 'NKE',
    business: '运动鞋服、体育用品',
    relatedStocks: [
      { code: '002029', name: '七匹狼', relation: '服装品牌', market: 'A股' },
      { code: '600177', name: '雅戈尔', relation: '服装制造', market: 'A股' },
      { code: '002563', name: '森马服饰', relation: '服装零售', market: 'A股' }
    ]
  },
  'COST': {
    symbol: 'COST',
    business: '会员制仓储超市、零售',
    relatedStocks: [
      { code: '601933', name: '永辉超市', relation: '连锁超市', market: 'A股' },
      { code: '600827', name: '百联股份', relation: '零售', market: 'A股' }
    ]
  },
  'UBER': {
    symbol: 'UBER',
    business: '网约车、外卖配送',
    relatedStocks: [
      { code: '002352', name: '顺丰控股', relation: '物流配送', market: 'A股' },
      { code: '603056', name: '德邦股份', relation: '物流', market: 'A股' }
    ]
  },
  'ABNB': {
    symbol: 'ABNB',
    business: '民宿短租、旅游住宿',
    relatedStocks: [
      { code: '600754', name: '锦江酒店', relation: '酒店住宿', market: 'A股' },
      { code: '600258', name: '首旅酒店', relation: '酒店', market: 'A股' }
    ]
  },
  'FI': {
    symbol: 'FI',
    business: '金融科技、支付处理、银行技术解决方案',
    relatedStocks: [
      { code: '002065', name: '东华软件', relation: '金融IT', market: 'A股' },
      { code: '300468', name: '四方精创', relation: '金融科技', market: 'A股' },
      { code: '002152', name: '广电运通', relation: '支付设备', market: 'A股' },
      { code: '300033', name: '同花顺', relation: '金融软件', market: 'A股' }
    ]
  },
  'BRK.B': {
    symbol: 'BRK.B',
    business: '多元化控股、保险、投资',
    relatedStocks: [
      { code: '601318', name: '中国平安', relation: '综合金融', market: 'A股' },
      { code: '601628', name: '中国人寿', relation: '保险', market: 'A股' },
      { code: '600036', name: '招商银行', relation: '银行投资', market: 'A股' }
    ]
  },
  'XOM': {
    symbol: 'XOM',
    business: '石油天然气、能源',
    relatedStocks: [
      { code: '600028', name: '中国石化', relation: '石油炼化', market: 'A股' },
      { code: '601857', name: '中国石油', relation: '石油开采', market: 'A股' },
      { code: '600346', name: '恒力石化', relation: '石化', market: 'A股' }
    ]
  },
  'CVX': {
    symbol: 'CVX',
    business: '石油天然气、能源',
    relatedStocks: [
      { code: '600028', name: '中国石化', relation: '石油炼化', market: 'A股' },
      { code: '601857', name: '中国石油', relation: '石油开采', market: 'A股' }
    ]
  },
  'PG': {
    symbol: 'PG',
    business: '日用消费品、个人护理',
    relatedStocks: [
      { code: '600887', name: '伊利股份', relation: '消费品', market: 'A股' },
      { code: '000858', name: '五粮液', relation: '消费品', market: 'A股' },
      { code: '600519', name: '贵州茅台', relation: '消费品', market: 'A股' }
    ]
  },
  'KO': {
    symbol: 'KO',
    business: '饮料、可口可乐',
    relatedStocks: [
      { code: '600887', name: '伊利股份', relation: '饮料食品', market: 'A股' },
      { code: '600600', name: '青岛啤酒', relation: '饮料', market: 'A股' },
      { code: '002568', name: '百润股份', relation: '饮料', market: 'A股' }
    ]
  },
  'PEP': {
    symbol: 'PEP',
    business: '饮料、食品、百事可乐',
    relatedStocks: [
      { code: '600887', name: '伊利股份', relation: '饮料食品', market: 'A股' },
      { code: '600600', name: '青岛啤酒', relation: '饮料', market: 'A股' }
    ]
  },
  'MCD': {
    symbol: 'MCD',
    business: '快餐连锁、麦当劳',
    relatedStocks: [
      { code: '603711', name: '香飘飘', relation: '食品饮料', market: 'A股' },
      { code: '603345', name: '安井食品', relation: '食品', market: 'A股' }
    ]
  },
  'ABT': {
    symbol: 'ABT',
    business: '医疗器械、制药、诊断',
    relatedStocks: [
      { code: '300760', name: '迈瑞医疗', relation: '医疗器械', market: 'A股' },
      { code: '600276', name: '恒瑞医药', relation: '制药', market: 'A股' },
      { code: '300015', name: '爱尔眼科', relation: '医疗服务', market: 'A股' }
    ]
  },
  'TMO': {
    symbol: 'TMO',
    business: '生命科学、实验室设备、诊断',
    relatedStocks: [
      { code: '300760', name: '迈瑞医疗', relation: '医疗器械', market: 'A股' },
      { code: '603259', name: '药明康德', relation: '医药研发', market: 'A股' }
    ]
  },
  'DHR': {
    symbol: 'DHR',
    business: '生命科学、诊断、环境',
    relatedStocks: [
      { code: '300760', name: '迈瑞医疗', relation: '医疗器械', market: 'A股' },
      { code: '603259', name: '药明康德', relation: '医药研发', market: 'A股' }
    ]
  },
  'BAC': {
    symbol: 'BAC',
    business: '商业银行、投资银行',
    relatedStocks: [
      { code: '601318', name: '中国平安', relation: '综合金融', market: 'A股' },
      { code: '600036', name: '招商银行', relation: '商业银行', market: 'A股' },
      { code: '601166', name: '兴业银行', relation: '商业银行', market: 'A股' }
    ]
  },
  'WFC': {
    symbol: 'WFC',
    business: '商业银行、金融服务',
    relatedStocks: [
      { code: '600036', name: '招商银行', relation: '商业银行', market: 'A股' },
      { code: '601166', name: '兴业银行', relation: '商业银行', market: 'A股' }
    ]
  },
  'HD': {
    symbol: 'HD',
    business: '家居建材零售',
    relatedStocks: [
      { code: '601933', name: '永辉超市', relation: '零售', market: 'A股' },
      { code: '600827', name: '百联股份', relation: '零售', market: 'A股' }
    ]
  },
  'LOW': {
    symbol: 'LOW',
    business: '家居建材零售',
    relatedStocks: [
      { code: '601933', name: '永辉超市', relation: '零售', market: 'A股' },
      { code: '600827', name: '百联股份', relation: '零售', market: 'A股' }
    ]
  },
  'UPS': {
    symbol: 'UPS',
    business: '快递物流',
    relatedStocks: [
      { code: '002352', name: '顺丰控股', relation: '快递物流', market: 'A股' },
      { code: '603056', name: '德邦股份', relation: '物流', market: 'A股' }
    ]
  },
  'FDX': {
    symbol: 'FDX',
    business: '快递物流',
    relatedStocks: [
      { code: '002352', name: '顺丰控股', relation: '快递物流', market: 'A股' },
      { code: '603056', name: '德邦股份', relation: '物流', market: 'A股' }
    ]
  },
  'QCOM': {
    symbol: 'QCOM',
    business: '移动芯片、5G技术',
    relatedStocks: [
      { code: '002049', name: '紫光国微', relation: '芯片设计', market: 'A股' },
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
      { code: '300782', name: '卓胜微', relation: '射频芯片', market: 'A股' }
    ]
  },
  'TXN': {
    symbol: 'TXN',
    business: '模拟芯片、嵌入式处理器',
    relatedStocks: [
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' },
      { code: '002049', name: '紫光国微', relation: '芯片设计', market: 'A股' },
      { code: '688008', name: '澜起科技', relation: '芯片设计', market: 'A股' }
    ]
  },
  'CSCO': {
    symbol: 'CSCO',
    business: '网络设备、通信',
    relatedStocks: [
      { code: '000063', name: '中兴通讯', relation: '通信设备', market: 'A股' },
      { code: '600050', name: '中国联通', relation: '通信运营', market: 'A股' },
      { code: '300308', name: '中际旭创', relation: '光模块', market: 'A股' }
    ]
  },
  'TSM': {
    symbol: 'TSM',
    business: '晶圆代工、芯片制造',
    relatedStocks: [
      { code: '688981', name: '中芯国际', relation: '晶圆代工', market: 'A股' },
      { code: '002371', name: '北方华创', relation: '半导体设备', market: 'A股' },
      { code: '688012', name: '中微公司', relation: '半导体设备', market: 'A股' },
      { code: '688396', name: '华润微', relation: '芯片制造', market: 'A股' }
    ]
  },
  'ASML': {
    symbol: 'ASML',
    business: '光刻机、半导体设备',
    relatedStocks: [
      { code: '002371', name: '北方华创', relation: '半导体设备', market: 'A股' },
      { code: '688012', name: '中微公司', relation: '半导体设备', market: 'A股' },
      { code: '688981', name: '中芯国际', relation: '芯片制造', market: 'A股' }
    ]
  }
};

/**
 * 获取美股对应的A股/港股映射信息
 * 优先从静态映射表获取，如果不存在则返回null（由动态映射服务处理）
 */
export function getStockMapping(symbol: string): StockMapping | null {
  return US_TO_STOCK_MAPPING[symbol.toUpperCase()] || null;
}

/**
 * 检查是否有静态映射
 */
export function hasStaticMapping(symbol: string): boolean {
  return symbol.toUpperCase() in US_TO_STOCK_MAPPING;
}

/**
 * 获取所有已映射的股票代码
 */
export function getAllMappedSymbols(): string[] {
  return Object.keys(US_TO_STOCK_MAPPING);
}

/**
 * 获取默认映射（当没有具体映射时返回null）
 */
export function getDefaultMapping(symbol: string, name: string): StockMapping | null {
  // 不再提供默认映射，没有就是没有
  return null;
}
