# API 文档

本项目提供两个独立的 API 端点，用于获取页面展示的股票数据，方便在其他应用中集成使用。

## 基础信息

- **基础 URL**: `http://localhost:3000` (开发环境) 或你的部署域名
- **响应格式**: JSON
- **字符编码**: UTF-8
- **缓存机制**: 内存缓存，自动过期

---

## 1. Top 15 成交额公司 API

### 端点
```
GET /api/display/top-stocks
```

### 描述
获取成交额排名前15的美股公司完整展示数据，包含股票基本信息、新闻和AI总结，按涨跌幅从高到低排序。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `limit` | number | 否 | 15 | 返回的股票数量 |
| `includeNews` | boolean | 否 | true | 是否包含新闻和AI总结 |
| `noCache` | boolean | 否 | false | 是否跳过缓存，强制刷新数据 |

### 请求示例

```bash
# 获取Top 15股票（包含新闻）
curl "http://localhost:3000/api/display/top-stocks"

# 获取Top 10股票（包含新闻）
curl "http://localhost:3000/api/display/top-stocks?limit=10"

# 获取Top 15股票（不包含新闻，响应更快）
curl "http://localhost:3000/api/display/top-stocks?includeNews=false"

# 强制刷新，跳过缓存
curl "http://localhost:3000/api/display/top-stocks?noCache=true"
```

### 响应格式

```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "name": "苹果公司",
      "price": 180.50,
      "change": 4.50,
      "changePercent": 2.56,
      "volume": 50000000000,
      "volumeFormatted": "500亿",
      "business": "苹果公司主要从事消费电子产品的设计、制造和销售...",
      "aShareLeader": "A股对应龙头：立讯精密(002475)、歌尔股份(002241)...",
      "news": [
        {
          "title": "苹果发布新产品",
          "url": "https://...",
          "publishTime": "2024-01-01 10:00:00",
          "source": "东方财富"
        }
      ],
      "newsSummary": "📊 最新动态：苹果公司近期发布了新款产品..."
    }
  ],
  "count": 15,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "sortBy": "changePercent",
  "sortOrder": "desc",
  "includeNews": true,
  "fromCache": false,
  "cacheInfo": {
    "key": "top-stocks:includeNews=true&limit=15",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "age": 0,
    "ttl": 300,
    "isExpired": false
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 请求是否成功 |
| `data` | array | 股票数据数组 |
| `data[].symbol` | string | 股票代码 |
| `data[].name` | string | 公司名称 |
| `data[].price` | number | 当前价格 |
| `data[].change` | number | 涨跌额 |
| `data[].changePercent` | number | 涨跌幅(%) |
| `data[].volume` | number | 成交额（原始值） |
| `data[].volumeFormatted` | string | 成交额（格式化） |
| `data[].business` | string | 主营业务描述 |
| `data[].aShareLeader` | string | 对应A股龙头 |
| `data[].news` | array | 新闻列表 |
| `data[].newsSummary` | string | AI总结的新闻摘要 |
| `count` | number | 返回的股票数量 |
| `timestamp` | string | 数据时间戳 |
| `sortBy` | string | 排序字段 |
| `sortOrder` | string | 排序方向 |
| `includeNews` | boolean | 是否包含新闻 |

### 错误响应

```json
{
  "success": false,
  "error": "错误信息描述",
  "data": [],
  "count": 0
}
```

---

## 2. 新星公司 API

### 端点
```
GET /api/display/new-entrants
```

### 描述
获取首次进入成交额Top 30的"新星公司"完整展示数据，包含股票基本信息、新闻、AI总结和进入排名，按涨跌幅从高到低排序。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `includeNews` | boolean | 否 | true | 是否包含新闻和AI总结 |
| `noCache` | boolean | 否 | false | 是否跳过缓存，强制刷新数据 |

### 请求示例

```bash
# 获取新星公司（包含新闻）
curl "http://localhost:3000/api/display/new-entrants"

# 获取新星公司（不包含新闻，响应更快）
curl "http://localhost:3000/api/display/new-entrants?includeNews=false"

