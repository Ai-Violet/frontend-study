/* ============================================================
   ide-data.js — 前端练习场数据层
   补全词库（HTML/CSS/JS）+ 4 章 24 个课程示例 + 主题表
   全部离线，零外部依赖
   ============================================================ */
(function () {
"use strict";

/* ---------- HTML 标签词库（按补全优先级排序） ---------- */
var TAGS = [
    ["div", "通用块级容器，页面布局的积木", 0],
    ["span", "通用行内容器，包裹一小段文本", 0],
    ["p", "段落", 0],
    ["a", "超链接，跳转或锚点", 0],
    ["img", "图片（自闭合）", 0],
    ["ul", "无序列表", 1],
    ["ol", "有序列表", 1],
    ["li", "列表项", 1],
    ["h1", "一级标题，每页只用一次", 1],
    ["h2", "二级标题", 1],
    ["h3", "三级标题", 2],
    ["h4", "四级标题", 2],
    ["h5", "五级标题", 2],
    ["h6", "六级标题", 2],
    ["input", "输入控件（自闭合）", 1],
    ["button", "按钮", 1],
    ["form", "表单，收集用户输入", 2],
    ["label", "控件标签，点击可聚焦控件", 2],
    ["select", "下拉选择框", 2],
    ["option", "下拉选项", 2],
    ["textarea", "多行文本域", 2],
    ["table", "表格", 1],
    ["tr", "表格行", 2],
    ["th", "表头单元格", 2],
    ["td", "数据单元格", 2],
    ["thead", "表头分组", 3],
    ["tbody", "表体分组", 3],
    ["header", "页头，语义化标签", 2],
    ["nav", "导航", 2],
    ["main", "主内容区（每页一次）", 2],
    ["article", "独立成篇的内容", 3],
    ["section", "内容区块", 2],
    ["aside", "侧边栏、旁注", 3],
    ["footer", "页脚", 2],
    ["figure", "配图区块", 3],
    ["figcaption", "配图说明文字", 3],
    ["strong", "强调（粗体，有语义）", 2],
    ["em", "着重（斜体，有语义）", 2],
    ["b", "粗体（无特殊语义）", 3],
    ["i", "斜体（无特殊语义）", 3],
    ["u", "下划线", 3],
    ["small", "小号文字", 3],
    ["mark", "高亮标记", 3],
    ["code", "行内代码", 2],
    ["pre", "预格式化文本块", 3],
    ["blockquote", "块引用", 3],
    ["br", "换行（自闭合）", 2],
    ["hr", "水平分隔线（自闭合）", 2],
    ["details", "可折叠详情", 3],
    ["summary", "折叠标题", 3],
    ["progress", "进度条", 3],
    ["video", "视频", 3],
    ["audio", "音频", 3],
    ["source", "媒体源（自闭合）", 3],
    ["iframe", "内嵌网页", 3],
    ["canvas", "画布，配合 JS 绘图", 3],
    ["svg", "矢量图形", 3],
    ["html", "文档根元素", 3],
    ["head", "文档头，放元信息", 3],
    ["body", "文档体，放可见内容", 3],
    ["title", "页面标题（标签页文字）", 2],
    ["meta", "元信息（自闭合）", 2],
    ["link", "引入外部资源（自闭合）", 2],
    ["style", "内部样式表", 2],
    ["script", "脚本", 2]
];

var VOID = { meta:1, link:1, img:1, input:1, br:1, hr:1, source:1, area:1, base:1, col:1, embed:1, track:1, wbr:1 };

/* ---------- 属性词库 ---------- */
var ATTRS_GLOBAL = [
    ["class", "类名，可复用的样式钩子", 0],
    ["id", "唯一标识，一页只出现一次", 0],
    ["style", "行内样式", 1],
    ["title", "悬停提示文字", 2],
    ["hidden", "隐藏元素", 3],
    ["lang", "语言代码", 3],
    ["dir", "文字方向", 3]
];
var ATTRS_BY_TAG = {
    a: [["href", "链接地址", 0], ["target", "打开方式", 1], ["rel", "与目标的关系", 2], ["download", "下载文件名", 3]],
    img: [["src", "图片地址", 0], ["alt", "替代文字（必写）", 0], ["width", "宽", 2], ["height", "高", 2], ["loading", "懒加载", 3]],
    input: [["type", "输入类型", 0], ["name", "控件名", 1], ["value", "当前值", 1], ["placeholder", "占位提示", 1], ["required", "必填", 2], ["checked", "选中", 2], ["disabled", "禁用", 2], ["min", "最小值", 3], ["max", "最大值", 3], ["step", "步长", 3]],
    link: [["rel", "资源关系", 0], ["href", "资源地址", 0], ["type", "MIME 类型", 2]],
    meta: [["charset", "字符编码", 0], ["name", "元信息名", 0], ["content", "元信息内容", 0]],
    script: [["src", "脚本地址", 0], ["defer", "延迟执行", 2], ["async", "异步执行", 2]],
    form: [["action", "提交地址", 1], ["method", "提交方式", 1]],
    select: [["name", "控件名", 1], ["multiple", "多选", 3]],
    label: [["for", "关联控件的 id", 0]],
    button: [["type", "按钮类型", 1], ["disabled", "禁用", 2]],
    video: [["src", "视频地址", 0], ["controls", "显示控制条", 0], ["loop", "循环", 2], ["muted", "静音", 2], ["autoplay", "自动播放", 3]],
    audio: [["src", "音频地址", 0], ["controls", "显示控制条", 0], ["loop", "循环", 2]],
    iframe: [["src", "内嵌页面地址", 0], ["width", "宽", 2], ["height", "高", 2]],
    details: [["open", "默认展开", 2]],
    ol: [["start", "起始编号", 3], ["reversed", "倒序", 3], ["type", "编号样式", 3]],
    td: [["colspan", "跨列数", 3], ["rowspan", "跨行数", 3]],
    html: [["lang", "页面语言", 0]]
};
var ATTR_VALS = {
    target: ["_blank", "_self", "_parent", "_top"],
    rel: ["noopener", "noreferrer", "nofollow", "stylesheet", "icon", "preload"],
    type: ["text", "password", "email", "number", "radio", "checkbox", "submit", "reset", "button", "date", "color", "range", "file", "hidden", "module", "text/javascript"],
    method: ["get", "post"],
    loading: ["lazy", "eager"],
    name: ["viewport", "description", "keywords", "author", "theme-color"],
    dir: ["ltr", "rtl"],
    lang: ["zh-CN", "en"],
    charset: ["UTF-8"]
};
var ENTITIES = [
    ["&lt;", "小于号 <", 0], ["&gt;", "大于号 >", 0], ["&amp;", "和号 &", 0],
    ["&nbsp;", "不换行空格", 1], ["&copy;", "版权 ©", 1], ["&times;", "乘号 ×", 2],
    ["&divide;", "除号 ÷", 2], ["&quot;", "双引号\"", 2], ["&apos;", "单引号'", 2]
];

/* ---------- CSS 词库 ---------- */
var CSS_PROPS = [
    ["display", "显示类型", 0], ["position", "定位方式", 0], ["width", "宽", 0], ["height", "高", 0],
    ["margin", "外边距", 0], ["padding", "内边距", 0], ["border", "边框简写", 0], ["color", "文字颜色", 0],
    ["background", "背景简写", 0], ["font-size", "字号", 0], ["font-family", "字体族", 1], ["font-weight", "字重", 1],
    ["line-height", "行高", 1], ["text-align", "水平对齐", 1], ["box-sizing", "盒模型计算方式", 1],
    ["flex", "flex 简写", 1], ["flex-direction", "主轴方向", 1], ["justify-content", "主轴对齐", 1],
    ["align-items", "交叉轴对齐", 1], ["flex-wrap", "是否换行", 2], ["gap", "间距", 1], ["grid-template-columns", "网格列", 1],
    ["grid-template-rows", "网格行", 2], ["grid-template-areas", "网格区域", 3], ["place-items", "对齐简写", 2],
    ["top", "上偏移", 1], ["right", "右偏移", 1], ["bottom", "下偏移", 1], ["left", "左偏移", 1], ["z-index", "层叠顺序", 1],
    ["float", "浮动", 1], ["clear", "清除浮动", 2], ["overflow", "溢出处理", 1], ["visibility", "可见性", 2],
    ["max-width", "最大宽", 1], ["min-width", "最小宽", 2], ["max-height", "最大高", 3],
    ["background-color", "背景色", 1], ["background-image", "背景图", 1], ["background-size", "背景尺寸", 2],
    ["background-position", "背景位置", 2], ["background-repeat", "背景平铺", 2], ["background-clip", "背景裁剪", 3],
    ["opacity", "不透明度", 1], ["border-radius", "圆角", 0], ["border-color", "边框色", 2], ["border-width", "边框粗", 2],
    ["border-style", "边框样式", 2], ["box-shadow", "阴影", 1], ["outline", "外轮廓", 2], ["cursor", "光标样式", 2],
    ["text-decoration", "文字装饰线", 1], ["text-transform", "大小写转换", 2], ["text-indent", "首行缩进", 2],
    ["text-shadow", "文字阴影", 2], ["letter-spacing", "字间距", 2], ["word-spacing", "词间距", 3],
    ["white-space", "空白处理", 2], ["text-overflow", "溢出省略号", 2], ["word-break", "换行规则", 3],
    ["font-style", "斜体", 2], ["list-style", "列表标记", 2], ["list-style-type", "标记类型", 2],
    ["list-style-position", "标记位置", 3], ["transform", "变换", 1], ["transform-origin", "变换原点", 3],
    ["perspective", "3D 透视", 3], ["transition", "过渡简写", 1], ["transition-property", "过渡属性", 2],
    ["transition-duration", "过渡时长", 2], ["transition-timing-function", "缓动函数", 2], ["transition-delay", "延迟", 3],
    ["animation", "动画简写", 1], ["animation-name", "动画名", 2], ["animation-duration", "动画时长", 2],
    ["animation-timing-function", "缓动", 3], ["animation-delay", "延迟", 3], ["animation-iteration-count", "次数", 3],
    ["animation-direction", "方向", 3], ["animation-fill-mode", "填充模式", 3],
    ["content", "伪元素内容", 2], ["user-select", "能否选中文本", 3], ["object-fit", "替换内容适配", 2],
    ["resize", "能否拖拽调整", 3], ["filter", "滤镜", 2], ["backdrop-filter", "背景滤镜", 3],
    ["vertical-align", "行内垂直对齐", 2], ["aspect-ratio", "宽高比", 2], ["cursor", "光标", 2],
    ["border-collapse", "表格边框合并", 2], ["pointer-events", "指针事件", 3], ["scroll-behavior", "滚动行为", 3]
];
var CSS_VALS = {
    display: ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "none", "table", "table-cell", "flow-root"],
    position: ["static", "relative", "absolute", "fixed", "sticky"],
    "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly", "start", "end"],
    "align-items": ["stretch", "flex-start", "center", "flex-end", "baseline", "start", "end"],
    "align-content": ["stretch", "flex-start", "center", "flex-end", "space-between", "space-around"],
    "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
    "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
    "text-align": ["left", "center", "right", "justify", "start", "end"],
    "text-decoration": ["none", "underline", "line-through", "overline"],
    "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
    "font-weight": ["normal", "bold", "300", "400", "500", "600", "700", "800", "900"],
    "font-style": ["normal", "italic", "oblique"],
    overflow: ["visible", "hidden", "scroll", "auto", "clip"],
    "overflow-x": ["visible", "hidden", "scroll", "auto"],
    "overflow-y": ["visible", "hidden", "scroll", "auto"],
    cursor: ["pointer", "default", "auto", "text", "move", "not-allowed", "grab", "crosshair", "help", "wait"],
    float: ["left", "right", "none"],
    clear: ["left", "right", "both", "none"],
    visibility: ["visible", "hidden", "collapse"],
    "box-sizing": ["border-box", "content-box"],
    "background-repeat": ["repeat", "no-repeat", "repeat-x", "repeat-y", "space", "round"],
    "background-size": ["cover", "contain", "auto", "100% 100%", "50%"],
    "background-position": ["center", "top", "bottom", "left", "right", "center top", "50% 50%"],
    "border-style": ["solid", "dashed", "dotted", "double", "none", "groove", "ridge"],
    "border-collapse": ["collapse", "separate"],
    "white-space": ["normal", "nowrap", "pre", "pre-wrap", "pre-line"],
    "text-overflow": ["clip", "ellipsis"],
    "list-style-type": ["disc", "circle", "square", "decimal", "none", "lower-roman", "upper-alpha"],
    "list-style-position": ["inside", "outside"],
    "transition-timing-function": ["ease", "linear", "ease-in", "ease-out", "ease-in-out", "cubic-bezier(.4,0,.2,1)"],
    "animation-timing-function": ["ease", "linear", "ease-in", "ease-out", "ease-in-out", "steps(4)"],
    "animation-direction": ["normal", "reverse", "alternate", "alternate-reverse"],
    "animation-fill-mode": ["none", "forwards", "backwards", "both"],
    "animation-iteration-count": ["infinite", "1", "2", "3"],
    transform: ["translate(x, y)", "translateX(10px)", "scale(1.2)", "rotate(45deg)", "skewX(10deg)", "perspective(600px) rotateY(15deg)", "none"],
    "object-fit": ["fill", "cover", "contain", "none", "scale-down"],
    resize: ["none", "both", "horizontal", "vertical"],
    "user-select": ["auto", "none", "text", "all"],
    "scroll-behavior": ["auto", "smooth"],
    "pointer-events": ["auto", "none"],
    "place-items": ["center", "start center", "stretch", "end"]
};
var CSS_GENERIC_VALS = ["inherit", "initial", "unset", "auto", "none", "0", "1px", "2px", "4px", "8px", "16px", "24px", "1em", "1rem", "50%", "100%", "#fff", "#000", "transparent", "currentColor"];
var CSS_PSEUDO = [
    [":hover", "悬停时", 0], [":active", "按下时", 1], [":focus", "聚焦时", 1], [":visited", "已访问链接", 2],
    [":first-child", "第一个子元素", 1], [":last-child", "最后一个子元素", 1], [":nth-child()", "第 n 个", 1],
    [":not()", "否定", 2], [":checked", "选中（表单）", 2], [":focus-visible", "键盘聚焦", 2],
    ["::before", "元素前插入内容", 0], ["::after", "元素后插入内容", 0], ["::placeholder", "占位符样式", 2], ["::selection", "选区样式", 2]
];
var CSS_AT = [
    ["@media", "媒体查询，响应式核心", 0], ["@keyframes", "关键帧动画", 0],
    ["@font-face", "自定义字体", 2], ["@import", "导入样式表", 3], ["@supports", "特性检测", 3]
];

