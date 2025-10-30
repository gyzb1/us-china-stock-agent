# 更新日志

## v2.0.0 - 2025-10-30

### 🎉 重大更新

#### 新增功能
1. **中美股票映射** 
   - 每个美股公司显示对应的A股龙头企业
   - 包含股票代码、公司名称、关联关系
   - 覆盖25+主流美股公司

2. **主营业务描述**
   - 展示每个公司的核心业务
   - 帮助理解公司定位和产业链

3. **东财新闻API**
   - 替换Alpha Vantage，使用东方财富新闻API
   - 无需API Key，完全免费
   - 响应速度快，无调用限制
   - 并行获取新闻，不再需要等待

#### 优化改进
1. **ETF过滤**
   - 自动过滤50+常见ETF（SPY、QQQ等）
   - 只显示真正的公司股票

2. **显示数量**
   - 从5个增加到15个公司
   - 更全面的市场覆盖

3. **UI优化**
   - 新增主营业务展示区域（公文包图标）
   - 新增A股映射展示区域（双向箭头图标）
   - 灰色背景卡片展示映射关系
   - 更清晰的信息层级

#### 技术改进
1. **新增文件**
   - `lib/eastmoney-news-service.ts` - 东财新闻服务
   - `lib/stock-mapping-data.ts` - 映射数据库
   - `MAPPING_INFO.md` - 映射说明文档

2. **修改文件**
   - `types/stock.ts` - 添加映射相关类型
   - `lib/eastmoney-service.ts` - 集成映射数据
   - `components/StockCard.tsx` - 显示业务和映射
   - `app/api/stocks-with-news/route.ts` - 使用东财新闻
   - `app/api/news/route.ts` - 使用东财新闻
   - `app/page.tsx` - 更新UI文案

3. **文档更新**
   - `README.md` - 更新功能说明
   - `QUICKSTART.md` - 简化启动步骤
   - `.env.example` - 移除API Key要求

### 📊 数据覆盖

#### 已支持的美股公司映射
- **科技巨头**: AAPL, MSFT, GOOGL, AMZN, META, NFLX
- **芯片半导体**: NVDA, AMD, INTC
- **新能源**: TSLA
- **中概股**: BABA, PDD, JD, BIDU
- **企业软件**: CRM, ORCL, ADBE
- **金融支付**: PYPL, V, MA
- **消费零售**: NKE, COST, DIS, UBER, ABNB

### 🚀 性能提升

- ⚡ 新闻获取速度提升 **10倍+**（从2-3分钟降至5-10秒）
- ⚡ 并行请求，不再串行等待
- ⚡ 无API限制，可随时刷新

### 💡 用户体验

- ✅ 无需注册和配置API Key
- ✅ 一键启动，开箱即用
- ✅ 更丰富的信息展示
- ✅ 更快的响应速度

---

## v1.0.0 - 2025-10-30

### 初始版本

#### 核心功能
1. 获取美股成交额排行榜
2. 使用Alpha Vantage API获取新闻
3. 显示股价、涨跌幅、成交量等基本信息
4. 新闻情绪分析

#### 技术栈
- Next.js 14
- React + TailwindCSS
- 东方财富API（行情）
- Alpha Vantage API（新闻）
