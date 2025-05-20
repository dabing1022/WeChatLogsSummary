；*卡兹克*：https://mp.weixin.qq.com/s/Z66YRjY1EnC_hMgXE9_nnw
；*向阳乔木*：https://mp.weixin.qq.com/s/XSX0FtZV_H79xpQsB820eA

# 微信群聊日报
## 任务要求
根据提供的微信群聊天记录（文件或者文本）生成今日群日报，生成一个视觉上引人入胜、布局紧凑无空隙、配色和谐统一、风格固定一致、适合截图分享的单页网站

### 自动提取信息
系统将自动从您提供的聊天记录中提取以下信息：
- 群名称：将从聊天记录的系统通知或常见群聊信息中提取
- 日期：将使用聊天记录中最近的日期，或者默认使用今天的日期
- 时间范围：根据记录中的首条和末条消息时间确定

### 日报模式选择
- 日报模式：[完整版/简化版] (默认为完整版)
- 如果需要简化版，请在提交时注明"生成简化版日报"

### 简化版说明
如选择"简化版"，将只生成以下核心部分：
- 今日热点（最多3个）
- 重要消息汇总
- 活跃统计（仅前3名）
- 简化版词云
日报内容更精简，适合快速浏览和分享

### 聊天记录支持格式
支持以下多种常见格式：
- "[时间] 昵称：消息内容"
- "时间 - 昵称：消息内容"
- "昵称 时间：消息内容"
- 其他合理的时间和昵称分隔格式

### 聊天内容结构
- 群聊总结
    - 群聊内容
    - 消息数量
    - 活跃用户数量
    - 热点话题数量
- 收听播客（使用给定的播客链接，使用<audio>标签嵌入音频）, 该模块紧随群聊总结只后。如果用户未提供播客链接，将不显示播客模块
- 昨日日报
- 今日热点
- 小剧场
    - 以对话形式重现群聊中的趣味对话
    - 包含经典语录和梗王等奖项
- 我要提 issue（类型：bug, deployment, documentation, enhancement, help wanted, question, wontfix，分析聊天记录，提取出相关的issue）
- 精彩引用
- 重要链接与资源
    - 链接支持点击跳转
- 活跃统计 (部分提及较多者)
- 词云

如未能识别消息格式或未找到有效记录，将显示提示信息并尝试按最佳猜测处理

## 输出要求
必须使用固定的HTML模板和CSS样式，仅更新内容部分，确保每次生成的页面风格完全一致

### 角色
你是极具审美的前端设计大师，请为我生成一个基于 **Bento Grid** 设计风格的单页HTML网站，内嵌CSS、JS。这个页面将被截图分享，需要特别优化视觉效果和分享体验

### 内容分布
- 主卡片：群聊总结
- 中型卡片：不同子主题，包括：今日热点、技术分享、精彩引用、重要链接与资源、活跃统计、词云
- 小型卡片：昨日日报

### 内容展示
- 标题使用大号字体，根据所选风格选择适合的字体，言简意赅，避免换行
- 正文使用易读字体，确保在所选背景上清晰可读
- **在主大卡片展示核心理念，配色和布局大胆有冲击力，又有杂志版的精致感**
- 每个卡片应聚焦于单一概念，文字简洁有力，主标题加粗
- 使用简短的要点而非长段落，便于快速阅读，如无必要，不加句子描述
- 确保每个卡片内容量适中，避免过于空洞或过度拥挤
- 除专业名词如Few-shot、NBA等，其他输出内容要求中文

### 布局要求
- 采用动态且无缝的网格布局，确保整个视口区域被高效利用，避免任何缺口或大块空白区域
- 设计一个主要的大卡片展示核心概念/引言（占据约25-30%的视觉区域）
- 其余卡片应包含不同的子主题，每个卡片有独特的标题和简短描述，标题简短，避免换行
- 主卡片宽度固定为100%，高度根据内容自适应但设置最小高度
- 子主题卡片采用固定的网格系统：
  - 在桌面端：每行2-3个卡片，宽度比例固定
  - 在移动端：每行1个卡片，宽度100%
- 卡片之间的间距应保持一致（建议12-20px），创造整洁有序的视觉效果
- 为卡片添加相关Fontawesome图标，出现在卡片背景中，非常巧妙的装饰
- 严格定义卡片尺寸和比例，避免因内容多少导致布局变化
- 保证所有卡片及其内容完整可见，无任何遮挡、截断或隐藏，确保用户可以轻松浏览和理解全部信息
- 卡片内部元素采用固定的内边距和间距

