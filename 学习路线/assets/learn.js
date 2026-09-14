/* ============================================================
   learn.js — 前端学习站交互引擎
   导航大纲抽屉 / 外站侧边栏 / 本页目录 / 上下课翻页
   mac 实验台：语法高亮 × 4 主题 × 可拖拽分屏 × 实时预览
   ============================================================ */
(function () {
    "use strict";

    /* ==================== 课程数据 ==================== */
    var COURSE = [
        {
            dir: "01-HTML基础", name: "HTML 基础", index: "index.html", lessons: [
                ["01-认识HTML.html", "认识 HTML"],
                ["02-元素与属性.html", "元素与属性"],
                ["03-文本与链接.html", "文本与链接"],
                ["04-列表与表格.html", "列表与表格"],
                ["05-表单与输入.html", "表单与输入"],
                ["06-语义化与HTML5.html", "语义化与 HTML5"]
            ]
        },
        {
            dir: "02-CSS基础", name: "CSS 基础", index: "index.html", lessons: [
                ["01-CSS是什么.html", "CSS 是什么"],
                ["02-引入与基础选择器.html", "引入与基础选择器"],
                ["03-文本与字体.html", "文本与字体"],
                ["04-背景与边框.html", "背景与边框"],
                ["05-盒模型.html", "盒模型"],
                ["06-显示与尺寸.html", "显示与尺寸"],
                ["07-选择器进阶.html", "选择器进阶"]
            ]
        },
        {
            dir: "03-CSS布局", name: "CSS 布局", index: "index.html", lessons: [
                ["01-布局与对齐.html", "布局与对齐"],
                ["02-浮动.html", "浮动"],
                ["03-定位.html", "定位"],
                ["04-溢出处理.html", "溢出处理"],
                ["05-Flex弹性布局.html", "Flex 弹性布局"],
                ["06-Grid网格布局.html", "Grid 网格布局"]
            ]
        },
        {
            dir: "04-CSS3进阶", name: "CSS3 进阶", index: "index.html", lessons: [
                ["01-CSS3总览.html", "CSS3 总览"],
                ["02-圆角边框与阴影.html", "圆角边框与阴影"],
                ["03-背景与渐变.html", "背景与渐变"],
                ["04-文本效果与字体.html", "文本效果与字体"],
                ["05-2D与3D转换.html", "2D 与 3D 转换"],
                ["06-过渡.html", "过渡"],
                ["07-动画.html", "动画"],
                ["08-响应式设计.html", "响应式设计"]
            ]
        }
    ];

    /* 通用外站资源 */
    var RES_COMMON = [
        { n: "MDN Web Docs · CSS", d: "最权威的中文参考手册，查任何属性", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS", c: "#4A5568", t: "MDN" },
        { n: "菜鸟教程 · CSS", d: "中文入门教程，配在线实例可动手", u: "https://www.runoob.com/css/css-tutorial.html", c: "#5F9A50", t: "菜鸟" },
        { n: "W3Cschool · CSS", d: "老牌中文教程，附带微测验", u: "https://www.w3cschool.cn/css/", c: "#4A7FB5", t: "W3C" },
        { n: "CSS-Tricks", d: "英文深度文章与技巧集锦", u: "https://css-tricks.com/", c: "#B8552F", t: "CT" },
        { n: "Can I Use", d: "查属性的浏览器兼容性", u: "https://caniuse.com/", c: "#8A6BB8", t: "CIU" },
        { n: "web.dev · Learn CSS", d: "Google 出品的系统课程", u: "https://web.dev/learn/css", c: "#3E7E5B", t: "DEV" },
    ];

    /* 每课时的深度学习资源（按文件名索引） */
    var RES_LESSON = {
        "01-CSS是什么.html": [
            { n: "MDN · CSS 是什么", d: "官方视角定义层叠样式表", u: "https://developer.mozilla.org/zh-CN/docs/Learn/CSS/First_steps/What_is_CSS", c: "#4A5568", t: "MDN" },
            { n: "MDN · CSS 如何工作", d: "浏览器渲染流水线的完整图解", u: "https://developer.mozilla.org/zh-CN/docs/Learn/CSS/First_steps/How_CSS_works", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS 简介", d: "快速过一遍语法骨架", u: "https://www.runoob.com/css/css-intro.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "02-引入与基础选择器.html": [
            { n: "MDN · CSS 选择器", d: "选择器总表与优先级规则", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_selectors", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS 选择器", d: "id / class / 分组选择器实例", u: "https://www.runoob.com/css/css-selectors.html", c: "#5F9A50", t: "菜鸟" },
            { n: "W3Cschool · CSS 语法", d: "三种引入方式对照", u: "https://www.w3cschool.cn/css/css-syntax.html", c: "#4A7FB5", t: "W3C" }
        ],
        "03-文本与字体.html": [
            { n: "MDN · 文本样式基础", d: "font / text 一族全解", u: "https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Styling_text/Fundamentals", c: "#4A5568", t: "MDN" },
            { n: "MDN · @font-face", d: "自定义网络字体", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/@font-face", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS 字体", d: "字体族与回退机制", u: "https://www.runoob.com/css/css-font.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "04-背景与边框.html": [
            { n: "MDN · background", d: "背景简写属性的完整语法", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/background", c: "#4A5568", t: "MDN" },
            { n: "MDN · border", d: "边框三件套与单边写法", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/border", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS 背景", d: "背景属性逐个实例", u: "https://www.runoob.com/css/css-background.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "05-盒模型.html": [
            { n: "MDN · 盒模型", d: "四层结构与 box-sizing", u: "https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/The_box_model", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS 盒模型", d: "图解 content / padding / border / margin", u: "https://www.runoob.com/css/css-boxmodel.html", c: "#5F9A50", t: "菜鸟" },
            { n: "CSS-Tricks · box-sizing", d: "为什么全世界都写 border-box", u: "https://css-tricks.com/box-sizing/", c: "#B8552F", t: "CT" }
        ],
        "06-显示与尺寸.html": [
            { n: "MDN · display", d: "块级 / 行内 / 行内块的差异", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/display", c: "#4A5568", t: "MDN" },
            { n: "MDN · width / height", d: "尺寸与 max/min 约束", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/width", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS Display", d: "display 与 visibility 对照实验", u: "https://www.runoob.com/css/css-display-visibility.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "07-选择器进阶.html": [
            { n: "MDN · 优先级 Specificity", d: "权重计算的官方规则", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity", c: "#4A5568", t: "MDN" },
            { n: "MDN · 伪类", d: ":hover / :nth-child 全家桶", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes", c: "#4A5568", t: "MDN" },
            { n: "MDN · 伪元素", d: "::before / ::after 详解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · Specifics", d: "经典权重文章", u: "https://css-tricks.com/specifics-on-css-specificity/", c: "#B8552F", t: "CT" }
        ],
        "01-认识HTML.html": [
            { n: "MDN · HTML 基础入门", d: "官方教程：从“HTML 是什么”到写第一个页面", u: "https://developer.mozilla.org/zh-CN/docs/Learn/Getting_started_with_the_web/HTML_basics", c: "#4A5568", t: "MDN" },
            { n: "MDN · HTML 元素参考", d: "全部标签索引，查每个元素含义与用法", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · HTML 入门教程", d: "中文图文对照手册", u: "https://www.runoob.com/html/html-intro.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "02-元素与属性.html": [
            { n: "MDN · 全局属性", d: "所有元素都能带的通用属性（id/class/title…）", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes", c: "#4A5568", t: "MDN" },
            { n: "MDN · 块级元素", d: "块级与行内元素的官方定义与列表", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Block-level_elements", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · HTML 属性", d: "属性的写法与常见范例", u: "https://www.runoob.com/html/html-attributes.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "03-文本与链接.html": [
            { n: "MDN · <a> 链接元素", d: "超链接 href / target 全部用法", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · HTML 文本格式化", d: "b / strong / em / mark 等文字标签小结", u: "https://www.runoob.com/html/html-formatting.html", c: "#5F9A50", t: "菜鸟" },
            { n: "MDN · <em> 强调语义", d: "文本级语义的权威文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/em", c: "#4A5568", t: "MDN" }
        ],
        "04-列表与表格.html": [
            { n: "MDN · <table> 表格", d: "表格完整属性与结构权威文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/table", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · HTML 表格", d: "中文表格入门与示例", u: "https://www.runoob.com/html/html-tables.html", c: "#5F9A50", t: "菜鸟" },
            { n: "菜鸟 · HTML 列表", d: "ul / ol / dl 中文教程", u: "https://www.runoob.com/html/html-lists.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "05-表单与输入.html": [
            { n: "MDN · <form> 表单", d: "表单结构与提交行为权威文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form", c: "#4A5568", t: "MDN" },
            { n: "MDN · <input> 输入元素", d: "input 全 type 唯一权威索引", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input", c: "#4A5568", t: "MDN" },
            { n: "MDN · 客户端表单验证", d: "required / pattern 约束校验讲解", u: "https://developer.mozilla.org/zh-CN/docs/Learn/Forms/Form_validation", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · HTML 表单", d: "中文表单控件教程", u: "https://www.runoob.com/html/html-forms.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "06-语义化与HTML5.html": [
            { n: "MDN · 语义（Semantics）", d: "为什么用语义化标签、机器如何理解结构", u: "https://developer.mozilla.org/zh-CN/docs/Glossary/Semantics", c: "#4A5568", t: "MDN" },
            { n: "MDN · <main> 主内容", d: "全页唯一主内容区规范", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/main", c: "#4A5568", t: "MDN" },
            { n: "MDN · <video> 视频", d: "多媒体标签的 source / track / controls", u: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video", c: "#4A5568", t: "MDN" }
        ],
        "index.html": [
            { n: "MDN · HTML 学习路径", d: "官方完整 HTML/MDN 学习路线", u: "https://developer.mozilla.org/zh-CN/docs/Learn/HTML", c: "#4A5568", t: "MDN" },
            { n: "Can I Use · HTML5 支持", d: "各浏览器对 HTML5 新元素的支持率", u: "https://caniuse.com/html5", c: "#8A6BB8", t: "CIU" }
        ],
        "01-布局与对齐.html": [
            { n: "MDN · display", d: "display 所有取值与块级 vs 行内", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/display", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS display", d: "inline / block / flex 用法示例", u: "https://www.runoob.com/cssref/pr-class-display.html", c: "#5F9A50", t: "菜鸟" },
            { n: "MDN · BFC", d: "块级格式化上下文详解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context", c: "#4A5568", t: "MDN" }
        ],
        "02-浮动.html": [
            { n: "MDN · float", d: "float 规范与取值、脱离文档流细节", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/float", c: "#4A5568", t: "MDN" },
            { n: "MDN · clear", d: "clear 清除浮动的作用机制", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/clear", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · All About Floats", d: "float 诞生初衷与各种玩法", u: "https://css-tricks.com/all-about-floats/", c: "#B8552F", t: "CT" },
            { n: "菜鸟 · CSS 浮动", d: "浮动布局与清除浮动示例", u: "https://www.runoob.com/css/css-float.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "03-定位.html": [
            { n: "MDN · position", d: "五个取值与 relative / sticky 语义", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/position", c: "#4A5568", t: "MDN" },
            { n: "MDN · z-index", d: "层叠上下文与 z-index 规则", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/z-index", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · z-index", d: "为什么 z-index 会「失灵」", u: "https://css-tricks.com/almanac/properties/z/z-index/", c: "#B8552F", t: "CT" },
            { n: "CSS-Tricks · position sticky", d: "吸顶布局实现要点", u: "https://css-tricks.com/almanac/properties/p/position-sticky/", c: "#B8552F", t: "CT" }
        ],
        "04-溢出处理.html": [
            { n: "MDN · overflow", d: "visible / hidden / scroll / auto 与 clip", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/overflow", c: "#4A5568", t: "MDN" },
            { n: "MDN · text-overflow", d: "单行省略号 text-overflow", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow", c: "#4A5568", t: "MDN" },
            { n: "MDN · line-clamp", d: "多行省略号 -webkit-line-clamp", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/line-clamp", c: "#4A5568", t: "MDN" },
            { n: "Can I Use · line-clamp", d: "-webkit-line-clamp 各浏览器支持率", u: "https://caniuse.com/css-line-clamp", c: "#8A6BB8", t: "CIU" }
        ],
        "05-Flex弹性布局.html": [
            { n: "MDN · Flexbox 基本概念", d: "主轴 / 交叉轴与坐标系官方讲解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · Guide to Flexbox", d: "容器六属性 + 项目四属性一张图", u: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", c: "#B8552F", t: "CT" },
            { n: "MDN · flex", d: "flex 简写与 grow / shrink / basis 细节", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · Flex 语法", d: "阮一峰 flex 布局语法详解", u: "https://www.runoob.com/w3cnote/flex-grammar.html", c: "#5F9A50", t: "菜鸟" },
            { n: "抖音 · Flex 布局讲解视频", d: "配套视频课程，建议搭配文档一起看", u: "https://v.douyin.com/SH3xUFjilTw/", c: "#FE2C55", t: "抖音" }
        ],
        "06-Grid网格布局.html": [
            { n: "CSS-Tricks · Guide to Grid", d: "fr / minmax / repeat / 网格线 / 区域速查", u: "https://css-tricks.com/snippets/css/complete-guide-grid/", c: "#B8552F", t: "CT" },
            { n: "MDN · grid", d: "网格布局核心概念与属性总览", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid", c: "#4A5568", t: "MDN" },
            { n: "MDN · fr 单位", d: "fr 份数与自适应轨道", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/fr", c: "#4A5568", t: "MDN" },
            { n: "MDN · grid-template-areas", d: "命名区域 ASCII 布局写法", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid-template-areas", c: "#4A5568", t: "MDN" }
        ],
        "01-CSS3总览.html": [
            { n: "MDN · CSS 参考", d: "CSS3 各模块官方参考总入口", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference", c: "#4A5568", t: "MDN" },
            { n: "菜鸟 · CSS3 简介", d: "CSS3 模块化入门导读", u: "https://www.runoob.com/css3/css3-intro.html", c: "#5F9A50", t: "菜鸟" },
            { n: "W3Cschool · CSS3 教程", d: "中文分章教程与在线实例", u: "https://www.w3cschool.cn/css3/", c: "#4A7FB5", t: "W3C" },
            { n: "Can I Use", d: "各 CSS3 特性浏览器支持率", u: "https://caniuse.com/", c: "#8A6BB8", t: "CIU" }
        ],
        "02-圆角边框与阴影.html": [
            { n: "MDN · border-radius", d: "圆角属性官方文档与简写映射", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-radius", c: "#4A5568", t: "MDN" },
            { n: "MDN · box-shadow", d: "阴影四参 + inset 详解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-shadow", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · box-shadow", d: "阴影技术与多阴影示例", u: "https://css-tricks.com/almanac/properties/b/box-shadow/", c: "#B8552F", t: "CT" }
        ],
        "03-背景与渐变.html": [
            { n: "MDN · linear-gradient", d: "线性渐变方向与色标语法", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient", c: "#4A5568", t: "MDN" },
            { n: "MDN · radial-gradient", d: "径向渐变圆心与形状详解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · CSS Gradients", d: "渐变完整指南（含 conic）", u: "https://css-tricks.com/css3-gradients/", c: "#B8552F", t: "CT" },
            { n: "菜鸟 · CSS3 渐变", d: "渐变示例合集", u: "https://www.runoob.com/css3/css3-gradients.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "04-文本效果与字体.html": [
            { n: "MDN · text-shadow", d: "文字阴影官方文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-shadow", c: "#4A5568", t: "MDN" },
            { n: "MDN · text-overflow", d: "溢出省略官方文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow", c: "#4A5568", t: "MDN" },
            { n: "MDN · @font-face", d: "自定义字体加载规则", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/@font-face", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · text-shadow", d: "文字阴影进阶玩法", u: "https://css-tricks.com/almanac/properties/t/text-shadow/", c: "#B8552F", t: "CT" }
        ],
        "05-2D与3D转换.html": [
            { n: "MDN · transform", d: "2D / 3D 变换函数官方全表", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform", c: "#4A5568", t: "MDN" },
            { n: "MDN · transform-style", d: "preserve-3d 共享 3D 空间详解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-style", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · transform", d: "变换属性 Almanac", u: "https://css-tricks.com/almanac/properties/t/transform/", c: "#B8552F", t: "CT" },
            { n: "W3Cschool · CSS3 2D 转换", d: "中文实例跟练", u: "https://www.w3cschool.cn/css3/xujqoqxs.html", c: "#4A7FB5", t: "W3C" }
        ],
        "06-过渡.html": [
            { n: "MDN · transition", d: "过渡四要素官方文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition", c: "#4A5568", t: "MDN" },
            { n: "MDN · Using CSS Transitions", d: "触发时机与实战详解", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · transition", d: "过渡属性 Almanac 与默认值", u: "https://css-tricks.com/almanac/properties/t/transition/", c: "#B8552F", t: "CT" },
            { n: "菜鸟 · CSS3 过渡", d: "中文过渡示例", u: "https://www.runoob.com/css3/css3-transitions.html", c: "#5F9A50", t: "菜鸟" }
        ],
        "07-动画.html": [
            { n: "MDN · animation", d: "八合一简写官方文档", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation", c: "#4A5568", t: "MDN" },
            { n: "MDN · @keyframes", d: "关键帧分镜表定义", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/@keyframes", c: "#4A5568", t: "MDN" },
            { n: "MDN · Using CSS Animations", d: "动画使用完整指南", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Animations/Using_CSS_animations", c: "#4A5568", t: "MDN" },
            { n: "CSS-Tricks · animation", d: "动画属性 Almanac", u: "https://css-tricks.com/almanac/properties/a/animation/", c: "#B8552F", t: "CT" }
        ],
        "08-响应式设计.html": [
            { n: "MDN · Using media queries", d: "媒体查询完整语法与逻辑词", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries/Using_media_queries", c: "#4A5568", t: "MDN" },
            { n: "MDN · Container Queries", d: "容器查询入门与使用", u: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_containment/Container_queries", c: "#4A5568", t: "MDN" },
            { n: "web.dev · RWD 基础", d: "响应式三原则图解", u: "https://web.dev/articles/responsive-web-design-basics", c: "#3E7E5B", t: "DEV" },
            { n: "菜鸟 · CSS3 多媒体查询", d: "媒体查询中文实例", u: "https://www.runoob.com/css3/css3-mediaqueries.html", c: "#5F9A50", t: "菜鸟" }
        ]
    };

    /* ==================== 工具 ==================== */
    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
    /* 去掉多行代码的公共缩进，并修剪首尾空行 */
    function dedent(s) {
        s = s.replace(/^\n+/, "").replace(/[ \t]+$/, "");
        var lines = s.split("\n"), min = Infinity;
        lines.forEach(function (l) {
            if (!l.trim()) return;
            var m = l.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;
            if (m < min) min = m;
        });
        if (!isFinite(min) || min === 0) return s;
        return lines.map(function (l) { return l.replace(new RegExp("^[ \\t]{0," + min + "}"), ""); }).join("\n");
    }

    var PAGE = document.body.getAttribute("data-page") || "";
    var pageFile = PAGE.split("/").pop();

    /* ==================== 语法高亮 ==================== */
    /* token: [className, text]；className 为空表示纯文本 */
    function tokenizeCSS(src) {
        var out = [], i = 0, n = src.length, depth = 0, buf = "", mode = "sel";
        function flush(cls) { if (buf) { out.push([cls || "", buf]); buf = ""; } }
        while (i < n) {
            var ch = src[i], two = src.substr(i, 2);
            if (two === "/*") {
                var e = src.indexOf("*/", i + 2); e = e < 0 ? n : e + 2;
                flush(); out.push(["tok-com", src.slice(i, e)]); i = e; continue;
            }
            if (ch === '"' || ch === "'") {
                var q = ch, j = i + 1;
                while (j < n && src[j] !== q) { if (src[j] === "\\") j++; j++; }
                flush(); out.push(["tok-str", src.slice(i, Math.min(j + 1, n))]); i = j + 1; continue;
            }
            if (ch === "@") {
                var m = /^@[\w-]+/.exec(src.slice(i));
                flush(); out.push(["tok-at", m[0]]); i += m[0].length; continue;
            }
            if (ch === "{") {
                flush(mode === "sel" ? "tok-sel" : "");
                out.push(["tok-punc", "{"]); depth++; mode = "prop"; i++; continue;
            }
            if (ch === "}") {
                flush(mode === "val" ? "tok-val" : mode === "prop" ? "tok-prop" : "");
                out.push(["tok-punc", "}"]); depth--; mode = "sel"; i++; continue;
            }
            if (depth > 0) {
                if (mode === "prop" && ch === ":") {
                    flush("tok-prop"); out.push(["tok-punc", ":"]); mode = "val"; i++; continue;
                }
                if (ch === ";") {
                    flush(mode === "val" ? "tok-val" : "tok-prop");
                    out.push(["tok-punc", ";"]); mode = "prop"; i++; continue;
                }
                if (mode === "val") {
                    if (/^!important/i.test(src.slice(i, i + 10))) { flush(); out.push(["tok-imp", src.slice(i, i + 10)]); i += 10; continue; }
                    var mn = /^#[0-9a-fA-F]{3,8}\b|^-?[\d.]+(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch|ex|cm|mm|in|pt|pc)?/.exec(src.slice(i));
                    if (mn) { flush(); out.push(["tok-num", mn[0]]); i += mn[0].length; continue; }
                }
                buf += ch; i++; continue;
            }
            buf += ch; i++;
        }
        flush(depth > 0 ? (mode === "prop" ? "tok-prop" : "tok-val") : (buf.trim() ? "tok-sel" : ""));
        return out;
    }

    /* 标签内部子分词：<div class="x" disabled> */
    function tokenizeTag(tag) {
        var out = [], re = /(<\/?)|([\w-]+)(=)("[^"]*"|'[^']*')|([\w-]+)|(\/?>)|([\s=]+)/g, m, last = 0, nameDone = false;
        while ((m = re.exec(tag))) {
            if (m.index > last) out.push(["", tag.slice(last, m.index)]);
            if (m[1]) out.push(["tok-punc", m[1]]);
            else if (m[2]) { out.push(["tok-attr", m[2]], ["tok-punc", "="], ["tok-str", m[4]]); nameDone = true; }
            else if (m[5]) { out.push([nameDone ? "tok-attr" : "tok-tag", m[5]]); nameDone = true; }
            else if (m[6]) out.push(["tok-punc", m[6]]);
            else if (m[7]) out.push(["", m[7]]);
            last = m.index + m[0].length;
        }
        if (last < tag.length) out.push(["", tag.slice(last)]);
        return out;
    }

    function tokenizeHTML(src) {
        var out = [], i = 0, n = src.length, buf = "";
        function flush() { if (buf) { out.push(["", buf]); buf = ""; } }
        while (i < n) {
            if (src.substr(i, 4) === "<!--") {
                var e = src.indexOf("-->", i + 4); e = e < 0 ? n : e + 3;
                flush(); out.push(["tok-com", src.slice(i, e)]); i = e; continue;
            }
            if (src.substr(i, 7).toLowerCase() === "<style>") {
                var cs = src.indexOf("</style>", i + 7); cs = cs < 0 ? n : cs;
                flush();
                out.push(["tok-punc", "<"], ["tok-tag", "style"], ["tok-punc", ">"]);
                tokenizeCSS(src.slice(i + 7, cs)).forEach(function (t) { out.push(t); });
                if (cs < n) out.push(["tok-punc", "</"], ["tok-tag", "style"], ["tok-punc", ">"]);
                i = cs < n ? cs + 8 : n; continue;
            }
            if (src[i] === "<" && /[a-zA-Z/!]/.test(src[i + 1] || "")) {
                var gt = src.indexOf(">", i + 1); if (gt < 0) gt = n - 1;
                flush();
                tokenizeTag(src.slice(i, gt + 1)).forEach(function (t) { out.push(t); });
                i = gt + 1; continue;
            }
            if (src[i] === "&") {
                var em = /^&[\w#]+;?/.exec(src.slice(i));
                if (em) { flush(); out.push(["tok-ent", em[0]]); i += em[0].length; continue; }
            }
            buf += src[i]; i++;
        }
        flush();
        return out;
    }

    function tokenizeJS(src) {
        var KW = /^(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|in|of|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|delete|void|null|undefined|true|false)$/;
        var out = [], i = 0, n = src.length, buf = "";
        function flush(cls) { if (buf) { out.push([cls || "", buf]); buf = ""; } }
        while (i < n) {
            var two = src.substr(i, 2), ch = src[i];
            if (two === "//") {
                var e = src.indexOf("\n", i); e = e < 0 ? n : e;
                flush(); out.push(["tok-com", src.slice(i, e)]); i = e; continue;
            }
            if (two === "/*") {
                var e2 = src.indexOf("*/", i + 2); e2 = e2 < 0 ? n : e2 + 2;
                flush(); out.push(["tok-com", src.slice(i, e2)]); i = e2; continue;
            }
            if (ch === '"' || ch === "'" || ch === "`") {
                var q = ch, j = i + 1;
                while (j < n) {
                    if (src[j] === "\\") { j += 2; continue; }
                    if (src[j] === q) { j++; break; } j++;
                }
                flush(); out.push(["tok-str", src.slice(i, Math.min(j, n))]); i = j; continue;
            }
            if (/[A-Za-z_$]/.test(ch)) {
                var w = /^[A-Za-z_$][\w$]*/.exec(src.slice(i))[0];
                flush();
                out.push(KW.test(w) ? ["tok-kw", w] : ["", w]);
                i += w.length; continue;
            }
            if (/[0-9]/.test(ch)) {
                var mn = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
                if (mn) { flush(); out.push(["tok-num", mn[0]]); i += mn[0].length; continue; }
            }
            if ('{}()=;,.[]<>:+-*/%!&|?'.indexOf(ch) >= 0) { flush(); out.push(["tok-punc", ch]); i++; continue; }
            buf += ch; i++;
        }
        flush();
        return out;
    }

    function highlight(code, lang) {
        var toks = lang === "html" ? tokenizeHTML(code) : lang === "js" ? tokenizeJS(code) : tokenizeCSS(code);
        return toks.map(function (t) {
            return t[0] ? '<span class="' + t[0] + '">' + esc(t[1]) + "</span>" : esc(t[1]);
        }).join("");
    }

    /* ==================== 导航 / 抽屉 / 侧边栏 / 翻页 ==================== */
    var SVG = {
        menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
        toc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>',
        ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7l-5 5 5 5"/><path d="M15 7l5 5-5 5"/></svg>'
    };

    function curLocation() {
        for (var c = 0; c < COURSE.length; c++) {
            if (PAGE.indexOf(COURSE[c].dir + "/") === 0) {
                for (var l = 0; l < COURSE[c].lessons.length; l++) {
                    if (COURSE[c].lessons[l][0] === pageFile) return { ch: c, ls: l };
                }
                return { ch: c, ls: -1 };
            }
        }
        return { ch: -1, ls: -1 };
    }
    var LOC = curLocation();

    function buildNav() {
        var nav = document.createElement("header");
        nav.className = "lx-nav";
        var titleText;
        if (LOC.ch >= 0) {
            var ch = COURSE[LOC.ch];
            titleText = "<em>0" + (LOC.ch + 1) + "</em>" + ch.name;
            titleText += LOC.ls >= 0 ? " · " + ch.lessons[LOC.ls][1] : " · 章节目录";
        } else {
            titleText = esc(document.title);
        }
        /* brand 落点：课时/章节目录页在子目录，路径回退一层；总览页同层指向自身 */
        var brandHref = LOC.ch >= 0 ? "../教程中心页.html" : "./教程中心页.html";
        var practiceHref = LOC.ch >= 0 ? "../互动练习.html" : "./互动练习.html";
        nav.innerHTML =
            '<button class="lx-nav-btn" id="lxBtnOutline">' + SVG.menu + "<span>课程大纲</span></button>" +
            '<a class="lx-brand" href="' + brandHref + '"><span class="lx-brand-logo">学</span><span class="lx-brand-name">前端自习室<small>FRONTEND STUDY</small></span></a>' +
            '<div class="lx-nav-title">' + titleText + "</div>" +
            '<button class="lx-nav-btn" id="lxBtnSearch">' + SVG.search + "<span>搜索</span></button>" +
            '<a class="lx-nav-btn" id="lxBtnPractice" href="' + practiceHref + '">' + SVG.practice + "<span>练习场</span></a>" +
            '<div class="lx-toc" id="lxToc"><button class="lx-nav-btn" id="lxBtnToc">' + SVG.toc + '<span>本页大纲</span></button><nav class="lx-toc-panel" id="lxTocPanel"></nav></div>' +
            '<button class="lx-nav-btn" id="lxBtnSide">' + SVG.ext + "<span>扩展阅读</span></button>";
        document.body.appendChild(nav);
    }

    function buildDrawer() {
        var d = document.createElement("aside");
        d.className = "lx-drawer";
        d.id = "lxDrawer";
        var total = COURSE.reduce(function (a, c) { return a + c.lessons.length; }, 0);
        /* 是否位于章节子页决定相对路径前缀：章节内上跳一层 ../，总览页不加 */
        var up = LOC.ch >= 0 ? "../" : "";
        var html = '<div class="lx-drawer-head"><b>课程大纲<small>学习路线 · 4 章 ' + total + ' 课</small></b>' +
            '<button class="lx-x" data-close title="关闭">✕</button></div><div class="lx-drawer-body">';
        COURSE.forEach(function (ch, ci) {
            var isCur = ci === LOC.ch;
            html += '<div class="lx-tree-ch' + (isCur ? " open" : "") + '">' +
                '<div class="lx-tree-ch-head"><span class="num">0' + (ci + 1) + '</span><span class="t">' + ch.name + '</span><span class="arrow">▶</span></div>' +
                '<div class="lx-tree-items">';
            if (ch.index) {
                html += '<a href="' + up + ch.dir + '/' + ch.index + '"' + (isCur && pageFile === ch.index ? ' class="cur"' : "") + '>章节目录</a>';
            }
            ch.lessons.forEach(function (ls) {
                var cur = isCur && ls[0] === pageFile;
                html += '<a href="' + up + ch.dir + '/' + ls[0] + '"' + (cur ? ' class="cur"' : "") + '>' + ls[1] + "</a>";
            });
            html += "</div></div>";
        });
        html += "</div>";
        d.innerHTML = html;
        document.body.appendChild(d);
        $$(".lx-tree-ch-head", d).forEach(function (h) {
            h.addEventListener("click", function () { h.parentNode.classList.toggle("open"); });
        });
    }

    function resHTML(r) {
        var dom = r.u.replace(/^https?:\/\//, "").split("/")[0];
        return '<a class="lx-res" href="' + r.u + '" target="_blank" rel="noopener">' +
            '<span class="lx-res-ico" style="background:' + r.c + '">' + r.t +
            '<img src="https://' + dom + '/favicon.ico" alt="" data-dom="' + dom + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
            "</span>" +
            "<span><b>" + r.n + "</b><span>" + r.d + "</span></span></a>";
    }

    /* favicon 三级回退：站点直取 → favicon.im 代理 → 文字徽标 */
    function bindResIcons(root) {
        $$(".lx-res-ico img", root).forEach(function (img) {
            img.addEventListener("error", function () {
                var alt = "https://favicon.im/" + img.getAttribute("data-dom") + "?larger=true";
                if (img.src !== alt) { img.src = alt; } else { img.remove(); }
            });
        });
    }

    function buildSide() {
        var s = document.createElement("aside");
        s.className = "lx-side";
        s.id = "lxSide";
        var html = '<div class="lx-drawer-head"><b>扩展阅读<small>跳出本站 · 深度学习</small></b>' +
            '<button class="lx-x" data-close title="关闭">✕</button></div><div class="lx-side-body">';
        var mine = RES_LESSON[pageFile];
        if (mine) {
            html += '<div class="lx-res-group"><h4>本课相关</h4>';
            mine.forEach(function (r) { html += resHTML(r); });
            html += "</div>";
        }
        html += '<div class="lx-res-group"><h4>常备站点</h4>';
        RES_COMMON.forEach(function (r) { html += resHTML(r); });
        html += "</div></div>";
        s.innerHTML = html;
        document.body.appendChild(s);
        bindResIcons(s);
    }

    function buildPager() {
        if (LOC.ch < 0 || LOC.ls < 0) return;
        var ch = COURSE[LOC.ch];
        var prev = LOC.ls > 0 ? ch.lessons[LOC.ls - 1] : null;
        var next = LOC.ls < ch.lessons.length - 1 ? ch.lessons[LOC.ls + 1] : null;
        var p = document.createElement("nav");
        p.className = "lx-pager";
        p.innerHTML =
            (prev ? '<a href="' + prev[0] + '"><div class="pg-dir">上一课</div><div class="pg-t">' + prev[1] + "</div></a>" : '<a class="none"></a>') +
            (next ? '<a class="next" href="' + next[0] + '"><div class="pg-dir">下一课</div><div class="pg-t">' + next[1] + "</div></a>" : '<a class="none"></a>');
        document.body.appendChild(p);
    }

    function buildChrome() {
        var mask = document.createElement("div");
        mask.className = "lx-mask";
        mask.id = "lxMask";
        document.body.appendChild(mask);

        buildNav(); buildDrawer(); buildSide(); buildPager();

        var drawer = $("#lxDrawer"), side = $("#lxSide"), toc = $("#lxToc"),
            btnOutline = $("#lxBtnOutline"), btnSide = $("#lxBtnSide"), btnToc = $("#lxBtnToc");

        /* ---------- 全站搜索：弹层 + 索引 + 渲染 ---------- */
        var searchEl = document.createElement("div");
        searchEl.className = "lx-search"; searchEl.id = "lxSearch";
        searchEl.innerHTML =
            '<div class="lx-search-box">' +
            '<div class="lx-search-head">' + SVG.search +
            '<span class="lx-search-title">全站搜索</span>' +
            '<input class="lx-search-input" id="lxSearchInput" type="text" placeholder="输入一个字或多个字，如 flex / 布局 / 动画" autocomplete="off" spellcheck="false">' +
            '<button class="lx-search-close" data-close aria-label="关闭">×</button>' +
            '</div>' +
            '<div class="lx-search-hint">索引覆盖全部课时与知识点位置；点击结果直接跳到对应页面</div>' +
            '<div class="lx-search-res" id="lxSearchRes"></div>' +
            '<div class="lx-search-foot" id="lxSearchFoot">输入 1 个或多个字即可联想</div>' +
            '</div>';
        document.body.appendChild(searchEl);
        var btnSearch = $("#lxBtnSearch");
        var sInput = $("#lxSearchInput"), sRes = $("#lxSearchRes"), sFoot = $("#lxSearchFoot");
        var searchLoaded = false;

        function hl(text, tokens) {
            var safe = esc(text);
            tokens.forEach(function (t) {
                if (!t) return;
                var re;
                try { re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"); }
                catch (e) { return; }
                safe = safe.replace(re, "<mark>$1</mark>");
            });
            return safe;
        }
        function renderSearch(q) {
            q = (q || "").replace(/\s+/g, " ").trim().toLowerCase();
            if (!q) { sRes.innerHTML = ""; sFoot.textContent = "输入 1 个或多个字即可联想"; return; }
            sRes.innerHTML = '<div class="lx-search-empty">正在建立索引…</div>';
            sFoot.textContent = "";
            buildSearchIndex(function (idx) {
                var tokens = q.split(" ").filter(Boolean);
                var m = idx.filter(function (e) {
                    return tokens.every(function (t) { return e.k.indexOf(t) !== -1; });
                });
                var seen = {};
                m = m.filter(function (e) { var key = e.u + (e.a ? "#" + e.a : ""); if (seen[key]) return false; seen[key] = 1; return true; });
                if (!m.length) { sRes.innerHTML = '<div class="lx-search-empty">没有找到与「' + esc(q) + '」相关的知识点，换个关键词试试</div>'; return; }
                var groups = [];
                m.forEach(function (e) {
                    var g = null;
                    for (var gi = 0; gi < groups.length; gi++) { if (groups[gi].u === e.u) { g = groups[gi]; break; } }
                    if (!g) { g = { u: e.u, ch: e.ch, lb: e.lb || "", items: [] }; groups.push(g); }
                    g.items.push(e);
                });
                groups.sort(function (a, b) { return (a.ch < b.ch ? -1 : a.ch > b.ch ? 1 : (a.u < b.u ? -1 : a.u > b.u ? 1 : 0)); });
                var html = "";
                var sp = LOC.ch >= 0 ? "../" : "";
                groups.forEach(function (g) {
                    html += '<div class="lx-search-group-head">' + esc(g.ch) + (g.lb ? " · " + esc(g.lb) : "") + "</div>";
                    g.items.forEach(function (it) {
                        var href = sp + it.u + (it.a ? "#" + it.a : "");
                        html += '<a class="lx-search-item" href="' + href + '">' +
                            '<span class="lq">' + hl(it.t, tokens) + "</span>" +
                            '<span class="lb"><span class="dot">' + (it.a ? "§" : "◈") + "</span>" + esc(g.lb) + "</span></a>";
                    });
                });
                sRes.innerHTML = html;
                sFoot.textContent = "共 " + m.length + " 处 · 点击直达对应页面与知识点位置";
            });
        }

        /* 搜索索引：加载打包好的 search-index.js
           用 <script> 标签加载，file:// 与 http:// 均可用（浏览器会拦截 file:// 下 fetch 到其他页面，
           因此不能靠运行时抓取；索引由 build_search_index.py 离线生成）。 */
        function searchIndexUrl() {
            var els = document.getElementsByTagName("script");
            for (var i = 0; i < els.length; i++) {
                var src = els[i].src || "";
                if (src.indexOf("learn.js") !== -1) return src.replace(/learn\.js([?#].*)?$/, "search-index.js");
            }
            return "assets/search-index.js";
        }
        function buildSearchIndex(cb) {
            if (searchLoaded) { cb((window.LX_SEARCH_INDEX || []).slice()); return; }
            var s = document.createElement("script");
            s.src = searchIndexUrl();
            var fired = false;
            function fire() {
                if (fired) return;
                fired = true; searchLoaded = true;
                cb((window.LX_SEARCH_INDEX || []).slice());
            }
            s.onload = fire; s.onerror = fire;
            setTimeout(fire, 2500);
            document.head.appendChild(s);
        }

        function closeAll() {
            drawer.classList.remove("open"); side.classList.remove("open");
            searchEl.classList.remove("show");
            mask.classList.remove("show");
            btnOutline.classList.remove("on"); btnSide.classList.remove("on"); btnSearch.classList.remove("on");
        }
        btnOutline.addEventListener("click", function () {
            var open = !drawer.classList.contains("open");
            closeAll();
            if (open) { drawer.classList.add("open"); mask.classList.add("show"); this.classList.add("on"); }
        });
        btnSide.addEventListener("click", function () {
            var open = !side.classList.contains("open");
            closeAll();
            if (open) { side.classList.add("open"); mask.classList.add("show"); this.classList.add("on"); }
        });
        mask.addEventListener("click", closeAll);
        $$("[data-close]").forEach(function (b) { b.addEventListener("click", closeAll); });

        /* ---------- 全站搜索交互 ---------- */
        btnSearch.addEventListener("click", function () {
            var open = !searchEl.classList.contains("show");
            closeAll();
            if (open) {
                searchEl.classList.add("show"); mask.classList.add("show"); this.classList.add("on");
                setTimeout(function () { sInput.focus(); }, 80);
            }
        });
        function doSearch() { renderSearch(sInput.value); }
        sInput.addEventListener("input", debounce(doSearch, 200));
        sInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); doSearch(); }
        });

        /* 本页大纲 */
        var panel = $("#lxTocPanel");
        var h2s = $$(".lx-article h2");
        if (!h2s.length) { btnToc.style.display = "none"; }
        h2s.forEach(function (h, i) {
            if (!h.id) h.id = "sec-" + (i + 1);
            var a = document.createElement("a");
            a.href = "#" + h.id;
            a.innerHTML = "<i>" + (i + 1 < 10 ? "0" : "") + (i + 1) + "</i><span>" + esc(h.textContent) + "</span>";
            a.addEventListener("click", function () { toc.classList.remove("open"); btnToc.classList.remove("on"); });
            panel.appendChild(a);
        });
        btnToc.addEventListener("click", function (e) {
            e.stopPropagation();
            var open = !toc.classList.contains("open");
            closeAll();
            if (open) { toc.classList.add("open"); this.classList.add("on"); }
        });
        document.addEventListener("click", function (e) {
            if (!toc.contains(e.target)) { toc.classList.remove("open"); btnToc.classList.remove("on"); }
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") { closeAll(); toc.classList.remove("open"); btnToc.classList.remove("on"); }
        });

        /* 滚动高亮本页大纲 */
        if (h2s.length && "IntersectionObserver" in window) {
            var links = $$("a", panel);
            var io = new IntersectionObserver(function (es) {
                es.forEach(function (en) {
                    if (en.isIntersecting) {
                        links.forEach(function (a) { a.classList.toggle("cur", a.hash === "#" + en.target.id); });
                    }
                });
            }, { rootMargin: "-20% 0px -70% 0px" });
            h2s.forEach(function (h) { io.observe(h); });
        }

        /* 深链定位：从全站搜索 #sec-N 跳入时，锚点 ID 由上方循环刚生成，需手动滚到知识点 */
        if (location.hash && location.hash.indexOf("sec-") === 0) {
            var deep = $(location.hash);
            if (deep) setTimeout(function () { deep.scrollIntoView({ behavior: "smooth", block: "start" }); }, 120);
        }
    }

    /* ==================== 实验台 LAB ==================== */
    var THEMES = [["", "暖墨 · 深色"], ["paper", "暖纸 · 浅色"], ["night", "夜幕 · 深蓝"], ["matcha", "抹茶 · 浅绿"]];
    var themeKey = "lx-code-theme";
    var curTheme = "";
    try { curTheme = localStorage.getItem(themeKey) || ""; } catch (e) { }

    var PREVIEW_BASE =
        "* { box-sizing: border-box; }" +
        "html, body { margin: 0; padding: 0; }" +
        "body { padding: 14px; font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;" +
        "font-size: 14px; line-height: 1.7; color: #3A332C; background: #FFFEFB; }";

    function labPreviewDoc(lab) {
        if (!lab._files) return "";
        var css = "", html = "", js = "";
        lab._files.forEach(function (f) {
            var c = f.cur;
            if (f.lang === "html") html += c + "\n";
            else if (f.lang === "js") js += c + "\n";
            else css += c + "\n";
        });
        return "<!DOCTYPE html><html><head><meta charset='utf-8'><style>" + PREVIEW_BASE + "</style>" +
            (css ? "<style>" + css + "</style>" : "") + "</head><body>" + html + "</body>" +
            (js ? "<script>" + js + "</scr" + "ipt>" : "") + "</html>";
    }

    function langOfFilename(name, fb) {
        var m = /[.\/](\w+)$/.exec(name);
        if (!m) return fb;
        var e = m[1].toLowerCase();
        return e === "html" || e === "htm" ? "html" : e === "js" ? "js" : "css";
    }

    function initLab(lab) {
        var labLang = lab.getAttribute("data-lang") === "html" ? "html" : "css";
        var labFile = lab.getAttribute("data-file");
        var tpl = $("template.lab-html", lab);

        /* 收集本实验台的所有可编辑文件：支持多个 script.lab-code（data-file 决定文件名/语言）；
           CSS 实验台的 template.lab-html 会自动升格为一个可编辑的 HTML 文件，实现 CSS/HTML 切换 */
        var files = [], codeEls = $$("script.lab-code", lab);
        codeEls.forEach(function (ce, i) {
            if (!ce.textContent.trim()) return;
            var name = ce.getAttribute("data-file") ||
                (codeEls.length === 1 ? (labFile || "demo." + labLang) : "file" + (i + 1) + "." + labLang);
            files.push({ name: name, lang: langOfFilename(name, labLang), orig: dedent(ce.textContent), cur: null });
            ce.style.display = "none";
        });
        var hasHtml = files.some(function (f) { return f.lang === "html"; });
        if (tpl) {
            if (!hasHtml) files.push({ name: "预览.html", lang: "html", orig: dedent(tpl.innerHTML), cur: null });
            tpl.style.display = "none";
        }
        if (!files.length) return;
        files.forEach(function (f) { f.cur = f.orig; });
        lab._files = files;
        lab._active = 0;
        lab._lang = files[0].lang;

        /* 头部徽标：按本实验台语言集合显示（HTML+CSS / JS 等） */
        var langSet = [];
        files.forEach(function (f) { if (langSet.indexOf(f.lang) < 0) langSet.push(f.lang); });
        var badgeText = langSet.map(function (l) { return l === "html" ? "HTML" : l === "js" ? "JS" : "CSS"; }).join(" + ") + " 实验";
        var head = $(".lab-head", lab);
        if (!head) {
            head = document.createElement("div");
            head.className = "lab-head";
            head.innerHTML = '<span class="lab-cap">动手实验</span>';
            lab.insertBefore(head, lab.firstChild);
        }
        var badge = document.createElement("span");
        badge.className = "lab-badge";
        badge.textContent = badgeText;
        head.insertBefore(badge, head.firstChild);

        /* mac 窗口栏：三点 ｜ 文件切换页签(mac 三点旁) ｜ 文件名 ｜ 工具 */
        var tabsHtml = files.length > 1 ? "<nav class='lab-files'>" + files.map(function (f, i) {
            var lbl = f.lang === "html" ? "HTML" : f.lang === "js" ? "JS" : "CSS";
            return "<button type='button' class='lab-ft' data-lang='" + f.lang + "' data-i='" + i + "'>" + lbl + " " + esc(f.name) + "</button>";
        }).join("") + "</nav>" : "";
        var bar = document.createElement("div");
        bar.className = "lab-bar";
        bar.innerHTML =
            '<span class="lab-dots"><i></i><i></i><i></i></span>' +
            tabsHtml +
            '<span class="lab-file">' + esc(files[0].name) + "</span>" +
            '<div class="lab-tools">' +
            '<select class="lab-theme-sel" title="代码主题">' + THEMES.map(function (t) {
                return '<option value="' + t[0] + '"' + (t[0] === curTheme ? " selected" : "") + ">" + t[1] + "</option>";
            }).join("") + "</select>" +
            '<button class="lab-btn" data-act="reset">重置</button>' +
            '<button class="lab-btn" data-act="run">运行 ▶</button>' +
            "</div>";

        /* 分屏主体 */
        var body = document.createElement("div");
        body.className = "lab-body";
        body.innerHTML =
            '<div class="lab-editor">' +
            '<div class="lab-gutter"></div>' +
            '<pre class="lab-hl" aria-hidden="true"><code></code></pre>' +
            '<textarea class="lab-src" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea>' +
            "</div>" +
            '<div class="lab-resizer" title="拖拽调整分屏 · 双击恢复 1:1"></div>' +
            '<div class="lab-view-box"><div class="lab-view-tag">实时预览 PREVIEW</div><iframe class="lab-view" sandbox="allow-same-origin"></iframe></div>';

        lab.appendChild(bar);
        lab.appendChild(body);
        if (curTheme) lab.setAttribute("data-theme", curTheme);

        var ta = $("textarea.lab-src", body),
            hl = $("code", $(".lab-hl", body)),
            hlPre = $(".lab-hl", body),
            gutter = $(".lab-gutter", body),
            frame = $(".lab-view", body),
            editor = $(".lab-editor", body),
            resizer = $(".lab-resizer", body),
            fileSpan = $(".lab-file", bar);

        ta.value = files[0].orig;

        function curFile() { return files[lab._active]; }

        function renderHL() {
            hl.innerHTML = highlight(ta.value, curFile().lang) + "\n";
            var lines = ta.value.split("\n").length, g = "";
            for (var i = 1; i <= lines; i++) g += i + "\n";
            gutter.textContent = g;
            syncScroll();
            autoHeight();
        }
        function syncScroll() {
            hlPre.scrollTop = ta.scrollTop; hlPre.scrollLeft = ta.scrollLeft;
            gutter.scrollTop = ta.scrollTop;
        }
        function autoHeight() {
            var h = Math.min(Math.max(hlPre.scrollHeight + 4, 120), 560);
            body.style.height = h + "px";
        }
        var run = debounce(function () { frame.srcdoc = labPreviewDoc(lab); }, 350);
        function runNow() { frame.srcdoc = labPreviewDoc(lab); }

        function refreshTabs() {
            $$(".lab-ft", bar).forEach(function (b) {
                b.classList.toggle("on", +b.getAttribute("data-i") === lab._active);
            });
        }
        function switchFile(i) {
            if (i === lab._active || !files[i]) return;
            curFile().cur = ta.value;
            lab._active = i;
            ta.value = curFile().cur;
            fileSpan.textContent = curFile().name;
            refreshTabs();
            renderHL();
            runNow();
        }
        $$(".lab-ft", bar).forEach(function (b) {
            b.addEventListener("click", function () { switchFile(+b.getAttribute("data-i")); });
        });

        ta.addEventListener("input", function () { curFile().cur = ta.value; renderHL(); run(); });
        ta.addEventListener("scroll", syncScroll);
        ta.addEventListener("keydown", function (e) {
            if (e.key === "Tab") {
                e.preventDefault();
                var s = ta.selectionStart;
                ta.setRangeText("    ", s, ta.selectionEnd, "end");
                curFile().cur = ta.value; renderHL(); run();
            }
        });

        $("[data-act=run]", bar).addEventListener("click", runNow);
        $("[data-act=reset]", bar).addEventListener("click", function () {
            files.forEach(function (f) { f.cur = f.orig; });
            ta.value = curFile().cur; renderHL(); runNow();
        });
        var sel = $(".lab-theme-sel", bar);
        sel.addEventListener("change", function () { setTheme(sel.value); });

        /* 分屏拖拽（桌面左右 / 窄屏上下） */
        var dragging = false;
        resizer.addEventListener("pointerdown", function (e) {
            dragging = true;
            resizer.classList.add("drag");
            resizer.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        resizer.addEventListener("pointermove", function (e) {
            if (!dragging) return;
            var r = body.getBoundingClientRect();
            if (getComputedStyle(body).flexDirection !== "column") {
                var x = Math.min(Math.max(e.clientX - r.left, 140), r.width - 160);
                editor.style.flex = "0 0 " + (x / r.width * 100).toFixed(2) + "%";
            } else {
                var y = Math.min(Math.max(e.clientY - r.top, 100), r.height - 120);
                editor.style.flex = "0 0 " + y + "px";
            }
        });
        resizer.addEventListener("pointerup", function () { dragging = false; resizer.classList.remove("drag"); });
        resizer.addEventListener("dblclick", function () { editor.style.flex = ""; });

        renderHL();
        runNow();
    }

    function setTheme(v) {
        curTheme = v;
        try { localStorage.setItem(themeKey, v); } catch (e) { }
        $$(".lab").forEach(function (l) {
            if (v) l.setAttribute("data-theme", v); else l.removeAttribute("data-theme");
            var s = $(".lab-theme-sel", l); if (s) s.value = v;
        });
        $$(".lx-codeblock").forEach(function (b) {
            if (v) b.setAttribute("data-theme", v); else b.removeAttribute("data-theme");
        });
    }

    /* ==================== 静态代码块 ==================== */
    function initCodeblock(box) {
        var lang = box.getAttribute("data-lang") || "css";
        var file = box.getAttribute("data-file") || (lang === "html" ? "index.html" : "style.css");
        var codeEl = $("script.lab-code", box);
        if (!codeEl) return;
        var code = dedent(codeEl.textContent);
        var bar = document.createElement("div");
        bar.className = "lab-bar";
        bar.innerHTML =
            '<span class="lab-dots"><i></i><i></i><i></i></span>' +
            '<span class="lab-file">' + esc(file) + "</span>" +
            '<div class="lab-tools"><button class="lab-btn" data-act="copy">复制</button></div>';
        var pre = document.createElement("pre");
        pre.innerHTML = "<code>" + highlight(code, lang) + "</code>";
        codeEl.style.display = "none";
        box.appendChild(bar);
        box.appendChild(pre);
        if (curTheme) box.setAttribute("data-theme", curTheme);
        $("[data-act=copy]", bar).addEventListener("click", function () {
            var btn = this;
            function ok() { btn.textContent = "已复制 ✓"; setTimeout(function () { btn.textContent = "复制"; }, 1400); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(ok, ok);
            } else {
                var t = document.createElement("textarea");
                t.value = code; document.body.appendChild(t); t.select();
                try { document.execCommand("copy"); } catch (e) { }
                document.body.removeChild(t); ok();
            }
        });
    }

    /* ==================== 滚动显现 ==================== */
    function initReveal() {
        var els = $$(".lx-article section, .lx-card");
        if (!("IntersectionObserver" in window)) {
            els.forEach(function (el) { el.classList.add("lx-in"); });
            return;
        }
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add("lx-in"); io.unobserve(en.target); }
            });
        }, { threshold: .06 });
        els.forEach(function (el) { io.observe(el); });
    }

    /* ==================== 启动 ==================== */
    function boot() {
        buildChrome();
        $$(".lab").forEach(initLab);
        $$(".lx-codeblock").forEach(initCodeblock);
        initReveal();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else { boot(); }
})();