# 强制刷新，跳过缓存
curl "http://localhost:3000/api/display/new-entrants?noCache=true"
```

### 响应格式（有新公司）

```json
{
  "success": true,
  "data": [
    {
      "symbol": "NVDA",
      "name": "英伟达",
      "price": 450.00,
      "change": 22.50,
      "changePercent": 5.26,
      "volume": 30000000000,
      "volumeFormatted": "300亿",
      "business": "英伟达是全球领先的人工智能计算公司...",
      "aShareLeader": "A股对应龙头：寒武纪(688256)、海光信息(688041)...",
      "news": [
        {
          "title": "英伟达AI芯片需求强劲",
          "url": "https://...",
          "publishTime": "2024-01-01 09:30:00",
          "source": "东方财富"
        }
      ],
      "newsSummary": "🚀 重大突破：英伟达AI芯片需求持续强劲..."
    }
  ],
  "newEntrants": [
    {
      "symbol": "NVDA",
      "volume": 30000000000,
      "rank": 15,
      "timestamp": "2024-01-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "发现1家新进入Top 30的公司",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "sortBy": "changePercent",
  "sortOrder": "desc",
  "includeNews": true,
  "fromCache": false,
  "cacheInfo": {
    "key": "new-entrants:includeNews=true",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "age": 0,
    "ttl": 600,
    "isExpired": false
  }
}
```

### 响应格式（无新公司）

```json
{
  "success": true,
  "data": [],
  "newEntrants": [],
  "count": 0,
  "message": "今日暂无新进入Top 30的公司",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "sortBy": "changePercent",
  "sortOrder": "desc",
  "includeNews": true
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 请求是否成功 |
| `data` | array | 新星公司股票数据数组（字段同Top 15 API） |
| `newEntrants` | array | 新进入公司的元数据 |
| `newEntrants[].symbol` | string | 股票代码 |
| `newEntrants[].volume` | number | 成交额 |
| `newEntrants[].rank` | number | 当前排名 |
| `newEntrants[].timestamp` | string | 进入时间 |
| `count` | number | 新星公司数量 |
| `message` | string | 状态消息 |
| `timestamp` | string | 数据时间戳 |
| `sortBy` | string | 排序字段 |
| `sortOrder` | string | 排序方向 |
| `includeNews` | boolean | 是否包含新闻 |
| `fromCache` | boolean | 是否来自缓存 |
| `cacheInfo` | object | 缓存信息（仅当 fromCache=true 时存在） |

### 缓存机制

- **缓存时间**: 10分钟
- **缓存策略**: 基于 `includeNews` 参数生成缓存键
- **强制刷新**: 使用 `noCache=true` 参数跳过缓存
- **自动清理**: 过期缓存每10分钟自动清理

### 错误响应

```json
{
  "success": false,
  "error": "错误信息描述",
  "data": [],
  "newEntrants": [],
  "count": 0
}
```

---

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取Top 15股票
async function getTopStocks() {
  const response = await fetch('http://localhost:3000/api/display/top-stocks');
  const data = await response.json();
  
  if (data.success) {
    console.log(`获取到 ${data.count} 只股票`);
    data.data.forEach(stock => {
      console.log(`${stock.symbol}: ${stock.name} - ${stock.changePercent}%`);
    });
  }
}

// 获取新星公司
async function getNewEntrants() {
  const response = await fetch('http://localhost:3000/api/display/new-entrants');
  const data = await response.json();
  
  if (data.success && data.count > 0) {
    console.log(data.message);
    data.data.forEach(stock => {
      console.log(`🌟 ${stock.symbol}: ${stock.name}`);
    });
  } else {
    console.log(data.message);
  }
}
```

### Python

```python
import requests

# 获取Top 15股票
def get_top_stocks():
    response = requests.get('http://localhost:3000/api/display/top-stocks')
    data = response.json()
    
    if data['success']:
        print(f"获取到 {data['count']} 只股票")
        for stock in data['data']:
            print(f"{stock['symbol']}: {stock['name']} - {stock['changePercent']}%")

# 获取新星公司
def get_new_entrants():
    response = requests.get('http://localhost:3000/api/display/new-entrants')
    data = response.json()
    
    if data['success'] and data['count'] > 0:
        print(data['message'])
        for stock in data['data']:
            print(f"🌟 {stock['symbol']}: {stock['name']}")
    else:
        print(data['message'])
```

### cURL

```bash
# 获取Top 15股票并美化输出
curl -s "http://localhost:3000/api/display/top-stocks" | jq '.'

# 获取新星公司
curl -s "http://localhost:3000/api/display/new-entrants" | jq '.'

# 只获取股票代码和涨跌幅
curl -s "http://localhost:3000/api/display/top-stocks" | jq '.data[] | {symbol, changePercent}'
```

---

## 注意事项

1. **缓存机制**
   - Top 15 API：缓存 5 分钟
   - 新星公司 API：缓存 10 分钟
   - 使用 `noCache=true` 可强制刷新数据
   - 响应中的 `fromCache` 字段指示数据是否来自缓存
   - `cacheInfo` 提供缓存的详细信息（年龄、剩余时间等）

2. **性能优化**
   - 如果不需要新闻和AI总结，设置 `includeNews=false` 可以大幅提升响应速度
   - API 有 60 秒超时限制，包含新闻的请求可能需要 20-40 秒
   - 缓存命中时响应时间可降至毫秒级

3. **数据更新频率**
   - 股票数据实时从东方财富获取
   - 新星公司检测基于历史记录，首次运行时会记录当前Top 30
   - 建议根据缓存时间合理安排请求频率

4. **错误处理**
   - 始终检查 `success` 字段判断请求是否成功
   - 失败时 `error` 字段包含错误信息

5. **CORS**
   - 如需跨域访问，请在 Next.js 配置中添加 CORS 设置

5. **数据特点**
   - 已自动过滤 ETF（如 SPY、QQQ 等）
   - 仅包含真实的公司股票
   - 按涨跌幅排序，方便识别热门股票

---

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据源**: 东方财富 API
- **AI 总结**: 阿里云通义千问
- **运行时**: Node.js

---

## 支持

如有问题或建议，请提交 Issue 或 Pull Request。