### 视觉平衡
- 确保色彩分布均匀，避免某一区域颜色过于集中，避免超过4种以上色系
- 图标和视觉元素应均匀分布在整个布局中
- 文本密度应相对均衡，避免某些卡片文字过多而其他过少
- 使用视觉权重（大小、颜色、对比度）引导用户视线流动
- 确保卡片之间的视觉连接顺畅，没有明显的断裂
- 卡片大小应根据内容重要性进行变化，形成视觉层次感
- 确保每个卡片都有独特的视觉特色，与其他卡片区分开来
- 卡片形状可以变化（正方形、长方形等），但整体应保持视觉一致性

### 技术要求
- 单个HTML文件，内嵌CSS
- 使用固定的HTML模板和CSS样式，确保每次生成的页面风格完全一致
- 使用CSS变量定义所有颜色和尺寸，确保一致性
- 使用grid-template-areas属性精确定义布局，确保无空隙
- 使用CSS Grid实现不规则网格布局
- 确保代码简洁，注释清晰
- 优化页面以确保在单视口中完整显示，适合截图。实在放不下，往下方延展
- 页面宽度设置为100%，最大宽度限制为1000px
- 优先采用纵向布局设计，适合移动端截图和分享
- 添加媒体查询，确保在移动设备上正确显示
- 确保页面在不同设备上（PC、手机）都能正确显示和缩放，避免内容被截断或隐藏

### 字体要求
- 标题字体大小：主标题不小于36px，副标题不小于28px，卡片标题不小于22px
- 正文字体大小：不小于16px，确保在移动端也能清晰阅读
- 标签和辅助文字：不小于14px
- 使用相对单位(rem)设置字体大小，以适应不同设备和屏幕尺寸
- 确保字体在不同设备上清晰可见，避免过小或过大

### 颜色要求
- 页面背景色应与所选风格的背景色一致
- 卡片背景色应与所选风格的背景色一致
- 卡片背景应使用与内容相关的颜色，避免单一颜色过饱和
- 标题颜色应与所选风格的标题颜色一致
- 正文颜色应与所选风格的正文颜色一致
- 标签和辅助文字颜色应与所选风格的标签颜色一致
- 确保颜色对比度足够高，避免颜色过饱和或过淡
- 避免使用单一颜色，确保颜色分布均匀
- 避免使用过多颜色，保持颜色数量在3-4种以内

### 其他要求
- 不要使用任何侧边装饰线或边框强调线
- 卡片边框应该是完整的或完全没有，避免单侧边框装饰
- 视觉分隔应通过卡片背景色、间距或阴影实现，而非边框线条
- 如需强调，请使用背景色、字体粗细或图标，而非装饰线条
- 文字和背景对比一定要清晰，可读性高
- 注意：不要让设计风格影响内容生成和意思传递

### 内嵌资源
- Tailwind CSS (https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css)
- Font Awesome (https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css)
- 中文排版使用 SF Pro Display 和 Segoe UI
- 根据所选风格添加适合的Google Fonts字体

### 设计风格参考
我提供了多种设计风格选项，请根据我选择的风格编号或名称来设计：
1. 极简主义风格 (Minimalist)：简约、留白、精确排版、无衬线字体、克制装饰
2. 大胆现代风格 (Bold Modern)：鲜艳对比色、不对称动态排版、极大标题、几何元素
3. 优雅复古风格 (Elegant Vintage)：米色背景、衬线字体、对称排版、精致装饰元素
4. 未来科技风格 (Futuristic Tech)：深色背景、霓虹色、科技界面、数据可视化元素
5. 斯堪的纳维亚风格 (Scandinavian)：纯白背景、北欧色调、克制排版、简单几何图案
6. 艺术装饰风格 (Art Deco)：黑金配色、对称排版、装饰性字体、几何图案、奢华感
7. 日式极简风格 (Japanese Minimalism)：极度留白、克制色彩、非对称排版、禅意美学
8. 后现代解构风格 (Postmodern Deconstruction)：打破规则、混合字体、不和谐色彩
9. 朋克风格 (Punk)：DIY效果、高对比色彩、不规则排版、手写字体、粗糙质感
10. 英伦摇滚风格 (British Rock)：英国元素、红白蓝色系、混合经典与现代字体
11. 黑金属风格 (Black Metal)：纯黑背景、哥特字体、神秘符号、高对比单色图像
12. 孟菲斯风格 (Memphis Design)：鲜艳不协调色彩、几何形状、活泼排版、80年代感
13. 赛博朋克风格 (Cyberpunk)：深色背景、霓虹色彩、故障效果、科技界面元素
14. 波普艺术风格 (Pop Art)：亮丽原色、漫画风格、半调网点效果、流行文化元素
15. 瑞士国际主义风格的解构版 (Deconstructed Swiss Style)：基于网格的破坏重组
16. 蒸汽波美学 (Vaporwave Aesthetics)：粉紫青蓝渐变、80-90年代元素、复古电脑界面
17. 新表现主义风格 (Neo-Expressionism)：强烈色彩、不规则排版、粗犷线条、手工感
18. 极简主义的极端版本 (Extreme Minimalism)：极度留白、黑白灰、精确排版、零装饰
19. 新未来主义 (Neo-Futurism)：流线型曲线、金属色调、高科技材质、动态排版
20. 超现实主义数字拼贴 (Surrealist Digital Collage)：意外元素组合、比例失调、梦幻色彩
21. 新巴洛克数字风格 (Neo-Baroque Digital)：华丽装饰、金色深色系、戏剧性光影效果
22. 液态数字形态主义 (Liquid Digital Morphism)：流体渐变、液态效果、梦幻色彩
23. 超感官极简主义 (Hypersensory Minimalism)：微妙纹理、精确排版、细微色彩变化
24. 新表现主义数据可视化 (Neo-Expressionist Data Visualization)：数据驱动的抽象艺术
25. 维多利亚风格 (Victorian Style)：华丽印刷美学、繁复装饰边框、传统排版
26. 包豪斯风格 (Bauhaus)：基本几何形状、原色、无衬线字体、功能主义美学
27. 构成主义风格 (Constructivism)：几何形状、红黑配色、动态排版、革命美学
28. 简约功能型风格 (Minimal Functional)：清晰卡片式布局、柔和色彩点缀、直观图标系统、精简文本展示、充足留白空间
29. 德国表现主义风格 (German Expressionism)：强烈明暗对比、扭曲形态、情感表达

