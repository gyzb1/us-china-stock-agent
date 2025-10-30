# 新闻标题显示修复

## 🐛 问题描述

**问题**：新闻链接中显示了HTML标签

**示例**：
```
❌ 之前：<em>Alphabet</em>第三季度营收超出预期
❌ 之前：<em>ALPHABET</em>第三季度营收1023.5亿美元<em></em>高于市场预期

✅ 现在：Alphabet第三季度营收超出预期
✅ 现在：ALPHABET第三季度营收1023.5亿美元高于市场预期
```

**原因**：
- 东方财富API返回的新闻标题包含HTML标签（如`<em>`）
- 用于高亮搜索关键词
- 直接显示导致标签可见

---

## ✅ 解决方案

### 添加HTML标签清理函数

**文件**：`components/StockCard.tsx`

```typescript
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
```

### 使用函数清理标题

**之前**：
```tsx
<span className="line-clamp-2">{newsItem.title}</span>
```

**之后**：
```tsx
<span className="line-clamp-2">{stripHtmlTags(newsItem.title)}</span>
```

---

## 🎯 效果对比

### 之前
```
📎 相关新闻链接：
1. <em>Alphabet</em>第三季度营收超出预期
2. <em>ALPHABET</em>第三季度营收1023.5亿美元<em></em>高于市场预期
3. <em>ALPHABET</em>第三季度营收1023.5亿美元<em></em>高于市场预期
```

### 之后
```
📎 相关新闻链接：
1. Alphabet第三季度营收超出预期
2. ALPHABET第三季度营收1023.5亿美元高于市场预期
3. ALPHABET第三季度营收1023.5亿美元高于市场预期
```

---

## 🔧 处理的HTML实体

函数会清理以下内容：

1. **HTML标签**：`<em>`, `</em>`, `<strong>`, `<span>` 等
2. **HTML实体**：
   - `&nbsp;` → 空格
   - `&lt;` → `<`
   - `&gt;` → `>`
   - `&amp;` → `&`
   - `&quot;` → `"`

---

## 📊 影响范围

**修改的文件**：
- ✅ `components/StockCard.tsx`

**影响的功能**：
- ✅ 新闻链接显示
- ✅ 所有股票卡片
- ✅ Top 15和新星公司

**不影响**：
- ✅ 新闻摘要（AI生成，无HTML标签）
- ✅ 其他功能

---

## ✅ 已完成

**提交**：
```bash
git commit -m 'Fix: Remove HTML tags from news titles for better display'
```

**包含**：
- ✅ HTML标签清理函数
- ✅ 应用到新闻标题显示
- ✅ 支持所有常见HTML标签和实体

---

## 🎊 总结

**问题**：
- ❌ 新闻标题显示`<em>`等HTML标签

**解决**：
- ✅ 添加`stripHtmlTags()`函数
- ✅ 自动清理所有HTML标签
- ✅ 保留纯文本内容

**效果**：
- ✅ 新闻标题更美观
- ✅ 易于阅读
- ✅ 无多余标签

重新部署后，新闻标题将显示为纯文本，不再有`<em>`等标签！🎉
