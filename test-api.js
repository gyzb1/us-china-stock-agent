/**
 * API 测试脚本
 * 使用方法：node test-api.js
 * 
 * 确保服务已启动：npm run dev
 */

const BASE_URL = 'http://localhost:3000';

async function testTopStocksAPI() {
  console.log('\n========================================');
  console.log('测试 1: Top 15 股票 API (不含新闻)');
  console.log('========================================');
  
  try {
    const response = await fetch(`${BASE_URL}/api/display/top-stocks?includeNews=false`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 请求成功');
      console.log(`📊 返回股票数量: ${data.count}`);
      console.log(`⏰ 时间戳: ${data.timestamp}`);
      console.log(`📈 排序方式: ${data.sortBy} (${data.sortOrder})`);
      console.log('\n前3只股票:');
      data.data.slice(0, 3).forEach((stock, index) => {
        console.log(`  ${index + 1}. ${stock.symbol} - ${stock.name}`);
        console.log(`     价格: $${stock.price} | 涨跌幅: ${stock.changePercent}% | 成交额: ${stock.volumeFormatted}`);
      });
    } else {
      console.log('❌ 请求失败:', data.error);
    }
  } catch (error) {
    console.log('❌ 错误:', error.message);
  }
}

async function testTopStocksWithNewsAPI() {
  console.log('\n========================================');
  console.log('测试 2: Top 5 股票 API (含新闻)');
  console.log('========================================');
  console.log('⚠️  此请求可能需要 20-40 秒...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/display/top-stocks?limit=5&includeNews=true`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 请求成功');
      console.log(`📊 返回股票数量: ${data.count}`);
      console.log('\n第一只股票详情:');
      const stock = data.data[0];
      console.log(`  代码: ${stock.symbol}`);
      console.log(`  名称: ${stock.name}`);
      console.log(`  价格: $${stock.price}`);
      console.log(`  涨跌幅: ${stock.changePercent}%`);
      console.log(`  成交额: ${stock.volumeFormatted}`);
      console.log(`  新闻数量: ${stock.news.length}`);
      console.log(`  AI总结: ${stock.newsSummary.substring(0, 100)}...`);
    } else {
      console.log('❌ 请求失败:', data.error);
    }
  } catch (error) {
    console.log('❌ 错误:', error.message);
  }
}

async function testNewEntrantsAPI() {
  console.log('\n========================================');
  console.log('测试 3: 新星公司 API (不含新闻)');
  console.log('========================================');
  
  try {
    const response = await fetch(`${BASE_URL}/api/display/new-entrants?includeNews=false`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 请求成功');
      console.log(`📊 新星公司数量: ${data.count}`);
      console.log(`💬 消息: ${data.message}`);
      console.log(`⏰ 时间戳: ${data.timestamp}`);
      
      if (data.count > 0) {
        console.log('\n新星公司列表:');
        data.data.forEach((stock, index) => {
          const entrant = data.newEntrants.find(e => e.symbol === stock.symbol);
          console.log(`  ${index + 1}. ${stock.symbol} - ${stock.name}`);
          console.log(`     排名: #${entrant.rank} | 涨跌幅: ${stock.changePercent}% | 成交额: ${stock.volumeFormatted}`);
        });
      }
    } else {
      console.log('❌ 请求失败:', data.error);
    }
  } catch (error) {
    console.log('❌ 错误:', error.message);
  }
}

async function runTests() {
  console.log('🚀 开始测试 API...');
  console.log(`📍 基础 URL: ${BASE_URL}`);
  
  // 测试 1: Top 15 股票（不含新闻，快速）
  await testTopStocksAPI();
  
  // 等待 2 秒
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 测试 2: Top 5 股票（含新闻，慢速）
  await testTopStocksWithNewsAPI();
  
  // 等待 2 秒
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 测试 3: 新星公司（不含新闻）
  await testNewEntrantsAPI();
  
  console.log('\n========================================');
  console.log('✅ 所有测试完成');
  console.log('========================================\n');
}

// 运行测试
runTests().catch(console.error);
