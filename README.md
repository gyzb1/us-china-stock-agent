# 美股成交额排行榜 - US Stock Volume Tracker

一个实时追踪美股市场成交额最大的公司，并提供相关新闻分析的应用。

## 功能特点

### 核心功能
- 📊 **成交额Top 15**: 实时获取美股成交额排名前15的公司（按涨跌幅排序）
- 🌟 **新星公司追踪**: 自动检测首次进入Top 30的公司，单独板块展示
- 📰 **新闻资讯**: 获取近1-2天的相关新闻（东方财富API）
- 🤖 **AI智能总结**: 使用通义千问大模型自动总结新闻要点
- 🔗 **中美股市映射**: 60家美股公司对应的A股/港股龙头企业
- 💼 **业务描述**: 展示公司主营业务和产业链关系
- 🏷️ **市场标签**: 区分A股和港股，清晰展示市场类型
- 📈 **涨跌幅排序**: 按涨跌幅从高到低排序，一目了然市场情绪

### 特色功能
- 🌟 **新星追踪**: 持久化历史记录，自动检测新进入Top 30的公司
- 🎯 **重点关注**: 识别"爆表业绩"、"暴雷"等重大事件
- ⏰ **新闻过滤**: 只显示近1-2天的新闻，确保时效性
- 📊 **完整映射**: 覆盖60家美股公司，11个主要行业

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI**: React + TailwindCSS
- **图标**: Lucide React
- **数据源**:
  - 东方财富API（股票行情 + 新闻资讯）
  - 通义千问API（AI新闻总结）
- **AI能力**: 阿里云通义千问大模型

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## API 接口

### GET /api/stocks
获取成交额排名前20的美股基本信息

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 178.50,
      "change": 2.30,
      "changePercent": 1.30,
      "volume": 52000000,
      "amount": 9280000000
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/news?symbol=AAPL&limit=5
获取指定股票的新闻

**参数**:
- `symbol`: 股票代码（必需）
- `limit`: 返回新闻数量（可选，默认5）

### GET /api/stocks-with-news?limit=5
获取成交额排名前N的股票及其新闻摘要

**参数**:
- `limit`: 返回股票数量（可选，默认5）

**注意**: 使用东财新闻API，响应速度快，无需等待。

## 项目结构

```
us-china-stock-agent/
├── app/
│   ├── api/
│   │   ├── stocks/              # 股票行情API
│   │   ├── news/                # 新闻API
│   │   ├── stocks-with-news/    # 综合API（Top 15 + 新闻）
│   │   └── new-entrants/        # 新星公司API（新）
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # 主页面
├── components/
│   └── StockCard.tsx            # 股票卡片组件
├── lib/
│   ├── eastmoney-service.ts     # 东财行情API
│   ├── eastmoney-news-service.ts # 东财新闻API
│   ├── qwen-ai-service.ts       # 通义千问AI服务
│   ├── stock-mapping-data.ts    # 中美股票映射（60家）
│   └── history-tracker.ts       # 历史追踪器（新）
├── types/
│   └── stock.ts                 # 类型定义
├── data/
│   └── top30-history.json       # 历史记录（自动生成）
└── 文档/
    ├── COMPLETE_MAPPING_LIST.md    # 完整映射表
    ├── NEW_ENTRANTS_FEATURE.md     # 新星功能说明
    ├── NEWS_QUALITY_FIX.md         # 新闻质量优化
    ├── TSM_AND_SORTING_FIX.md      # TSM和排序修复
    ├── NEW_ENTRANTS_LOCATION.md    # 新进公司位置说明
    └── FINAL_SUMMARY.md            # 完整功能总结
```

## 使用说明

1. **刷新数据**: 点击"刷新数据"按钮快速获取最新股票行情
2. **获取新闻**: 点击"获取新闻"按钮获取东财最新资讯（快速响应）
3. **查看详情**: 每个股票卡片显示：
   - 📈 实时行情（价格、涨跌幅、成交量、成交额）
   - 💼 主营业务描述
   - 🔗 对应的A股龙头公司
   - 📰 最新新闻资讯
4. **访问新闻**: 点击新闻链接可以查看完整新闻内容

## API 说明

- **东方财富API**: 
  - 无需API Key
  - 完全免费
  - 包含行情和新闻数据
  - 请合理使用，避免频繁请求

## 开发计划

### 已完成 ✅
- [x] 支持中美股票映射关系（60家公司）
- [x] 使用东财新闻API（无需API Key）
- [x] 过滤ETF，只显示公司股票
- [x] 显示主营业务和A股/港股龙头
- [x] 集成通义千问AI智能总结新闻
- [x] 新闻时间过滤（近1-2天）
- [x] 按涨跌幅排序
- [x] 🌟 新星公司追踪功能
- [x] 识别重大事件（爆表业绩、暴雷等）
- [x] 持久化历史记录

### 计划中 📋
- [ ] 添加股票搜索功能
- [ ] 支持自定义关注列表
- [ ] 添加历史数据图表
- [ ] 新闻情绪分析可视化
- [ ] 导出数据功能

## License

MIT