/* ---------- JS 词库 ---------- */
var JS_KW = [
    ["const", "常量声明", 0], ["let", "变量声明", 0], ["var", "旧式变量声明", 1], ["function", "函数", 0],
    ["return", "返回", 0], ["if", "如果", 0], ["else", "否则", 0], ["for", "循环", 0], ["while", "当循环", 1],
    ["switch", "分支", 2], ["case", "分支值", 2], ["break", "跳出", 1], ["continue", "跳过本轮", 2],
    ["true", "真", 0], ["false", "假", 0], ["null", "空值", 0], ["undefined", "未定义", 0],
    ["typeof", "类型判断", 1], ["new", "实例化", 2], ["this", "当前对象", 2], ["class", "类", 2],
    ["try", "尝试", 2], ["catch", "捕获", 2], ["finally", "最终", 3], ["throw", "抛出", 3], ["async", "异步", 3], ["await", "等待", 3]
];
var JS_SNIPS = [
    ["log", "console.log()", "console.log(¦)", 0],
    ["warn", "console.warn()", "console.warn(¦)", 2],
    ["error", "console.error()", "console.error(¦)", 2],
    ["qs", "document.querySelector()", "document.querySelector('¦')", 0],
    ["qsa", "document.querySelectorAll()", "document.querySelectorAll('¦')", 2],
    ["gid", "document.getElementById()", "document.getElementById('¦')", 2],
    ["ael", "addEventListener", "addEventListener('¦', function () {\n  \n})", 0],
    ["fn", "函数", "function () {\n  ¦\n}", 2],
    ["for", "for 循环", "for (var i = 0; i < 10; i++) {\n  ¦\n}", 1],
    ["forever", "定时循环", "setInterval(function () {\n  ¦\n}, 1000)", 3],
    ["delay", "延时执行", "setTimeout(function () {\n  ¦\n}, 1000)", 3]
];
var JS_MEMBERS = {
    console: [["log", "打印", 0], ["warn", "警告", 1], ["error", "错误", 1], ["info", "信息", 2], ["table", "表格打印", 3], ["time", "计时开始", 3], ["timeEnd", "计时结束", 3]],
    document: [["querySelector", "选第一个", 0], ["querySelectorAll", "选全部", 0], ["getElementById", "按 id 选", 1], ["getElementsByClassName", "按类名选", 2], ["createElement", "创建元素", 1], ["addEventListener", "监听事件", 1], ["body", "body 元素", 1], ["title", "页面标题", 2]],
    window: [["addEventListener", "监听事件", 1], ["setTimeout", "延时", 1], ["setInterval", "定时循环", 1], ["clearTimeout", "取消延时", 2], ["clearInterval", "取消循环", 2], ["alert", "弹窗", 2], ["confirm", "确认框", 2], ["prompt", "输入框", 2], ["innerWidth", "视口宽", 2], ["innerHeight", "视口高", 2], ["location", "地址栏", 3], ["scrollTo", "滚动到", 3]],
    Math: [["random", "0~1 随机数", 0], ["floor", "向下取整", 0], ["ceil", "向上取整", 1], ["round", "四舍五入", 1], ["abs", "绝对值", 1], ["max", "最大值", 1], ["min", "最小值", 1], ["sqrt", "平方根", 2], ["pow", "幂", 2], ["PI", "圆周率", 2]],
    JSON: [["parse", "字符串转对象", 1], ["stringify", "对象转字符串", 1]],
    element: [["addEventListener", "监听事件", 0], ["classList", "类名操作", 0], ["style", "行内样式", 0], ["textContent", "文字内容", 0], ["innerHTML", "内部 HTML", 0], ["setAttribute", "设置属性", 1], ["getAttribute", "读取属性", 1], ["appendChild", "追加子元素", 1], ["value", "值（表单）", 1], ["id", "id", 2], ["closest", "向上找祖先", 2], ["remove", "移除自己", 2], ["focus", "聚焦", 2], ["querySelector", "内部查找", 1]]
};
var JS_GLOB = [
    ["console", "控制台对象", 0], ["document", "文档对象", 0], ["window", "全局窗口", 1],
    ["Math", "数学工具", 1], ["JSON", "JSON 工具", 1], ["localStorage", "本地存储", 2],
    ["setTimeout", "延时执行", 2], ["setInterval", "定时循环", 2], ["clearTimeout", "取消延时", 3],
    ["clearInterval", "取消循环", 3], ["location", "地址栏", 3], ["navigator", "浏览器信息", 3]
];

