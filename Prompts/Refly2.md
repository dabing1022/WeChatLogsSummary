；基于 **卡兹克** 与 **向阳乔木** 的提示词修改
；*卡兹克*：https://mp.weixin.qq.com/s/Z66YRjY1EnC_hMgXE9_nnw
；*向阳乔木*：https://mp.weixin.qq.com/s/XSX0FtZV_H79xpQsB820eA

# 微信群聊日报生成器
## 任务要求
请详细总结群聊记录并生成md格式的群聊总结（提炼、找到关键的信息和详细描述），生成一个视觉上引人入胜、布局紧凑无空隙、配色和谐统一、风格固定一致、适合截图分享的单页网站

### 自动提取信息
系统将自动从您提供的聊天记录中提取以下信息：
- 群名称：将从聊天记录的系统通知或常见群聊信息中提取
- 日期：将使用聊天记录中最近的日期，或者默认使用今天的日期
- 时间范围：根据记录中的首条和末条消息时间确定

### 聊天记录支持格式
支持以下多种常见格式：
- "[时间] 昵称：消息内容"
- "时间 - 昵称：消息内容"
- "昵称 时间：消息内容"
- 其他合理的时间和昵称分隔格式

### 聊天内容结构
- 群聊总结
    - 群聊名称: Refly AI 群聊日报
    - 群聊内容
    - 消息数量
    - 活跃人员数量
    - 热点话题数量
    - 统计时间范围（从首条消息到末条消息）
    - 导出日报图片按钮（点击后，导出日报图片）

- 收听播客（使用给定的播客链接，使用<audio>标签嵌入音频）, 该模块紧随群聊总结只后。如果用户未提供播客链接，将不显示播客模块
- 今日热点
    - 话题名称
    - 话题分类标签
    - 50-100字的简要总结
    - 相关关键词（2-5个）
    - 提及次数统计
- 小剧场
    - 以对话形式重现群聊中的趣味对话
    - 包含经典语录和梗王等奖项
- 我要提 issue（类型：bug, deployment, documentation, enhancement, help wanted, question, wontfix，分析聊天记录，提取出相关的issue）
    - 问题类型标签
    - 问题简述
    - 提出人和时间
- MindMap
    - 将核心内容生成思维导图，思维导图模块单独一个卡片，占据整个页面宽度
    - 思维导图模块右上角有全屏按钮，点击后全屏，再次点击关闭全屏
    - 使用 jsmind 搞定思维导图
        - <script src="https://cdn.jsdelivr.net/npm/jsmind@latest/js/jsmind.min.js"></script>
        - <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsmind@latest/style/jsmind.css">
- 重要消息汇总
    - 消息时间和发送者
    - 消息类型（通知/事件/公告/其他）
    - 优先级（高/中/低）
    - 消息内容
    - 完整通知内容（可选）
- 重要链接与资源 (链接支持点击跳转)
    - 资源类型（教程/新闻/资源）
    - 标题
    - 分享者和时间
    - 内容简介
    - 要点列表（2-5个）
    - 原文链接
    - 分类标签
- 话唠榜（不可显示 wxid）
    - 排名Top5
    - 昵称
    - 消息数量
    - 用户特点标签（2-3个）
    - 常用词（2-3个）
- 词云
- 昨日群聊日报和今日群聊日报的二维码
    - 日报为昨日日报，提取群聊前日日报链接，标题是前日二维码（带上日期）
    - 用户输入如果给定了昨日日报链接，则使用用户输入的链接生成昨日二维码，标题是昨日二维码（带上日期）

严格按照以上顺序生成，不要遗漏任何模块。合理分配空间，不要有大面积 Bento Grid 空白。


### 重要说明：词云和脑图实现
- 词云实现必须使用纯CSS和HTML，不依赖wordcloud.js库：
  1. 使用CSS Flex布局实现词云效果，词语大小根据权重设置不同的font-size
  2. 使用不同的颜色和字体粗细表示词语的重要性
  3. 随机分布词语，但确保整体布局美观
  4. 词云容器(.wordcloud-card)必须设置最小高度(min-height: 300px)
  5. 确保使用与主题一致的颜色方案
  6. 词云数据从聊天记录中提取，按词频排序