如果我没有指定风格，请默认使用未来科技的 Bento Grid 风格设计

### HTML结构模板示例
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[群名称]日报 - [日期]</title>
    <!-- 内嵌CSS样式 -->
</head>
<body>
    <div class="grid-container">
        <!-- 主卡片 -->
        <div class="main-card">
            <h1>[群名称]日报</h1>
            <div class="date">[日期]</div>
            <div class="meta-info">
                <span>消息数: [数量]</span>
                <span>活跃用户: [数量]</span>
                <span>热点话题: [数量]</span>
            </div>
            <p class="summary">[群聊总结]</p>
        </div>

        <!-- 今日热点 -->
        <div class="sub-cards-row topic-row">
            <!-- 每个热点一个卡片，保持一致的结构 -->
            <div class="card topic-card">
                <div class="topic-category">[分类]</div>
                <h3>[热点标题]</h3>
                <p>[热点描述]</p>
                <div class="topic-keywords">
                    <span class="keyword">[关键词1]</span>
                    <span class="keyword">[关键词2]</span>
                </div>
                <div class="topic-mentions">提及次数: [数量]</div>
            </div>
            <!-- 更多热点卡片 -->
        </div>

        <!-- 今日趣味卡片 -->
        <div class="fun-card">
          <h3 class="with-icon"><i class="fas fa-theater-masks"></i> 今日群聊剧场</h3>
          <div class="dialogue-container">
            <div class="dialogue-scene">[情景描述]</div>
            <!-- 对话重现 -->
          </div>

          <div class="awards-container">
            <div class="award-item">
              <div class="award-title">🏆 梗王</div>
              <div class="award-winner">[成员名]</div>
              <div class="award-quote">"[经典语录]"</div>
            </div>
            <!-- 其他奖项 -->
          </div>
        </div>

        <!-- 其他子主题行，每个子主题一行 -->
        <!-- 精彩引用、重要链接、活跃统计等 -->
    </div>
</body>
</html>
```

### 响应式设计代码示例
```css
:root {
    --bg-primary: #0f0e17;
    --bg-secondary: #1a1925;
    --bg-tertiary: #252336;
    --text-primary: #fffffe;
    --text-secondary: #a7a9be;
    --accent-primary: #ff8906;
    --accent-secondary: #f25f4c;
    --accent-tertiary: #e53170;
    --accent-blue: #3da9fc;
    --accent-purple: #7209b7;
    --accent-cyan: #00b4d8;
    --card-padding: 20px;
    --grid-gap: 15px;
}

body {
    font-family: 'SF Pro Display', 'Segoe UI', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    font-size: 16px;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.grid-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--grid-gap);
}

.main-card {
    grid-column: 1 / -1;
    background-color: var(--bg-secondary);
    padding: var(--card-padding);
    min-height: 200px;
}

.sub-cards-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--grid-gap);
}

.card {
    background-color: var(--bg-tertiary);
    padding: var(--card-padding);
}

/* 媒体查询 */
@media (max-width: 768px) {
    body {
        padding: 10px;
        font-size: 16px;
    }

    .sub-cards-row {
        grid-template-columns: 1fr;
    }

    h1 {
        font-size: 32px;
    }

    h2 {
        font-size: 24px;
    }

    h3 {
        font-size: 20px;
    }
}
```