/* ---------- 主题表 ---------- */
var THEMES = [
    { id: "dark", name: "Dark+ 经典", d: "VSCode 默认深色，蓝白灰的经典搭配。", sw: ["#1e1e1e", "#264f78", "#0e7fd4"] },
    { id: "light", name: "暖白纸张", d: "站点血脉——暖纸底色 + 赭橙主色，白天久看不刺眼。", sw: ["#faf5ec", "#b8552f", "#f3ecdd"] },
    { id: "midnight", name: "午夜蓝", d: "深海蓝底 + 冰蓝高亮，安静专注。", sw: ["#0d1b2a", "#4cc2ff", "#1f4a6e"] },
    { id: "cosmic", name: "星云紫", d: "深紫星空感，粉紫渐变点缀。", sw: ["#1b1630", "#a78bfa", "#463373"] },
    { id: "monokai", name: "Monokai", d: "程序员老朋友，暗绿底 + 荧光绿。", sw: ["#272822", "#a6e22e", "#49483e"] }
];

/* ============================================================
   课程示例：4 章 24 例，覆盖全部课程重点
   每例为完整独立 HTML，加载时自动拆分为 index.html / style.css / script.js
   ============================================================ */
var S = {};

S.hello = ['我的第一张网页', '01-HTML基础', ['HTML骨架', '标题段落', '链接图片'], '每个网页都长这一副骨架：声明、根元素、头和体。',
['认识 <!DOCTYPE html> 和 <html>、<head>、<body> 三层结构', '用 h1~h3 和 p 组织文字', '插入一张图片和一条链接'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>我的第一张网页</title>\n</head>\n<body>\n  <!-- h1 是页面最大的标题，一页只用一个 -->\n  <h1>你好，前端世界</h1>\n\n  <h2>我正在学习 HTML</h2>\n  <p>HTML 是网页的骨架。段落用 p 标签，\n     浏览器会自动忽略代码里的换行和多余空格。</p>\n\n  <h3>试一试</h3>\n  <p>这一行里有一个 <strong>加粗强调</strong>、一个 <em>斜体着重</em>，\n     还有一条链接：</p>\n\n  <!-- a 标签：href 指向跳转地址 -->\n  <p><a href="https://developer.mozilla.org/zh-CN/">MDN 文档</a> 是最好的参考书。</p>\n\n  <!-- img：alt 是图片加载失败时的替代文字，必写 -->\n  <img src="https://picsum.photos/300/180" alt="一张随机示例图">\n\n  <!-- hr 画一条水平分隔线，br 强制换行 -->\n  <hr>\n  <p>学完骨架，下一站：给网页穿衣服（CSS）。</p>\n</body>\n</html>'];

S.attrs = ['元素与属性', '01-HTML基础', ['属性写法', 'class和id', 'title提示'], '属性写在开始标签里，是元素的"个人档案"。',
['掌握 属性名="属性值" 的书写位置', '理解 class（可重复）与 id（唯一）的区别', '试试 title 的悬停提示效果'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>元素与属性</title>\n  <style>\n    .box {\n      padding: 14px 18px;\n      border: 1px dashed #b8552f;\n      border-radius: 8px;\n      margin: 10px 0;\n      background: #faf5ec;\n    }\n    #special {\n      background: #fff4e5;\n      border-style: solid;\n    }\n  </style>\n</head>\n<body>\n  <h1>属性：元素的档案</h1>\n\n  <!-- class 可以给多个元素共用 -->\n  <div class="box">我是 class="box" 的盒子</div>\n  <div class="box">我和上面那位共用一个 class</div>\n\n  <!-- id 全页唯一，像身份证号 -->\n  <div class="box" id="special">\n    我多了一个 id="special"——把鼠标悬停在这行字上看看！\n  </div>\n\n  <!-- title：悬停提示 -->\n  <p title="这是 title 属性的提示气泡">鼠标悬停我 1 秒钟。</p>\n\n  <!-- style：直接写在元素上的行内样式 -->\n  <p style="color: #b8552f; font-weight: bold;">\n    我是靠 style 属性变红变粗的。\n  </p>\n</body>\n</html>'];

S['list-table'] = ['列表与表格', '01-HTML基础', ['ul和ol', 'table', 'th与td'], '列表管"排队"，表格管"二维数据"。',
['用 ul/li 做无序列表，ol/li 做有序列表', '写出带 thead/tbody 的三列表格', '用 th 表示表头、td 表示数据'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>列表与表格</title>\n  <style>\n    table { border-collapse: collapse; }\n    th, td { border: 1px solid #c9b8a0; padding: 8px 14px; }\n    th { background: #f0e6d2; }\n  </style>\n</head>\n<body>\n  <h1>清单与报表</h1>\n\n  <h2>购物清单（无序 ul）</h2>\n  <ul>\n    <li>键盘</li>\n    <li>显示器</li>\n    <li>人体工学椅</li>\n  </ul>\n\n  <h2>学习计划（有序 ol）</h2>\n  <ol>\n    <li>HTML 打骨架</li>\n    <li>CSS 穿衣服</li>\n    <li>JavaScript 注入灵魂</li>\n  </ol>\n\n  <h2>课程表（table）</h2>\n  <table>\n    <thead>\n      <tr><th>时间</th><th>周一</th><th>周三</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>19:00</td><td>HTML</td><td>CSS</td></tr>\n      <tr><td>20:00</td><td>Flex</td><td>Grid</td></tr>\n      <tr><td>21:00</td><td>动画</td><td>响应式</td></tr>\n    </tbody>\n  </table>\n</body>\n</html>'];

S.form = ['表单与输入', '01-HTML基础', ['form', 'input类型', 'label关联'], '表单是网页"收集信息"的窗口。',
['用 label 的 for 属性关联输入框', '体验 text / radio / checkbox / select 各种控件', '理解 name 把同组单选框绑在一起'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>表单与输入</title>\n  <style>\n    body { font-family: sans-serif; max-width: 420px; margin: 24px auto; }\n    label { display: block; margin: 14px 0 4px; font-weight: bold; }\n    input, select, textarea {\n      padding: 8px; border: 1px solid #bbb; border-radius: 6px;\n    }\n    fieldset { border: 1px solid #ddd; border-radius: 10px; margin-top: 14px; }\n    button {\n      margin-top: 16px; padding: 9px 22px;\n      background: #0e7fd4; color: #fff; border: 0;\n      border-radius: 6px; cursor: pointer;\n    }\n  </style>\n</head>\n<body>\n  <h1>注册练习表单</h1>\n  <form>\n    <!-- label 的 for 指向 input 的 id：点击文字也能聚焦 -->\n    <label for="user">昵称</label>\n    <input id="user" type="text" placeholder="请输入昵称" required>\n\n    <label for="mail">邮箱</label>\n    <input id="mail" type="email" placeholder="you@example.com">\n\n    <fieldset>\n      <legend>性别（同 name = 一组单选）</legend>\n      <label><input type="radio" name="gender" value="f"> 女</label>\n      <label><input type="radio" name="gender" value="m"> 男</label>\n    </fieldset>\n\n    <fieldset>\n      <legend>兴趣（复选框）</legend>\n      <label><input type="checkbox" value="css"> CSS</label>\n      <label><input type="checkbox" value="js" checked> JavaScript</label>\n    </fieldset>\n\n    <label for="city">城市</label>\n    <select id="city">\n      <option>北京</option>\n      <option>上海</option>\n      <option>广州</option>\n    </select>\n\n    <label for="bio">签名</label>\n    <textarea id="bio" rows="3" cols="30" placeholder="一句话介绍自己"></textarea>\n\n    <button type="submit">提交</button>\n  </form>\n</body>\n</html>'];

S.semantic = ['语义化与HTML5', '01-HTML基础', ['header/nav', 'main/article', 'footer'], '让每个标签"名副其实"，代码自己会说话。',
['用 header/nav/main/aside/footer 搭页面骨架', '在 article 里包一篇独立的内容', '理解为什么不用 div 一把梭'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>语义化页面</title>\n  <style>\n    body { font-family: sans-serif; margin: 0; color: #333; }\n    header, footer { background: #2d2a26; color: #fff; padding: 18px 24px; }\n    nav a { color: #ffd9a8; margin-right: 14px; }\n    main { display: flex; gap: 20px; padding: 20px; max-width: 900px; margin: 0 auto; }\n    article { flex: 1; }\n    aside { width: 220px; background: #faf5ec; padding: 12px 16px; border-radius: 8px; }\n    h1, h2 { margin-top: 0; }\n    footer { font-size: 13px; }\n  </style>\n</head>\n<body>\n  <!-- 页头：放标题和导航 -->\n  <header>\n    <h1>我的博客</h1>\n    <nav>\n      <a href="#">首页</a><a href="#">归档</a><a href="#">关于</a>\n    </nav>\n  </header>\n\n  <!-- 主体内容：一页只有一个 main -->\n  <main>\n    <!-- article：一篇能独立转发的文章 -->\n    <article>\n      <h2>为什么写语义化 HTML</h2>\n      <p>屏幕阅读器靠标签理解页面；搜索引擎靠标签判断权重。\n         全是 div 的页面，机器读起来像一锅粥。</p>\n      <section>\n        <h3>section 用来分节</h3>\n        <p>一段主题相关的内容就包一个 section。</p>\n      </section>\n    </article>\n\n    <!-- aside：与正文相关但独立的边栏 -->\n    <aside>\n      <h3>关于我</h3>\n      <p>前端学习中，每天进步一点点。</p>\n    </aside>\n  </main>\n\n  <footer>© 2026 我的前端学习笔记 · 用语义化标签写的</footer>\n</body>\n</html>'];

S['first-css'] = ['第一个CSS', '02-CSS基础', ['选择器', '属性与值', '三种引入'], '选择器 { 属性: 值; } —— CSS 的全部语法。',
['理解 选择器-属性-值 三层结构', '区分 元素 / class / id 三种选择器', '对照查看 head 里 style 的引入方式'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>第一个 CSS</title>\n  <!-- 内部样式表：写在 style 标签里 -->\n  <style>\n    /* 元素选择器：所有 p 变灰 */\n    p {\n      color: #666;\n    }\n\n    /* class 选择器：以点开头，可复用 */\n    .highlight {\n      background: #fff3c4;\n      padding: 2px 6px;\n      border-radius: 4px;\n    }\n\n    /* id 选择器：以 # 开头，全页唯一 */\n    #hero {\n      color: #b8552f;\n      font-size: 28px;\n    }\n\n    /* 一条规则里可以写多条 声明（属性:值）*/\n    .card {\n      border: 1px solid #e0d5c0;\n      padding: 14px;\n      border-radius: 8px;\n      margin-top: 14px;\n    }\n  </style>\n</head>\n<body>\n  <h1 id="hero">CSS 三要素</h1>\n  <p>选择器负责<span class="highlight">找到谁</span>，\n     大括号里的声明负责<span class="highlight">怎么改</span>。</p>\n\n  <div class="card">\n    <p>class 用 . 开头、可以重复用；id 用 # 开头、全页唯一。</p>\n  </div>\n  <div class="card">\n    <p>这条规则我也能用——这就是复用。</p>\n  </div>\n</body>\n</html>'];

S.text = ['文本与字体', '02-CSS基础', ['font系列', 'line-height', 'text系列'], '字号、字重、行高、对齐——网页的排版基本功。',
['用 font-family 写字体栈，font-size 设字号', '用 font-weight 和 font-style 调粗细斜体', '设置 line-height 让长文更易读'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>文本与字体</title>\n  <style>\n    body {\n      /* 字体栈：前面的没有就退到后面 */\n      font-family: "Microsoft YaHei", "PingFang SC", sans-serif;\n      line-height: 1.8;          /* 行高：无单位 = 字号的倍数 */\n      color: #333;\n      max-width: 640px;\n      margin: 30px auto;\n      padding: 0 20px;\n    }\n    h1 { font-size: 26px; }\n    h2 { font-size: 19px; }\n    .thin   { font-weight: 300; }\n    .bold   { font-weight: 700; }\n    .black  { font-weight: 900; }\n    .italic { font-style: italic; }\n    .loose  { letter-spacing: 4px; }\n\n    .ta-left   { text-align: left; }\n    .ta-center { text-align: center; }\n    .ta-right  { text-align: right; }\n\n    a { color: #0e7fd4; text-decoration: none; }\n    a:hover { text-decoration: underline; }\n\n    .upper { text-transform: uppercase; letter-spacing: 2px; }\n  </style>\n</head>\n<body>\n  <h1>文字的穿搭指南</h1>\n  <p class="thin">细体 300 —— 安静的说明文字。</p>\n  <p class="bold">粗体 700 —— 需要被看见。</p>\n  <p class="black">特粗 900 —— 大声说话。</p>\n  <p class="italic">斜体 italic —— 引用或旁白。</p>\n  <p class="loose">字间距 4px 的排版气质。</p>\n\n  <h2>对齐方式</h2>\n  <p class="ta-left">左对齐（默认）</p>\n  <p class="ta-center">居中对齐</p>\n  <p class="ta-right">右对齐</p>\n\n  <h2>链接装饰</h2>\n  <p>平时<a href="#">没有下划线</a>，悬停时出现。</p>\n  <p class="upper">made in css</p>\n</body>\n</html>'];

S['bg-border'] = ['背景与边框', '02-CSS基础', ['background', 'border', 'border-radius'], '给盒子刷漆、镶边、磨圆角。',
['设置背景色与背景图的平铺方式', '用 border 简写一条声明搞定粗细样式颜色', '用 border-radius 做圆形头像'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>背景与边框</title>\n  <style>\n    body { font-family: sans-serif; padding: 24px; }\n    .demo {\n      height: 90px; margin: 14px 0; padding: 14px;\n      color: #fff;\n    }\n    /* 纯色背景 */\n    .bg1 { background: #5b7cfa; }\n\n    /* 平铺的条纹背景（渐变也能当背景图）*/\n    .bg2 {\n      background-image: repeating-linear-gradient(\n        45deg, #47c98a 0 14px, #3aa874 14px 28px);\n    }\n\n    /* 背景图 + 不平铺 + 居中 + 覆盖 */\n    .bg3 {\n      background-image: url("https://picsum.photos/600/200");\n      background-repeat: no-repeat;\n      background-size: cover;\n      background-position: center;\n    }\n\n    /* 边框简写：粗细 样式 颜色 */\n    .bd { border: 3px solid #b8552f; background: #fff; color: #333; }\n    .bd2 { border: 4px dashed #0e7fd4; background: #fff; color: #333; }\n\n    /* 圆角：50% = 正圆 */\n    .avatar {\n      width: 90px; height: 90px; border-radius: 50%;\n      background-image: url("https://picsum.photos/120");\n      background-size: cover;\n    }\n    /* 大圆角胶囊 */\n    .pill { border-radius: 999px; background: #333; }\n  </style>\n</head>\n<body>\n  <h1>刷漆镶边术</h1>\n  <div class="demo bg1">纯色背景</div>\n  <div class="demo bg2">条纹（渐变平铺出来的）</div>\n  <div class="demo bg3">背景图 cover 覆盖</div>\n  <div class="demo bd">实线边框 3px solid</div>\n  <div class="demo bd2">虚线边框 4px dashed</div>\n  <div class="avatar" title="圆形头像"></div>\n  <div class="demo pill">胶囊圆角 border-radius: 999px</div>\n</body>\n</html>'];

S.boxmodel = ['盒模型', '02-CSS基础', ['padding/margin', 'border', 'box-sizing'], '每个元素都是一个盒子：内容 + 内边距 + 边框 + 外边距。',
['区分 padding（内）与 margin（外）', '用 box-sizing: border-box 让 width 包含边框', '观察调试背景区分四层结构'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>盒模型</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; background: #f4efe6; }\n    .box {\n      background: #ffe8c8;          /* 内容区颜色 */\n      padding: 24px;                /* 内边距：内容到边框 */\n      border: 6px solid #b8552f;    /* 边框 */\n      margin: 24px;                 /* 外边距：边框到别人 */\n      width: 300px;                 /* content-box 下只是内容宽 */\n    }\n    /* border-box：width 把边框和内边距一起算进去 */\n    .bb { box-sizing: border-box; }\n\n    .wrap { outline: 1px dashed #999; outline-offset: -1px; }\n  </style>\n</head>\n<body>\n  <h1>一个盒子的四层蛋糕</h1>\n\n  <div class="wrap">\n    <div class="box">\n      width: 300px —— 默认 content-box，\n      实际占地 = 300 + 24*2 + 6*2 = 360px。\n    </div>\n  </div>\n\n  <div class="wrap">\n    <div class="box bb">\n      加了 box-sizing: border-box 后，\n      整个盒子被压回 300px，内容自动变窄。\n    </div>\n  </div>\n\n  <p>经验法则：全局一行 <code>* { box-sizing: border-box }</code>，\n     布局立刻省心。</p>\n</body>\n</html>'];

S.display = ['显示与尺寸', '02-CSS基础', ['block/inline', 'inline-block', 'none'], '块级独占一行，行内只占内容宽。',
['对比 block / inline / inline-block 的宽度行为', '用 display: none 彻底隐藏元素', '用 max-width 让图片自适应'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>显示与尺寸</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n    .blk {\n      display: block;\n      background: #cfe3ff; padding: 8px 12px; margin: 6px 0;\n    }\n    .inl {\n      display: inline;\n      background: #ffd9e0; padding: 8px 12px;\n    }\n    /* inline-block：像文字一样排，但能设宽高 */\n    .inb {\n      display: inline-block;\n      background: #d9f2dd; padding: 10px;\n      width: 120px; height: 60px;\n      margin: 6px 4px 0 0;\n      vertical-align: top;\n    }\n    .hidden { display: none; }\n    img { max-width: 100%; }\n  </style>\n</head>\n<body>\n  <h1>三种 display</h1>\n\n  <h2>block：独占一行，默认拉满</h2>\n  <span class="blk">我是 span，但 display:block 后独占一行</span>\n  <span class="blk">第二个块，另起一行</span>\n\n  <h2>inline：只占内容宽，设宽高无效</h2>\n  <span class="inl">行内片段</span>中间的空格\n  <span class="inl">会被保留</span>\n\n  <h2>inline-block：排队但可设宽高</h2>\n  <span class="inb">120×60</span>\n  <span class="inb">并排站立</span>\n  <span class="inb">还能垂直对齐</span>\n\n  <h2>none：彻底消失</h2>\n  <p>下面有一段文字，但你看不见：</p>\n  <p class="hidden">我是被隐藏的内容</p>\n  <p>（它不占任何空间）</p>\n\n  <h2>max-width: 100% 图片自适应</h2>\n  <img src="https://picsum.photos/800/240" alt="宽图">\n</body>\n</html>'];

S.selector = ['选择器进阶', '02-CSS基础', ['后代/子代', '伪类', '分组'], '组合选择器，指哪打哪。',
['用空格选后代、> 选直接子代', '用 + 选相邻兄弟、分组选择器去重', '体验 :hover :first-child 伪类'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>选择器进阶</title>\n  <style>\n    /* 后代选择器：menu 里的所有 a（含孙子）*/\n    .menu a { color: #0e7fd4; text-decoration: none; margin-right: 10px; }\n\n    /* 子代选择器：只选直接子元素，ul > li */\n    .tree > li { font-weight: bold; list-style: none; }\n\n    /* 相邻兄弟：li 后面紧跟的 li */\n    .tree li + li { border-top: 1px dashed #ccc; margin-top: 6px; padding-top: 6px; }\n\n    /* 分组：一次选中多个 */\n    h2, .menu a { letter-spacing: 1px; }\n\n    /* 伪类：状态选择器 */\n    .menu a:hover {\n      color: #b8552f;\n      border-bottom: 2px solid #b8552f;\n    }\n    li:first-child { color: #2e9e5b; }\n    li:last-child { color: #c0392b; }\n    input:focus { outline: 2px solid #0e7fd4; }\n\n    /* 否定伪类 */\n    .list li:not(.skip) { color: #444; }\n    .skip { color: #bbb !important; }\n  </style>\n</head>\n<body>\n  <h1>指哪打哪</h1>\n  <nav class="menu">\n    <a href="#">首页</a>\n    <a href="#">文章</a>\n    <a href="#">关于</a>\n  </nav>\n\n  <h2>列表染色</h2>\n  <ul class="tree">\n    <li>第一条 :first-child 绿色</li>\n    <li>中间几条，虚线来自 li + li</li>\n    <li>最后一条 :last-child 红色</li>\n  </ul>\n\n  <h2>:not() 排除</h2>\n  <ul class="list">\n    <li>正常条目</li>\n    <li class="skip">我被 .skip 排除了</li>\n    <li>正常条目</li>\n  </ul>\n\n  <h2>:focus 聚焦</h2>\n  <input type="text" placeholder="点我聚焦看描边">\n</body>\n</html>'];

S.flow = ['布局与对齐', '03-CSS布局', ['常规流', 'margin auto', '块与行内'], '不浮动不定位的默认世界里，元素怎么排？',
['理解块级上下排、行内左右排的常规流', '用 margin: 0 auto 水平居中块级元素', '用 text-align 居中行内内容'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>布局与对齐</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; background: #f6f2ea; }\n    /* 块级元素水平居中的经典写法 */\n    .page {\n      width: 480px;\n      margin: 0 auto;   /* 上下 0，左右 auto 平分 */\n      background: #fff;\n      padding: 20px 26px;\n      border-radius: 10px;\n    }\n    .line-demo {\n      background: #fff3c4;\n      padding: 10px;\n      margin: 10px 0;\n    }\n    .center-text { text-align: center; }\n    .center-img { display: block; margin: 0 auto; }\n  </style>\n</head>\n<body>\n  <div class="page">\n    <h1>常规流的世界</h1>\n\n    <h2>块级：上下排队</h2>\n    <div class="line-demo">块 1</div>\n    <div class="line-demo">块 2 —— 不用浮动，默认各占一行</div>\n\n    <h2>行内：左右排队</h2>\n    <p><strong>加粗</strong>和<em>斜体</em>和<a href="#">链接</a>\n       在同一行里左右排布，排不下才换行。</p>\n\n    <h2>居中三件事</h2>\n    <div class="center-text">\n      <p>文字居中：父元素 text-align: center</p>\n      <img class="center-img" src="https://picsum.photos/240/90" alt="居中图">\n    </div>\n    <p style="text-align: center; color: #888; font-size: 13px;">\n      图片居中：先 display:block 再 margin: 0 auto\n    </p>\n  </div>\n</body>\n</html>'];

S.float = ['浮动', '03-CSS布局', ['float', 'clear', 'clearfix'], '老牌布局术：让元素"漂"到一边，文字绕着走。',
['用 float: left 做图文环绕', '理解浮动能并排但不能撑开父级', '用 clearfix 解决高度塌陷'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>浮动</title>\n  <style>\n    body { font-family: sans-serif; max-width: 640px; margin: 20px auto; padding: 0 16px; }\n\n    /* 图文环绕：图片浮到左边，文字绕右侧 */\n    .wrap-demo img {\n      float: left;\n      margin: 0 16px 8px 0;\n      border-radius: 8px;\n    }\n\n    /* 浮动排布：三张卡片 */\n    .card {\n      float: left;\n      width: 31%;\n      margin-right: 3.5%;\n      background: #eef4ff;\n      padding: 16px 10px;\n      text-align: center;\n      border-radius: 8px;\n    }\n    .card:last-child { margin-right: 0; }\n\n    /* 父级高度塌陷 → clearfix：末尾伪元素清浮动 */\n    .clearfix::after {\n      content: "";\n      display: block;\n      clear: both;\n    }\n\n    .footer-line {\n      clear: both;               /* 不跟浮动元素挤在一行 */\n      margin-top: 18px;\n      padding-top: 12px;\n      border-top: 2px solid #b8552f;\n    }\n  </style>\n</head>\n<body>\n  <h1>浮动两板斧</h1>\n\n  <h2>图文环绕</h2>\n  <div class="wrap-demo">\n    <img src="https://picsum.photos/160/120" alt="浮动的图">\n    <p>图片 float:left 之后脱离了常规流，文字自动环绕在它右侧。\n       这是报纸杂志的经典排版。浮动元素仍然占据文本空间，\n       所以文字会"感知"它的存在并绕行。</p>\n  </div>\n\n  <h2>浮动并排 + clearfix</h2>\n  <div class="clearfix">\n    <div class="card">卡片一</div>\n    <div class="card">卡片二</div>\n    <div class="card">卡片三</div>\n  </div>\n  <!-- 没有 clearfix，这条分隔线会钻到卡片上面去 -->\n  <div class="footer-line">我站在所有浮动卡片下方，靠 clear: both。</div>\n</body>\n</html>'];

S.position = ['定位', '03-CSS布局', ['relative', 'absolute', 'fixed与z-index'], '让元素脱离常轨，想去哪去哪。',
['理解 relative 的"占位不挪窝"特性', '用 absolute + relative 父级做角标', '用 fixed 做吸顶栏，z-index 管层叠'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>定位</title>\n  <style>\n    body { font-family: sans-serif; margin: 0; padding: 70px 20px 20px; }\n\n    /* fixed：相对浏览器窗口，滚动也吸在顶部 */\n    .topbar {\n      position: fixed;\n      top: 0; left: 0; right: 0;\n      height: 50px;\n      background: #2d2a26;\n      color: #fff;\n      display: flex; align-items: center;\n      padding: 0 20px;\n      z-index: 100;               /* 层叠顺序：越大越在上 */\n    }\n\n    .box {\n      width: 300px; height: 110px;\n      background: #eef4ff;\n      border: 2px solid #9db8e8;\n      border-radius: 10px;\n      margin: 16px 0;\n      padding: 10px;\n    }\n    /* relative：原位置仍占着，只是挪走一点 */\n    .rel {\n      position: relative;\n      top: 14px; left: 24px;\n      background: #fff3c4;\n      border-color: #d9b23c;\n    }\n\n    /* absolute：相对最近的定位祖先（这里是 .parent）*/\n    .parent { position: relative; }\n    .badge {\n      position: absolute;\n      top: -10px; right: -10px;\n      width: 28px; height: 28px;\n      border-radius: 50%;\n      background: #e5484d; color: #fff;\n      display: grid; place-items: center;\n      font-size: 13px;\n      box-shadow: 0 2px 8px rgba(0,0,0,.3);\n    }\n\n    .placeholder { height: 900px; }\n  </style>\n</head>\n<body>\n  <div class="topbar">我是 fixed 吸顶栏 · 往下滚动试试</div>\n\n  <h1>三种定位</h1>\n\n  <h2>relative：占着原位，稍微挪动</h2>\n  <div class="box rel">我向下右各挪了一点，\n    但原来的位置还给我留着（下面的盒子没跟上）。</div>\n  <div class="box">常规流盒子，位置不受上面影响。</div>\n\n  <h2>absolute：相对定位父级</h2>\n  <div class="box parent">\n    我是 position: relative 的父级，角标以我为参照。\n    <span class="badge">9</span>\n  </div>\n\n  <h2>往下滚，吸顶栏还在</h2>\n  <div class="placeholder"></div>\n</body>\n</html>'];

S.overflow = ['溢出处理', '03-CSS布局', ['overflow', 'ellipsis', 'scroll'], '内容超出盒子怎么办？藏起来、滚动、还是打省略号。',
['对比 hidden / scroll / auto 的差异', '用 overflow + ellipsis 做单行截断', '理解 auto 是"按需出现滚动条"'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>溢出处理</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n    .demo {\n      width: 260px; height: 100px;\n      border: 2px solid #b8552f;\n      border-radius: 8px;\n      margin: 10px 0 20px;\n      padding: 8px;\n      background: #faf5ec;\n    }\n    /* visible（默认）：内容直接画出界 */\n    .v { overflow: visible; }\n    /* hidden：超出部分直接裁掉 */\n    .h { overflow: hidden; }\n    /* scroll：永远显示滚动条 */\n    .s { overflow: scroll; }\n    /* auto：内容溢出才出现滚动条 */\n    .a { overflow: auto; }\n\n    /* 单行省略号四件套 */\n    .ellipsis {\n      width: 260px;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      background: #eee;\n      padding: 8px;\n      border-radius: 6px;\n    }\n  </style>\n</head>\n<body>\n  <h1>内容冒出来了</h1>\n  <p>四个盒子里装着同样长的一段话，只差 overflow：</p>\n\n  <div class="demo v"><b>visible</b>：谁也拦不住我，文字直接画出边框外面去，完全放飞自我。</div>\n  <div class="demo h"><b>hidden</b>：超出边框的部分全部裁掉，一刀切干净利落，代价是内容丢失。</div>\n  <div class="demo s"><b>scroll</b>：上下滚动条永远在场，就算内容没超也占着位置。</div>\n  <div class="demo a"><b>auto</b>：平时和 hidden 一样安分，内容溢出才召唤滚动条，最常用。</div>\n\n  <h2>单行截断省略号</h2>\n  <p class="ellipsis">这条新闻标题特别特别长，长到一行根本放不下，最后只好用省略号来收场</p>\n</body>\n</html>'];

S.flex = ['Flex 弹性布局', '03-CSS布局', ['主轴交叉轴', 'justify-content', 'flex:1'], '一维布局之王：一行或一列，交给 Flex。',
['给容器 display: flex 开启弹性世界', '用 justify-content / align-items 双向对齐', '用 flex: 1 让子项按比例分空间'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>Flex 弹性布局</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n    .box {\n      display: flex;          /* 一句话开启 Flex */\n      background: #f0ece3;\n      border: 2px dashed #b8a98a;\n      border-radius: 10px;\n      min-height: 90px;\n      padding: 10px;\n      gap: 10px;              /* 子项间距，Flex/Grid 通用 */\n      margin: 10px 0 22px;\n    }\n    .item {\n      background: #5b7cfa; color: #fff;\n      border-radius: 8px;\n      padding: 14px 0;\n      width: 72px;\n      text-align: center;\n    }\n\n    /* 主轴对齐（默认水平）*/\n    .j-between { justify-content: space-between; }\n    .j-center  { justify-content: center; }\n    .j-around  { justify-content: space-around; }\n\n    /* 交叉轴对齐（默认垂直）*/\n    .a-center { align-items: center; }\n    .a-end    { align-items: flex-end; }\n\n    /* 方向：column 把主轴转成垂直 */\n    .col { flex-direction: column; align-items: stretch; }\n\n    /* flex:1 按比例分配剩余空间 */\n    .grow1 { flex: 1; }\n    .grow2 { flex: 2; }\n    .tall { height: 64px; }\n  </style>\n</head>\n<body>\n  <h1>Flex 速览</h1>\n\n  <h2>justify-content 主轴分布</h2>\n  <div class="box j-between"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>\n  <div class="box j-center"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>\n  <div class="box j-around"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>\n\n  <h2>align-items 交叉轴对齐</h2>\n  <div class="box a-center"><div class="item tall">高块</div><div class="item">矮块居中</div></div>\n  <div class="box a-end"><div class="item tall">高块</div><div class="item">贴底</div></div>\n\n  <h2>flex-direction: column</h2>\n  <div class="box col"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>\n\n  <h2>flex:1 按比例分地盘</h2>\n  <div class="box">\n    <div class="item grow1">flex:1</div>\n    <div class="item grow2">flex:2</div>\n    <div class="item grow1">flex:1</div>\n  </div>\n</body>\n</html>'];

S.grid = ['Grid 网格布局', '03-CSS布局', ['template-columns', 'repeat', '跨行列'], '二维布局之王：行和列一起规划。',
['用 grid-template-columns 定义列轨道', '用 repeat() 和 fr 单位简化轨道', '用 span 让子项跨行跨列'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>Grid 网格布局</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n    .grid {\n      display: grid;\n      gap: 10px;\n      margin: 10px 0 26px;\n    }\n    .cell {\n      background: #47c98a;\n      border-radius: 8px;\n      color: #fff;\n      padding: 18px 8px;\n      text-align: center;\n    }\n\n    /* 三列等宽 */\n    .g1 { grid-template-columns: 1fr 1fr 1fr; }\n\n    /* repeat 简写 + fr 自动分配 */\n    .g2 { grid-template-columns: repeat(3, 1fr); }\n\n    /* 固定 + 弹性混合 */\n    .g3 { grid-template-columns: 200px 1fr 1fr; }\n\n    /* 跨列：span 2 */\n    .wide { grid-column: span 2; background: #5b7cfa; }\n    .tall { grid-row: span 2; background: #b8552f; }\n\n    /* 区域命名：像拼图一样画布局 */\n    .g5 {\n      grid-template-areas:\n        "head head"\n        "side main"\n        "foot foot";\n      grid-template-columns: 120px 1fr;\n    }\n    .hd { grid-area: head; }\n    .sd { grid-area: side; background: #8a6dd6; }\n    .mn { grid-area: main; background: #2e9e5b; }\n    .ft { grid-area: foot; background: #777; }\n  </style>\n</head>\n<body>\n  <h1>Grid 速览</h1>\n\n  <h2>三等分：1fr 1fr 1fr</h2>\n  <div class="grid g1"><div class="cell">1</div><div class="cell">2</div><div class="cell">3</div></div>\n\n  <h2>repeat(3, 1fr) 等价写法</h2>\n  <div class="grid g2"><div class="cell">1</div><div class="cell">2</div><div class="cell">3</div></div>\n\n  <h2>固定 + 弹性</h2>\n  <div class="grid g3"><div class="cell">200px</div><div class="cell">1fr</div><div class="cell">1fr</div></div>\n\n  <h2>跨行跨列</h2>\n  <div class="grid g2">\n    <div class="cell wide">跨 2 列</div>\n    <div class="cell">1</div>\n    <div class="cell tall">跨 2 行</div>\n    <div class="cell">2</div>\n    <div class="cell">3</div>\n  </div>\n\n  <h2>grid-template-areas 拼图</h2>\n  <div class="grid g5">\n    <div class="cell hd">head</div>\n    <div class="cell sd">side</div>\n    <div class="cell mn">main</div>\n    <div class="cell ft">foot</div>\n  </div>\n</body>\n</html>'];

S['radius-shadow'] = ['圆角与阴影', '04-CSS3进阶', ['border-radius', 'box-shadow'], '让盒子从"纸片"变"实体"。',
['用 border-radius 做圆角、胶囊和圆形', '理解 box-shadow 的 x y 模糊 颜色', '用多层阴影做立体卡片'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>圆角与阴影</title>\n  <style>\n    body {\n      font-family: sans-serif; padding: 26px;\n      background: #f2ede4;\n      display: flex; flex-wrap: wrap; gap: 22px;\n    }\n    .card {\n      width: 170px; height: 130px;\n      background: #fff;\n      display: grid; place-items: center;\n      color: #666;\n    }\n    /* 四个角统一圆角 */\n    .r1 { border-radius: 12px; }\n    /* 四个角分别指定：左上 右上 右下 左下 */\n    .r2 { border-radius: 24px 4px 24px 4px; }\n    /* 胶囊 */\n    .r3 { border-radius: 999px; }\n\n    /* 阴影：x偏移 y偏移 模糊 颜色 */\n    .s1 { box-shadow: 0 2px 8px rgba(0,0,0,.15); }\n    /* 扩散半径（第4个值）：阴影变大 */\n    .s2 { box-shadow: 0 2px 8px 6px rgba(0,0,0,.12); }\n    /* 内阴影 inset */\n    .s3 { box-shadow: inset 0 3px 10px rgba(0,0,0,.25); }\n    /* 多层阴影叠加：底部暗 + 顶部亮 = 立体感 */\n    .s4 {\n      box-shadow:\n        0 1px 2px rgba(0,0,0,.08),\n        0 8px 24px rgba(0,0,0,.16);\n    }\n    /* 悬停抬升 */\n    .hover-up { transition: box-shadow .25s, transform .25s; }\n    .hover-up:hover {\n      transform: translateY(-6px);\n      box-shadow:\n        0 2px 4px rgba(0,0,0,.08),\n        0 16px 32px rgba(0,0,0,.22);\n    }\n  </style>\n</head>\n<body>\n  <div class="card r1 s1">圆角 12px + 浅阴影</div>\n  <div class="card r2">不对称圆角</div>\n  <div class="card r3">胶囊 999px</div>\n  <div class="card s2">带扩散的阴影</div>\n  <div class="card s3">内阴影 inset</div>\n  <div class="card r1 s4 hover-up">多层阴影 · 悬停试试</div>\n</body>\n</html>'];

S.gradient = ['渐变背景', '04-CSS3进阶', ['linear-gradient', 'radial-gradient', '多层背景'], '不再需要切图，一条声明画出彩虹。',
['用 linear-gradient 画线性渐变', '用 radial-gradient 画径向渐变', '用渐变条纹技巧做装饰'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>背景与渐变</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; display: grid; gap: 14px; }\n    .demo {\n      height: 90px; border-radius: 10px;\n      display: flex; align-items: center;\n      padding: 0 18px; color: #fff;\n    }\n    /* 线性渐变：方向 + 色标 */\n    .g1 { background: linear-gradient(to right, #5b7cfa, #a78bfa); }\n    .g2 { background: linear-gradient(135deg, #b8552f 0%, #e8965a 60%, #ffd9a8 100%); }\n\n    /* 径向渐变：从圆心向外 */\n    .g3 { background: radial-gradient(circle at 30% 50%, #ffd9a8, #b8552f); }\n\n    /* 透明度渐变做遮罩感 */\n    .g4 { background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.6)), url("https://picsum.photos/800/200"); background-size: cover; }\n\n    /* 硬渐变 = 条纹 */\n    .g5 { background: linear-gradient(60deg, #47c98a 0 25%, #2e9e5b 0 50%, #47c98a 0 75%, #2e9e5b 0); background-size: 40px 40px; }\n  </style>\n</head>\n<body>\n  <div class="demo g1">to right 双色渐变</div>\n  <div class="demo g2">135deg + 三个色标</div>\n  <div class="demo g3">radial 圆心在 30% 50%</div>\n  <div class="demo g4">渐变叠图片：文字更清楚</div>\n  <div class="demo g5">硬色标 = 斜条纹</div>\n</body>\n</html>'];

S['text-fx'] = ['文本效果', '04-CSS3进阶', ['text-shadow', '字间距', '溢出截断'], '文字也能发光、描边、省略。',
['用 text-shadow 做发光和立体字', '调整 letter-spacing 优化排版密度', '多行截断 line-clamp'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>文本效果</title>\n  <style>\n    body { font-family: sans-serif; background: #1e2430; color: #dde; padding: 30px; }\n    .row { margin: 26px 0; }\n    .glow {\n      font-size: 34px; color: #fff;\n      text-shadow: 0 0 12px #4cc2ff, 0 0 30px #4cc2ff;\n    }\n    .emboss {\n      font-size: 34px; color: #8fa3bd;\n      /* 多重阴影错位叠加 = 立体压字 */\n      text-shadow: 1px 1px 0 #0b1220, 2px 2px 0 #0b1220, 3px 3px 6px rgba(0,0,0,.5);\n    }\n    .neon {\n      font-size: 30px; color: #ffe08a;\n      letter-spacing: 6px;\n      text-shadow: 0 0 4px #ffe08a, 0 0 12px #e0a33c;\n    }\n    .clamp3 {\n      display: -webkit-box;\n      -webkit-line-clamp: 3;      /* 最多 3 行 */\n      -webkit-box-orient: vertical;\n      overflow: hidden;\n      background: #2a3342; padding: 12px; border-radius: 8px;\n      line-height: 1.7;\n    }\n  </style>\n</head>\n<body>\n  <div class="row glow">发光文字 Glow</div>\n  <div class="row emboss">立体压字 Emboss</div>\n  <div class="row neon">NEON 霓虹</div>\n\n  <h3 style="color:#9db8e8">多行截断（3 行后省略号）</h3>\n  <p class="clamp3">这是一段用来测试多行截断的长文本。当文字超过三行时，\n    剩余内容会被裁掉，并在末尾显示省略号。这个效果需要 display:-webkit-box、\n    -webkit-line-clamp:3 和 overflow:hidden 三件套配合完成，\n    目前所有主流浏览器都支持这种写法，是文章卡片摘要的常用手法。\n    第四行开始就看不见了，就像这样，还有这样，以及这样。</p>\n</body>\n</html>'];

S.transform = ['2D/3D 转换', '04-CSS3进阶', ['translate', 'rotate/scale', 'perspective'], '移动、旋转、缩放、翻转——不占布局空间的变形术。',
['用 translate 位移、rotate 旋转、scale 缩放', '理解 transform 不影响布局（盒模型不变）', '用 perspective 开启 3D 视角'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>2D 与 3D 转换</title>\n  <style>\n    body { font-family: sans-serif; padding: 24px; }\n    .row { display: flex; gap: 40px; margin: 30px 0; align-items: center; }\n    .box {\n      width: 110px; height: 110px;\n      background: linear-gradient(135deg, #5b7cfa, #a78bfa);\n      border-radius: 12px;\n      color: #fff; display: grid; place-items: center;\n      flex: none;\n    }\n    .t1 { transform: translate(30px, -14px); }\n    .t2 { transform: rotate(24deg); }\n    .t3 { transform: scale(1.25); }\n    .t4 { transform: skewX(-12deg); }\n\n    /* 组合变换：从右往左执行 */\n    .t5 { transform: rotate(12deg) scale(1.15); }\n\n    /* 3D：父级设透视距离 */\n    .scene { perspective: 700px; }\n    .r3d { transform: rotateY(38deg) rotateX(10deg); }\n  </style>\n</head>\n<body>\n  <h1>transform 变形术</h1>\n\n  <div class="row">\n    <div class="box">原位</div>\n    <div class="box t1">translate</div>\n    <div class="box t2">rotate</div>\n  </div>\n  <div class="row">\n    <div class="box t3">scale</div>\n    <div class="box t4">skewX</div>\n    <div class="box t5">组合</div>\n  </div>\n\n  <h2>3D：perspective + rotateY</h2>\n  <div class="row scene">\n    <div class="box">无透视</div>\n    <div class="box r3d">rotateY(38deg)</div>\n  </div>\n  <p>注意：所有变形都<b>不影响布局</b>——周围盒子位置纹丝不动。</p>\n</body>\n</html>'];

S.transition = ['过渡', '04-CSS3进阶', ['transition', '缓动函数', 'hover交互'], '属性变化的"动画补间"，交互质感的分水岭。',
['给属性加 transition 让变化平滑', '对比不同缓动函数的手感', '用 transform + transition 做 hover 卡片'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>过渡</title>\n  <style>\n    body { font-family: sans-serif; padding: 24px; background: #f4f0e8; }\n\n    /* 无过渡 vs 有过渡 */\n    .ball {\n      width: 54px; height: 54px; border-radius: 50%;\n      background: #5b7cfa; margin: 14px 0;\n    }\n    .plain:hover { transform: translateX(120px); }\n    .smooth {\n      transition: transform .5s ease;   /* 属性 时长 缓动 */\n    }\n    .smooth:hover { transform: translateX(120px); }\n\n    /* 缓动函数对比：同时出发，手感不同 */\n    .e { display: flex; gap: 18px; margin: 8px 0; align-items: center; }\n    .e i {\n      width: 40px; height: 40px; border-radius: 8px;\n      background: #b8552f; color: #fff; font-style: normal;\n      display: grid; place-items: center; font-size: 11px;\n      flex: none;\n    }\n    .track { flex: 1; height: 2px; background: #ddd; }\n    .e:hover i { transform: translateX(calc(100% + 0px)); }\n    /* 简化演示：分组跑 */\n    .e:hover .i1 { transform: translateX(300px); }\n    .e .i1 { transition: transform .8s linear; }\n    .e .i2 { transition: transform .8s ease-in; }\n    .e .i3 { transition: transform .8s ease-out; }\n    .e .i4 { transition: transform .8s cubic-bezier(.34,1.56,.64,1); }\n    .e:hover .i2 { transform: translateX(300px); }\n    .e:hover .i3 { transform: translateX(300px); }\n    .e:hover .i4 { transform: translateX(300px); }\n    .e .i1, .e .i2, .e .i3, .e .i4 { transform: translateX(0); }\n\n    /* 实战：hover 卡片 */\n    .card {\n      width: 200px; padding: 20px;\n      background: #fff; border-radius: 12px;\n      box-shadow: 0 2px 10px rgba(0,0,0,.08);\n      transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;\n      cursor: pointer;\n    }\n    .card:hover {\n      transform: translateY(-8px) rotate(-1.5deg);\n      box-shadow: 0 18px 36px rgba(0,0,0,.16);\n    }\n  </style>\n</head>\n<body>\n  <h1>过渡 transition</h1>\n\n  <h2>鼠标悬停两个球</h2>\n  <div class="ball plain"></div>\n  <p>↑ 上面没过渡：瞬移</p>\n  <div class="ball smooth"></div>\n  <p>↓ 下面有过渡：滑过去</p>\n\n  <h2>悬停整行，四种缓动同时出发</h2>\n  <div class="e"><i class="i1">linear</i><i class="i2">ease-in</i><i class="i3">ease-out</i><i class="i4">spring</i><span class="track"></span></div>\n\n  <h2>实战卡片</h2>\n  <div class="card">\n    <b>悬停我</b>\n    <p style="color:#888;margin:6px 0 0">transform + box-shadow 一起过渡</p>\n  </div>\n</body>\n</html>'];

S.animation = ['动画', '04-CSS3进阶', ['@keyframes', 'animation', 'infinite'], '关键帧动画：让页面自己动起来。',
['用 @keyframes 定义关键帧', '用 animation 简写驱动（时长/次数/方向）', '做一个加载动画和呼吸效果'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>动画</title>\n  <style>\n    body { font-family: sans-serif; padding: 26px; }\n\n    /* 第一步：定义关键帧（from/to 或百分比）*/\n    @keyframes slide-in {\n      from { transform: translateX(-60px); opacity: 0; }\n      to   { transform: translateX(0); opacity: 1; }\n    }\n    /* 更细的控制用百分比 */\n    @keyframes bounce {\n      0%, 100% { transform: translateY(0); }\n      50%      { transform: translateY(-26px); }\n    }\n    @keyframes spin { to { transform: rotate(360deg); } }\n    @keyframes pulse {\n      0%, 100% { box-shadow: 0 0 0 0 rgba(76,194,255,.55); }\n      70%      { box-shadow: 0 0 0 18px rgba(76,194,255,0); }\n    }\n\n    /* 第二步：animation 简写挂到元素上 */\n    .slide {\n      animation: slide-in .7s ease-out both;\n      background: #eef4ff; padding: 12px 16px;\n      border-radius: 8px; margin: 12px 0;\n    }\n    .ball {\n      width: 52px; height: 52px; border-radius: 50%;\n      background: #b8552f;\n      animation: bounce 1.1s ease-in-out infinite;  /* 无限循环 */\n    }\n    /* 交替方向 */\n    .ball.alt { animation-direction: alternate; background: #5b7cfa; }\n\n    .spinner {\n      width: 44px; height: 44px;\n      border: 5px solid #e4e9f2;\n      border-top-color: #0e7fd4;\n      border-radius: 50%;\n      animation: spin .9s linear infinite;\n    }\n    .pulse-ring {\n      width: 20px; height: 20px; border-radius: 50%;\n      background: #4cc2ff;\n      animation: pulse 1.6s ease-out infinite;\n    }\n  </style>\n</head>\n<body>\n  <h1>CSS 动画</h1>\n\n  <div class="slide">进入动画：both = 结束后停最后一帧</div>\n\n  <h2>无限弹跳 / 交替弹跳</h2>\n  <div style="display:flex; gap:26px; align-items:flex-end; height:70px">\n    <div class="ball"></div>\n    <div class="ball alt"></div>\n  </div>\n\n  <h2>加载圈与脉冲点</h2>\n  <div style="display:flex; gap:34px; align-items:center">\n    <div class="spinner"></div>\n    <div class="pulse-ring"></div>\n  </div>\n</body>\n</html>'];

S.responsive = ['响应式设计', '04-CSS3进阶', ['viewport', 'media query', '移动优先'], '一套代码，手机平板桌面全适应。',
['写 viewport meta 声明宽度自适应', '用 @media 断点切换布局', '体验：拖宽浏览器或切换右上设备宽度'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <!-- 响应式第一步：viewport 声明 -->\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>响应式设计</title>\n  <style>\n    body { font-family: sans-serif; margin: 0; }\n    header {\n      background: #2d2a26; color: #fff;\n      padding: 16px 20px;\n    }\n    .grid {\n      display: grid;\n      gap: 14px;\n      padding: 16px;\n      grid-template-columns: 1fr;   /* 移动优先：手机 1 列 */\n    }\n    .cell {\n      background: #eef4ff; border-radius: 10px;\n      padding: 30px 12px; text-align: center;\n      font-weight: bold; color: #4a5b78;\n    }\n\n    /* 平板：≥600px 改 2 列 */\n    @media (min-width: 600px) {\n      .grid { grid-template-columns: repeat(2, 1fr); }\n      .cell:nth-child(1) { background: #fff3c4; color: #8a6d1a; }\n    }\n    /* 桌面：≥900px 改 4 列 */\n    @media (min-width: 900px) {\n      .grid { grid-template-columns: repeat(4, 1fr); }\n      .cell:nth-child(2) { background: #ffd9e0; color: #a04a5e; }\n    }\n\n    .hint {\n      padding: 10px 16px; font-size: 13px; color: #fff;\n      background: #0e7fd4; position: sticky; bottom: 0;\n    }\n  </style>\n</head>\n<body>\n  <header>\n    <h1 style="margin:0;font-size:20px">响应式网格</h1>\n  </header>\n\n  <div class="grid">\n    <div class="cell">卡片 1</div>\n    <div class="cell">卡片 2</div>\n    <div class="cell">卡片 3</div>\n    <div class="cell">卡片 4</div>\n  </div>\n\n  <div class="hint">↔ 拖动浏览器宽度，或在预览右上角切换设备宽度试试</div>\n</body>\n</html>'];

S.project = ['综合小项目：互动名片', '04-CSS3进阶', ['综合运用', 'JS 交互', '事件'], '把四章所学拼成一张会动的互动名片（含 JavaScript）。',
['复用渐变、圆角、阴影、过渡全部招式', '理解 script 标签里的 JS 如何改 DOM', '点按钮换主题色，输入框实时改名'],
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>互动名片</title>\n  <style>\n    body {\n      min-height: 100vh; margin: 0;\n      display: grid; place-items: center;\n      font-family: sans-serif;\n      background: linear-gradient(135deg, #1e2430, #2d3a54);\n      transition: background .6s;\n    }\n    body.alt {\n      background: linear-gradient(135deg, #3a1f2b, #b8552f);\n    }\n    .card {\n      width: min(340px, 88vw);\n      background: rgba(255,255,255,.09);\n      backdrop-filter: blur(12px);\n      border: 1px solid rgba(255,255,255,.18);\n      border-radius: 20px;\n      padding: 28px;\n      color: #fff;\n      box-shadow: 0 24px 48px rgba(0,0,0,.35);\n      transition: transform .35s cubic-bezier(.34,1.56,.64,1);\n    }\n    .card:hover { transform: translateY(-6px); }\n    .avatar {\n      width: 76px; height: 76px; border-radius: 50%;\n      background: linear-gradient(135deg, #4cc2ff, #a78bfa);\n      display: grid; place-items: center;\n      font-size: 30px; font-weight: 700;\n    }\n    h1 { margin: 14px 0 2px; font-size: 24px; }\n    .tags { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0 18px; }\n    .tag {\n      font-size: 12px; padding: 3px 10px;\n      border-radius: 99px;\n      background: rgba(255,255,255,.14);\n    }\n    input {\n      width: 100%; box-sizing: border-box;\n      padding: 10px 12px; border-radius: 10px;\n      border: 1px solid rgba(255,255,255,.25);\n      background: rgba(255,255,255,.1);\n      color: #fff; font-size: 14px;\n    }\n    input:focus { outline: 2px solid #4cc2ff; }\n    .ops { display: flex; gap: 10px; margin-top: 14px; }\n    button {\n      flex: 1; padding: 10px 0; border: 0;\n      border-radius: 10px; cursor: pointer;\n      font-size: 14px; font-weight: 600;\n      background: linear-gradient(135deg, #4cc2ff, #5b7cfa);\n      color: #fff;\n      transition: filter .2s, transform .2s;\n    }\n    button:hover { filter: brightness(1.15); transform: translateY(-1px); }\n    .counter { text-align: center; font-size: 12px; opacity: .75; margin-top: 12px; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <div class="avatar" id="avatar">前</div>\n    <h1 id="name">前端学习者</h1>\n    <div class="tags">\n      <span class="tag">HTML</span>\n      <span class="tag">CSS</span>\n      <span class="tag">JavaScript</span>\n    </div>\n\n    <input id="rename" type="text" placeholder="输入新名字，回车确认">\n\n    <div class="ops">\n      <button id="btn-theme">换主题色</button>\n      <button id="btn-like">点赞</button>\n    </div>\n    <div class="counter" id="counter">获得 0 个赞</div>\n  </div>\n\n  <script>\n    var likes = 0;\n\n    // 输入名字 → 同步标题和头像首字\n    var rename = document.getElementById("rename");\n    rename.addEventListener("input", function () {\n      var v = rename.value.trim() || "前端学习者";\n      document.getElementById("name").textContent = v;\n      document.getElementById("avatar").textContent = v.charAt(0);\n    });\n\n    // 换主题：切换 body 的 class\n    document.getElementById("btn-theme").addEventListener("click", function () {\n      document.body.classList.toggle("alt");\n    });\n\n    // 点赞计数\n    var counter = document.getElementById("counter");\n    document.getElementById("btn-like").addEventListener("click", function () {\n      likes++;\n      counter.textContent = "获得 " + likes + " 个赞";\n    });\n\n    console.log("名片已就绪，打开控制台看看我");\n  </script>\n</body>\n</html>'];

/* 组装示例数组 */
var SAMPLES = [
    { id: "hello", g: 0 }, { id: "attrs", g: 0 }, { id: "list-table", g: 0 },
    { id: "form", g: 0 }, { id: "semantic", g: 0 },
    { id: "first-css", g: 1 }, { id: "text", g: 1 }, { id: "bg-border", g: 1 },
    { id: "boxmodel", g: 1 }, { id: "display", g: 1 }, { id: "selector", g: 1 },
    { id: "flow", g: 2 }, { id: "float", g: 2 }, { id: "position", g: 2 },
    { id: "overflow", g: 2 }, { id: "flex", g: 2 }, { id: "grid", g: 2 },
    { id: "radius-shadow", g: 3 }, { id: "gradient", g: 3 }, { id: "text-fx", g: 3 },
    { id: "transform", g: 3 }, { id: "transition", g: 3 }, { id: "animation", g: 3 },
    { id: "responsive", g: 3 }, { id: "project", g: 3 }
].map(function (m) {
    var d = S[m.id];
    return { id: m.id, group: m.g, name: d[0], chapter: d[1], tags: d[2], desc: d[3], goals: d[4], html: d[5] };
});

var GROUPS = ["01-HTML基础", "02-CSS基础", "03-CSS布局", "04-CSS3进阶"];

/* 暴露到全局 */
window.IDE_DATA = {
    TAGS: TAGS, VOID: VOID,
    ATTRS_GLOBAL: ATTRS_GLOBAL, ATTRS_BY_TAG: ATTRS_BY_TAG, ATTR_VALS: ATTR_VALS, ENTITIES: ENTITIES,
    CSS_PROPS: CSS_PROPS, CSS_VALS: CSS_VALS, CSS_GENERIC_VALS: CSS_GENERIC_VALS,
    CSS_PSEUDO: CSS_PSEUDO, CSS_AT: CSS_AT,
    JS_KW: JS_KW, JS_SNIPS: JS_SNIPS, JS_MEMBERS: JS_MEMBERS, JS_GLOB: JS_GLOB,
    THEMES: THEMES, SAMPLES: SAMPLES, GROUPS: GROUPS
};
})();