- 脑图实现必须确保：
  1. 使用jsmind库实现，确保正确引入相关资源
  2. 实现全屏查看功能
  3. 节点样式与整体主题保持一致

### 角色
你是极具审美的前端设计大师，请为我生成一个基于 **Bento Grid** 设计风格的单页HTML网站，内嵌CSS、JS。这个页面将被截图分享，需要特别优化视觉效果和分享体验

### 内容分布
- 主卡片：群聊总结
- 中型卡片：不同子主题，包括：今日热点、技术分享、核心概念关系图、精彩引用、重要链接与资源、活跃统计、词云

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
1. 极简主义风格 (Minimalist)：简约、留白、精确排版、无衬线字体、克制装饰、白色背景，橘色字体
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

如果我没有指定风格，请默认使用「极简主义风格」的 Bento Grid 风格设计


# 模板重要说明

## head部分（包含下面部分）

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Refly AI 群聊日报</title>
<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsmind@latest/js/jsmind.min.js"></script> <!-- 脑图 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script> <!-- 截图 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script> <!-- 二维码生成 -->

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsmind@latest/style/jsmind.css"> <!-- 脑图样式 -->
```

## 关键脚本

脑图和词云数据均为演示 Demo，以实际的群聊数据为准。

```javascript
    <script>
        // 按照参考写法修改的脑图初始化函数
        function initJsMind(){
            var mind = {
                meta:{
                    name: "群聊核心内容关系图",
                    author: "群聊日报生成器",
                    version: "1.0"
                },
                format: "node_array",
                data:[
                    {id:"root", isroot:true, topic:"群聊精华：2025-06-02", "background-color":"var(--primary-accent-color)", "foreground-color":"#fff"},

                    {id:"ai_tools", parentid:"root", topic:"AI工具与平台", "background-color":"#1E40AF", "foreground-color":"var(--text-color)"},
                    {id:"ai_oaiopen", parentid:"ai_tools", topic:"ai.oaiopen.cn (API集成, Flux1.1)"},
                    {id:"ai_segmind", parentid:"ai_tools", topic:"Segmind (图像工作流, API发布)"},
                    {id:"ai_refly", parentid:"ai_tools", topic:"Refly (客户端讨论, Bug修复)"},
                    {id:"ai_other", parentid:"ai_tools", topic:"其他AI工具 (Fellou, 百度知识库)"},

                    {id:"hardware", parentid:"root", topic:"硬件DIY与行情", "background-color":"#1E40AF", "foreground-color":"var(--text-color)"},
                    {id:"hw_mac", parentid:"hardware", topic:"Mac Mini M4 (拼多多2749元)"},
                    {id:"hw_cooling", parentid:"hardware", topic:"PC散热 (猫头鹰, 硅脂, 贴膜梗)"},
                    {id:"hw_diy", parentid:"hardware", topic:"Peng父子DIY (拆机, 淘二手)"},
                    {id:"hw_3d", parentid:"hardware", topic:"3D打印 (巧克力, FDM讨论)"},

                    {id:"refly_focus", parentid:"root", topic:"Refly产品专题", "background-color":"#1E40AF", "foreground-color":"var(--text-color)"},
                    {id:"refly_bug", parentid:"refly_focus", topic:"Google登录Bug (节后修复)"},
                    {id:"refly_feature", parentid:"refly_focus", topic:"AI节点提示词显示建议"},
                    {id:"refly_sync", parentid:"refly_focus", topic:"本地与云端数据同步"},
                    {id:"refly_plan", parentid:"refly_focus", topic:"套餐模式讨论"},

                    {id:"industry", parentid:"root", topic:"行业动态与生活", "background-color":"#1E40AF", "foreground-color":"var(--text-color)"},
                    {id:"policy", parentid:"industry", topic:"人才政策 (上海杨浦UP主补贴)"},
                    {id:"platform", parentid:"industry", topic:"平台更新 (百度网盘, 淘宝88VIP)"},
                    {id:"parenting", parentid:"industry", topic:"育儿科技 (Peng儿子学编程)"}
                ]
            };
            
            var options = {
                container : 'mindmap',
                editable : false,
                theme : null, // Use null theme to rely on custom CSS
                view: {
                    engine: 'svg', 
                    hmargin: 60,
                    vmargin: 30,
                    line_width: 1.5,
                    line_color: 'var(--primary-accent-color)'
                },
                layout: {
                    hspace: 50, // horizontal space between nodes
                    vspace: 25, // vertical space between nodes
                    pspace: 13  // space between node and subnode connection line
                },
                shortcut: { enable: false }
            };
            
            var jm = new jsMind(options);
            jm.show(mind);
            
            // 保存jm实例供全屏切换使用
            window.jmInstance = jm;
            window.mindData = mind;
        }

        // 按照参考写法的初始化逻辑
        if (typeof jsMind !== 'undefined') {
            initJsMind();
        } else {
            window.addEventListener('load', initJsMind);
        }

        // 全屏切换功能
        let isFullscreen = false;
        let fullscreenJm = null;

        function toggleMindmapFullscreen() {
            const fullscreenContainer = document.getElementById('mindmap_fullscreen_container');
            
            if (!isFullscreen) {
                // 进入全屏
                fullscreenContainer.classList.add('active');
                isFullscreen = true;
                
                // 在全屏容器中创建新的脑图
                setTimeout(() => {
                    initFullscreenMindmap();
                }, 100);
                
                // 禁止页面滚动
                document.body.style.overflow = 'hidden';
                
            } else {
                // 退出全屏
                fullscreenContainer.classList.remove('active');
                isFullscreen = false;
                
                // 清理全屏脑图
                if (fullscreenJm) {
                    const fullscreenMindmapDiv = document.getElementById('mindmap_fullscreen');
                    fullscreenMindmapDiv.innerHTML = '';
                    fullscreenJm = null;
                }
                
                // 恢复页面滚动
                document.body.style.overflow = 'auto';
            }
        }

        function initFullscreenMindmap() {
            if (!window.mindData) return;
            
            try {
                const fullscreenContainer = document.getElementById('mindmap_fullscreen');
                
                // 确保容器存在且可见
                if (!fullscreenContainer) {
                    console.error('Full screen container not found');
                    return;
                }
                
                const options = {
                    container: 'mindmap_fullscreen',
                    editable: false,
                    theme: null,
                    view: {
                        engine: 'svg', 
                        hmargin: 100,
                        vmargin: 60,
                        line_width: 2,
                        line_color: 'var(--primary-accent-color)'
                    },
                    layout: {
                        hspace: 80,
                        vspace: 40, 
                        pspace: 20
                    },
                    shortcut: { enable: false }
                };
                
                fullscreenJm = new jsMind(options);
                fullscreenJm.show(window.mindData);
                
                console.log('Fullscreen mindmap initialized successfully');
                
                // 延迟调整大小以确保正确渲染
                setTimeout(() => {
                    if (fullscreenJm) {
                        fullscreenJm.resize();
                    }
                }, 200);
                
            } catch (error) {
                console.error('Fullscreen mindmap initialization failed:', error);
            }
        }

        // ESC键退出全屏
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isFullscreen) {
                toggleMindmapFullscreen();
            }
        });

        // 窗口大小变化时重新调整思维导图
        window.addEventListener('resize', function() {
            if (window.jmInstance && !isFullscreen) {
                clearTimeout(window.resizeTimer);
                window.resizeTimer = setTimeout(function() {
                    window.jmInstance.resize();
                }, 300);
            }
            
            // 如果在全屏模式，也调整全屏脑图
            if (fullscreenJm && isFullscreen) {
                clearTimeout(window.fullscreenResizeTimer);
                window.fullscreenResizeTimer = setTimeout(function() {
                    fullscreenJm.resize();
                }, 300);
            }
        });

    </script>
```

## MindMap

```html
<div class="card mindmap-card" id="mindmap_container_wrapper">
    <div class="card-icon-bg"><i class="fas fa-project-diagram"></i></div>
    <button class="mindmap-fullscreen-btn" onclick="toggleMindmapFullscreen()">
        <i class="fas fa-expand"></i> 全屏
    </button>
            <div class="content-wrapper" style="height:100%;">
                <h2 class="card-title">核心内容关系图</h2>
                <div id="mindmap"></div>
            </div>
        </div>
```

## Word Cloud

```html
<div class="card wordcloud-card">
    <div class="card-icon-bg"><i class="fas fa-cloud"></i></div>
    <div class="content-wrapper">
        <h2 class="card-title">词云</h2>
        <div class="css-wordcloud">
            <!-- 词云内容将根据词频动态生成 -->
            <span class="word-item" style="font-size: 2.8rem; color: var(--primary-accent-color);">Refly</span>
            <span class="word-item" style="font-size: 2.5rem; color: var(--primary-accent-color);">提示词</span>
            <span class="word-item" style="font-size: 2.3rem;">工具</span>
            <span class="word-item" style="font-size: 2.2rem;">AI</span>
            <span class="word-item" style="font-size: 2.0rem;">感觉</span>
            <span class="word-item" style="font-size: 1.9rem;">管理</span>
            <span class="word-item" style="font-size: 1.8rem;">分享</span>
            <span class="word-item" style="font-size: 1.7rem;">平台</span>
            <span class="word-item" style="font-size: 1.6rem;">使用</span>
            <span class="word-item" style="font-size: 1.6rem;">问题</span>
            <span class="word-item" style="font-size: 1.5rem;">会员</span>
            <span class="word-item" style="font-size: 1.5rem;">永久</span>
            <span class="word-item" style="font-size: 1.4rem;">儿子</span>
            <span class="word-item" style="font-size: 1.4rem;">开源</span>
            <span class="word-item" style="font-size: 1.3rem;">飞书</span>
            <span class="word-item" style="font-size: 1.3rem;">本地</span>
            <span class="word-item" style="font-size: 1.2rem;">数据</span>
            <span class="word-item" style="font-size: 1.2rem;">插件</span>
            <span class="word-item" style="font-size: 1.1rem;">版本</span>
            <span class="word-item" style="font-size: 1.1rem;">需求</span>
            <span class="word-item" style="font-size: 1.0rem;">看看</span>
            <span class="word-item" style="font-size: 1.0rem;">垃圾</span>
        </div>
    </div>
</div>
```

添加以下CSS样式：

```css
/* 词云样式 */
.css-wordcloud {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 15px;
    min-height: 250px;
    width: 100%;
}

.word-item {
    display: inline-block;
    padding: 5px;
    font-weight: 500;
    transition: transform 0.3s ease, color 0.3s ease;
    color: var(--text-color);
    opacity: 0.9;
    transform: rotate(calc(var(--rotate) * 1deg));
    --rotate: 0;
}

.word-item:nth-child(odd) {
    --rotate: -3;
}

.word-item:nth-child(even) {
    --rotate: 3;
}

.word-item:nth-child(3n) {
    --rotate: 0;
}

.word-item:hover {
    transform: scale(1.1) rotate(0deg);
    color: var(--primary-accent-color);
    opacity: 1;
    cursor: pointer;
}
```

## 全屏脑图容器

```html
<div class="mindmap-fullscreen-container" id="mindmap_fullscreen_container">
    <button class="mindmap-fullscreen-btn" onclick="toggleMindmapFullscreen()">
        <i class="fas fa-compress"></i> 退出全屏
    </button>
    <h2 class="fullscreen-title">核心内容关系图</h2>
    <div id="mindmap_fullscreen"></div>
</div>
``` 