/*!
 * live-editor.js — 学习文档 · 交互式代码编辑器
 * ---------------------------------------------------------------------------
 * 离线可用，无任何外部依赖。功能：
 *   1. 自动升级：把文档中的「代码块 + 演示区」升级为可编辑、可实时预览的示例；
 *   2. 手动创建：LiveEditor.create(container, { html, css, js, title })；
 *   3. 在线练习场：LiveEditor.playground(root, { title, samples })。
 *
 * 引入方式（放到 </head> 前）：
 *   <link rel="stylesheet" href="../assets/live-editor.css">
 *   <script src="../assets/live-editor.js" defer></script>
 * ---------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ==================== 小工具 ==================== */

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function btn(label, cls, aria) {
    var b = el('button', cls, label);
    b.type = 'button';
    if (aria) b.setAttribute('aria-label', aria);
    return b;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function debounce(fn, ms) {
    var id = null;
    return function () {
      var self = this, args = arguments;
      clearTimeout(id);
      id = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function copyText(text, triggerBtn, done) {
    function fallback() {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }

  /* ==================== 语法高亮 ==================== */

  /* ---------- 检测代码模式 ---------- */
  function detectMode(code) {
    if (/<\s*(!doctype|html|head|body|div|p|span|h[1-6]|ul|ol|li|table|tr|td|th|form|input|img|a|button|section|article|nav|header|footer|aside|main|select|option|textarea|label|script|style|link|meta|title)\b/i.test(code)) {
      return 'html';
    }
    if (code.indexOf('{') !== -1 && /[.#]?[\w-]+\s*\{/.test(code)) return 'css';
    return 'plain';
  }

  /* ---------- HTML tokenizer ---------- */
  var TAG_RE = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w-]*)|(\/?>)|([a-zA-Z-]+)(?=\s*=)|("[^"]*"|'[^']*')|(=)/g;

  function tokenizeHTML(src) {
    var out = '';
    var i = 0;
    var n = src.length;
    while (i < n) {
      if (src.slice(i, i + 4) === '<!--') {
        var j = src.indexOf('-->', i + 4);
        var e1 = j === -1 ? n : j + 3;
        out += '<span class="tk-comment">' + esc(src.slice(i, e1)) + '</span>';
        i = e1;
      } else if (src.slice(i, i + 2) === '<!' || src.slice(i, i + 2) === '<?') {
        var j2 = src.indexOf('>', i);
        var e2 = j2 === -1 ? n : j2 + 1;
        out += '<span class="tk-doctype">' + esc(src.slice(i, e2)) + '</span>';
        i = e2;
      } else if (src[i] === '<') {
        var j3 = src.indexOf('>', i);
        var e3 = j3 === -1 ? n : j3 + 1;
        var raw = src.slice(i, e3);
        var last = 0;
        TAG_RE.lastIndex = 0;
        var m;
        var seg = '';
        while ((m = TAG_RE.exec(raw)) !== null) {
          if (m.index > last) seg += '<span class="tk-text">' + esc(raw.slice(last, m.index)) + '</span>';
          if (m[1]) seg += '<span class="tk-comment">' + esc(m[1]) + '</span>';
          else if (m[2]) seg += '<span class="tk-tag">' + esc(m[2]) + '</span>';
          else if (m[3]) seg += '<span class="tk-tag">' + esc(m[3]) + '</span>';
          else if (m[4]) seg += '<span class="tk-attr">' + esc(m[4]) + '</span>';
          else if (m[5]) seg += '<span class="tk-value">' + esc(m[5]) + '</span>';
          else if (m[6]) seg += '<span class="tk-punct">' + esc(m[6]) + '</span>';
          last = m.index + m[0].length;
        }
        if (last < raw.length) seg += '<span class="tk-text">' + esc(raw.slice(last)) + '</span>';
        out += seg;
        i = e3;
      } else {
        /* 文本节点 */
        var j4 = src.indexOf('<', i);
        var e4 = j4 === -1 ? n : j4;
        var txt = src.slice(i, e4);
        if (txt.trim()) out += '<span class="tk-text">' + esc(txt) + '</span>';
        else out += esc(txt);
        i = e4;
      }
    }
    return out;
  }

  /* ---------- CSS tokenizer（增强版：逐 token 扫描） ---------- */

  var CSS_KW = /^(none|auto|inherit|initial|unset|revert|transparent|currentColor|normal|bold|italic|oblique|underline|overline|line-through|uppercase|lowercase|capitalize|nowrap|pre|pre-wrap|pre-line|block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|table-row|table-cell|table-column|table-header-group|table-footer-group|relative|absolute|fixed|sticky|static|hidden|visible|scroll|clip|collapse|solid|dashed|dotted|double|groove|ridge|inset|outset|ease|ease-in|ease-out|ease-in-out|linear|forwards|backwards|both|infinite|alternate|alternate-reverse|running|paused|fill|stroke|contain|cover|content-box|border-box|padding-box|text|closest-side|closest-corner|farthest-side|farthest-corner|at|from|to|round|space|repeat|no-repeat|repeat-x|repeat-y|left|right|top|bottom|center|baseline|stretch|start|end|self-start|self-end|flex-start|flex-end|safe|unsafe|row|column|row-reverse|column-reverse|wrap|wrap-reverse|thin|medium|thick|pointer|cursor|help|move|not-allowed|grab|grabbing|zoom-in|zoom-out|crosshair|text|wait|progress|serif|sans-serif|monospace|cursive|fantasy|system-ui|small-caps|tabular-nums|proportional-nums|lining-nums|oldstyle-nums|ordinal|slashed-zero|diagonal-fractions|stacked-fractions|full-width|full-size-kana|common-ligatures|no-common-ligatures|discretionary-ligatures|no-discretionary-ligatures|historical-ligatures|no-historical-ligatures|contextual|no-contextual|all-small-caps|petite-caps|all-petite-caps|titling-caps|unicase|jis78|jis83|jis90|jis04|simplified|traditional|full-width|ruby|math|auto|fit-content|min-content|max-content)\b/i;

  function tokenizeCSS(src) {
    var tokens = [];
    var i = 0, n = src.length;

    while (i < n) {
      /* 注释 */
      if (src[i] === '/' && src[i + 1] === '*') {
        var j = src.indexOf('*/', i + 2);
        var e = j === -1 ? n : j + 2;
        tokens.push('<span class="tk-comment">' + esc(src.slice(i, e)) + '</span>');
        i = e;
        continue;
      }
      /* 字符串 */
      if (src[i] === '"' || src[i] === "'") {
        var q = src[i];
        var j2 = i + 1;
        while (j2 < n && src[j2] !== q) { if (src[j2] === '\\') j2++; j2++; }
        j2++;
        tokens.push('<span class="tk-string">' + esc(src.slice(i, j2)) + '</span>');
        i = j2;
        continue;
      }
      /* url(...) */
      if (src.slice(i, i + 4).toLowerCase() === 'url(') {
        var j3 = src.indexOf(')', i + 4);
        var e3 = j3 === -1 ? n : j3 + 1;
        tokens.push('<span class="tk-function">' + esc(src.slice(i, e3)) + '</span>');
        i = e3;
        continue;
      }
      /* 函数名( */
      var fnMatch = src.slice(i).match(/^([a-zA-Z][\w-]*)\(/);
      if (fnMatch && (fnMatch[1].match(/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient|calc|min|max|clamp|var|env|attr|counter|counters|image-set|cross-fade|circle|ellipse|polygon|inset|hsl|hsla|rgb|rgba|lab|lch|oklch|oklab|color|color-mix|translate|translateX|translateY|translateZ|rotate|rotateX|rotateY|rotateZ|scale|scaleX|scaleY|scaleZ|skew|skewX|skewY|matrix|matrix3d|perspective|cubic-bezier|steps|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|opacity|saturate|sepia|url|format|local|animate|scroll-timeline|view-timeline)/i))) {
        tokens.push('<span class="tk-function">' + esc(fnMatch[0]) + '</span>');
        i += fnMatch[0].length;
        continue;
      }
      /* !important */
      if (src[i] === '!' && src.slice(i, i + 10).toLowerCase() === '!important') {
        tokens.push('<span class="tk-important">' + esc('!important') + '</span>');
        i += 10;
        continue;
      }
      /* CSS 变量 --xxx */
      if (src[i] === '-' && src[i + 1] === '-') {
        var j4 = i + 2;
        while (j4 < n && /[\w-]/.test(src[j4])) j4++;
        tokens.push('<span class="tk-variable">' + esc(src.slice(i, j4)) + '</span>');
        i = j4;
        continue;
      }
      /* @规则 */
      if (src[i] === '@') {
        var j5 = i + 1;
        while (j5 < n && /[\w-]/.test(src[j5])) j5++;
        tokens.push('<span class="tk-keyword">' + esc(src.slice(i, j5)) + '</span>');
        i = j5;
        continue;
      }
      /* 选择器（行首或 { 后的 .#[]: 或字母开头，到 { 之前） */
      if ((i === 0 || src[i - 1] === '\n' || src[i - 1] === '}' || src[i - 1] === ',') && /[.#\[:a-zA-Z*]/.test(src[i])) {
        var j6 = src.indexOf('{', i);
        if (j6 !== -1 && j6 - i < 200) {
          var sel = src.slice(i, j6);
          tokens.push('<span class="tk-selector">' + esc(sel) + '</span>');
          i = j6;
          continue;
        }
      }
      /* 属性名： */
      var propMatch = src.slice(i).match(/^([a-zA-Z][\w-]*)(\s*:)/);
      if (propMatch && i > 0) {
        tokens.push('<span class="tk-property">' + esc(propMatch[1]) + '</span>');
        tokens.push('<span class="tk-punct">' + esc(':') + '</span>');
        i += propMatch[0].length;
        continue;
      }
      /* 数值（含单位） */
      var numMatch = src.slice(i).match(/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|fr|deg|rad|grad|turn|s|ms|dpi|dpcm|dppx|cm|mm|in|pt|pc|cap|ic|lh|rlh|vi|vb|svw|svh|lvw|lvh|dvw|dvh)?/);
      if (numMatch && numMatch[0]) {
        tokens.push('<span class="tk-number">' + esc(numMatch[1]) + '</span>');
        if (numMatch[2]) tokens.push('<span class="tk-unit">' + esc(numMatch[2]) + '</span>');
        i += numMatch[0].length;
        continue;
      }
      /* 关键字（属性值） */
      var kwMatch = src.slice(i).match(/^[a-zA-Z][\w-]*/);
      if (kwMatch && CSS_KW.test(kwMatch[0])) {
        tokens.push('<span class="tk-keyword">' + esc(kwMatch[0]) + '</span>');
        i += kwMatch[0].length;
        continue;
      }
      /* 标点 */
      if ('{}();,'.indexOf(src[i]) !== -1) {
        tokens.push('<span class="tk-punct">' + esc(src[i]) + '</span>');
        i++;
        continue;
      }
      /* 其他 */
      tokens.push(esc(src[i]));
      i++;
    }
    return tokens.join('');
  }

  /* ---------- JS tokenizer（简单版） ---------- */
  var JS_KW = /^(var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|in|of|try|catch|finally|throw|this|class|extends|super|import|export|default|from|as|yield|async|await|void|null|undefined|true|false|NaN|Infinity)\b/;

  function tokenizeJS(src) {
    var tokens = [];
    var i = 0, n = src.length;

    while (i < n) {
      /* 单行注释 */
      if (src[i] === '/' && src[i + 1] === '/') {
        var j = src.indexOf('\n', i + 2);
        var e = j === -1 ? n : j;
        tokens.push('<span class="tk-js-comment">' + esc(src.slice(i, e)) + '</span>');
        i = e;
        continue;
      }
      /* 多行注释 */
      if (src[i] === '/' && src[i + 1] === '*') {
        var j2 = src.indexOf('*/', i + 2);
        var e2 = j2 === -1 ? n : j2 + 2;
        tokens.push('<span class="tk-js-comment">' + esc(src.slice(i, e2)) + '</span>');
        i = e2;
        continue;
      }
      /* 字符串 */
      if (src[i] === '"' || src[i] === "'" || src[i] === '`') {
        var q = src[i];
        var j3 = i + 1;
        while (j3 < n && src[j3] !== q) { if (src[j3] === '\\') j3++; j3++; }
        j3++;
        tokens.push('<span class="tk-js-string">' + esc(src.slice(i, j3)) + '</span>');
        i = j3;
        continue;
      }
      /* 数字 */
      var numMatch = src.slice(i).match(/^-?\d*\.?\d+/);
      if (numMatch && numMatch[0]) {
        tokens.push('<span class="tk-js-number">' + esc(numMatch[0]) + '</span>');
        i += numMatch[0].length;
        continue;
      }
      /* 关键字 */
      var kwMatch = src.slice(i).match(JS_KW);
      if (kwMatch) {
        tokens.push('<span class="tk-js-keyword">' + esc(kwMatch[0]) + '</span>');
        i += kwMatch[0].length;
        continue;
      }
      /* 标识符/函数 */
      var idMatch = src.slice(i).match(/^[a-zA-Z_$][\w$]*/);
      if (idMatch) {
        var next = src[i + idMatch[0].length];
        if (next === '(') tokens.push('<span class="tk-js-function">' + esc(idMatch[0]) + '</span>');
        else tokens.push(esc(idMatch[0]));
        i += idMatch[0].length;
        continue;
      }
      /* 其他 */
      tokens.push(esc(src[i]));
      i++;
    }
    return tokens.join('');
  }

  function highlight(mode, code) {
    if (mode === 'html') return tokenizeHTML(code);
    if (mode === 'css') return tokenizeCSS(code);
    if (mode === 'js') return tokenizeJS(code);
    return esc(code);
  }

  /* ==================== 收集演示区相关样式 ==================== */

  function collectDemoCss(demoEls) {
    var out = [];
    var seen = {};
    var keyframes = {};
    var animNames = {};

    function stripPseudos(sel) {
      // 逐个摘掉所有伪类/伪元素（连同括号参数），得到「匹配探测用」的基础选择器。
      // 例：.sw input:checked + span::after  →  .sw input + span
      //     这样 :hover / :checked 等加载时不成立的状态规则也能被正确收进预览。
      var s = sel, prev;
      do {
        prev = s;
        s = s.replace(/::?[a-zA-Z-][\w-]*(\([^()]*\))?/g, '');
      } while (s !== prev);
      return s.replace(/\s+/g, ' ').trim();
    }

    function ruleApplies(sel) {
      var sels = String(sel).split(',');
      for (var s = 0; s < sels.length; s++) {
        var one = sels[s].trim();
        if (!one) continue;
        // 始终包含全局选择器（用于收集 CSS 变量和全局样式）
        // :root 和 html 通常定义 CSS 变量，body 和 * 定义全局重置样式
        if (one === ':root' || one === 'html' || one === 'body' || one === '*') return true;
        try {
          for (var i = 0; i < demoEls.length; i++) {
            var d = demoEls[i];
            if (d.matches(one) || d.querySelector(one)) return true;
          }
        } catch (err) { /* ignore */ }
        var probe = stripPseudos(one);
        if (probe !== one) {
          if (probe === '') return demoEls.length > 0; // 裸伪元素规则（如 ::selection）：作用面是全体
          try {
            for (var j = 0; j < demoEls.length; j++) {
              var dd = demoEls[j];
              if (dd.matches(probe) || dd.querySelector(probe)) return true;
            }
          } catch (err2) { /* ignore */ }
        }
      }
      return false;
    }

    var sheets = doc.styleSheets;
    for (var si = 0; si < sheets.length; si++) {
      var sheet = sheets[si];
      if (sheet.href) continue; // 只处理文档内联 <style>
      var rules = null;
      try { rules = sheet.cssRules; } catch (err) { continue; }
      if (!rules) continue;
      for (var ri = 0; ri < rules.length; ri++) {
        var r = rules[ri];
        if (!r) continue;
        if (r.type === CSSRule.STYLE_RULE) {
          if (ruleApplies(r.selectorText)) {
            if (!seen[r.cssText]) { seen[r.cssText] = 1; out.push(r.cssText); }
            var anim = (r.style.animationName || r.style.animation || '');
            var names = anim.match(/[a-zA-Z_][\w-]*/g);
            if (names) for (var ai = 0; ai < names.length; ai++) animNames[names[ai]] = 1;
          }
        } else if (r.type === CSSRule.KEYFRAMES_RULE) {
          keyframes[r.name] = r.cssText;
        } else if (r.type === CSSRule.MEDIA_RULE) {
          var inner = r.cssRules;
          var hit = false;
          if (inner) {
            for (var mi = 0; mi < inner.length; mi++) {
              if (inner[mi].type === CSSRule.STYLE_RULE && ruleApplies(inner[mi].selectorText)) { hit = true; break; }
            }
          }
          if (hit && !seen[r.cssText]) { seen[r.cssText] = 1; out.push(r.cssText); }
        }
      }
    }
    for (var name in keyframes) {
      if (animNames[name] && !seen[keyframes[name]]) {
        seen[keyframes[name]] = 1;
        out.push(keyframes[name]);
      }
    }
    return out.join('\n');
  }

  /* ==================== LiveEditor 核心 ==================== */

  function LiveEditor(container, opts) {
    this.container = container;
    this.opts = opts || {};
    this.title = this.opts.title || '试一试：修改代码，实时预览结果';
    this.tabs = [];
    this.ta = {};
    this.hl = {};
    this.codeEl = {};
    this.gutterEl = {};
    this.initial = {
      html: this.opts.html || '',
      css: this.opts.css || '',
      js: this.opts.js || ''
    };
    this.values = {
      html: this.initial.html,
      css: this.initial.css,
      js: this.initial.js
    };
    this.activeTab = 'html';
    this.fullscreen = false;
    this.runTimer = null;
    this.onRestore = this.opts.onRestore || null;
    this._consoleLogs = [];
    this._deviceMode = 'desktop';
    this._theme = 'light';
    this.build();
    /* 恢复用户上次选择的主题 */
    try {
      var saved = localStorage.getItem('le-theme');
      if (saved === 'dark') this.setTheme('dark');
    } catch (e) {}
    this.run(true);
  }

  LiveEditor.prototype.build = function () {
    var self = this;
    var root = el('div', 'le-editor');
    this.root = root;
    this.container.appendChild(root);

    // ---------- 工具栏 ----------
    var toolbar = el('div', 'le-toolbar');
    var titleWrap = el('span', 'le-title', this.title);
    var modDot = el('span', 'le-mod-dot');
    modDot.style.display = 'none';
    modDot.setAttribute('title', '代码已修改');
    titleWrap.appendChild(modDot);
    this._modDot = modDot;
    toolbar.appendChild(titleWrap);
    var hint = el('span', 'le-hint', '可直接修改代码 · 右侧实时预览');
    toolbar.appendChild(hint);

    var actions = el('div', 'le-actions');
    if (this.onRestore) {
      var restore = btn('静态版', 'le-btn le-btn-ghost le-btn-restore', '切换到静态示例');
      restore.addEventListener('click', function () { self.onRestore(); });
      actions.appendChild(restore);
    }
    var copyBtn = btn('复制', 'le-btn le-btn-ghost', '复制当前代码');
    copyBtn.addEventListener('click', function () { self.copyActive(); });
    var resetBtn = btn('重置', 'le-btn le-btn-ghost', '恢复初始代码');
    resetBtn.addEventListener('click', function () { self.reset(); });

    // 面板布局切换：代码展开 / 左右分栏 / 预览展开
    var layoutGroup = el('div', 'le-layout-group');
    var layouts = [
      { id: 'code', label: '◧', title: '展开代码区（压缩预览）' },
      { id: 'split', label: '◫', title: '代码与预览左右分栏' },
      { id: 'preview', label: '◨', title: '展开预览区（压缩代码）' }
    ];
    layouts.forEach(function (L) {
      var b = btn(L.label, 'le-layout-btn', L.title);
      b.dataset.layout = L.id;
      if (L.id === 'split') b.classList.add('active');
      b.addEventListener('click', function () { self.setLayout(L.id); });
      layoutGroup.appendChild(b);
    });

    var fsBtn = btn('全屏', 'le-btn le-btn-ghost', '全屏编辑');
    fsBtn.addEventListener('click', function () { self.toggleFullscreen(); });
    var themeBtn = btn('🌙', 'le-theme-btn', '切换深色/浅色主题');
    themeBtn.addEventListener('click', function () { self.toggleTheme(); });
    this._themeBtn = themeBtn;
    var runBtn = btn('运行', 'le-btn le-btn-primary', '运行代码');
    runBtn.addEventListener('click', function () { self.run(false); });
    actions.appendChild(copyBtn);
    actions.appendChild(resetBtn);
    actions.appendChild(layoutGroup);
    actions.appendChild(fsBtn);
    actions.appendChild(themeBtn);
    actions.appendChild(runBtn);
    toolbar.appendChild(actions);
    root.appendChild(toolbar);

    // ---------- 主体 ----------
    var body = el('div', 'le-body');
    root.appendChild(body);

    var codePane = el('div', 'le-pane le-pane-code');
    var tabs = el('div', 'le-tabs');
    codePane.appendChild(tabs);

    var names = ['html', 'css'];
    if (this.values.js || this.opts.showJs) names.push('js');
    var firstTab = null;

    for (var i = 0; i < names.length; i++) {
      (function (name) {
        var label = name === 'html' ? 'HTML' : name === 'css' ? 'CSS' : 'JS';
        var tabBtn = btn(label, 'le-tab', '编辑 ' + label);
        var wrap = el('div', 'le-code');

        // 行号区域
        var gutter = el('div', 'le-gutter');
        gutter.setAttribute('aria-hidden', 'true');
        wrap.appendChild(gutter);
        self.gutterEl[name] = gutter;

        wrap.style.display = 'none';

        var ta = el('textarea', 'le-input');
        ta.value = self.values[name];
        ta.setAttribute('wrap', 'off');
        ta.setAttribute('aria-label', label + ' 代码');
        ta.spellcheck = false;

        var hl = el('pre', 'le-hl');
        hl.setAttribute('aria-hidden', 'true');
        var code = el('code');
        hl.appendChild(code);

        wrap.appendChild(ta);
        wrap.appendChild(hl);
        codePane.appendChild(wrap);

        var entry = { name: name, btn: tabBtn, wrap: wrap };
        self.tabs.push(entry);
        self.ta[name] = ta;
        self.hl[name] = hl;
        self.codeEl[name] = code;

        tabBtn.addEventListener('click', function (e) {
          self.setActive(entry.name);
        });

        ta.addEventListener('input', function (e) {
          self.values[entry.name] = ta.value;
          self.syncHighlight(entry.name);
          self.updateGutter(entry.name);
          self.updateModified();
          self.status.textContent = '编辑中…';
          self.status.className = 'le-status is-running';
          if (self.opts.autoRun !== false) {
            clearTimeout(self.runTimer);
            self.runTimer = setTimeout(function () { self.run(false); }, 300);
          }
        });

        ta.addEventListener('scroll', function () {
          self.syncScroll(entry.name);
          self.syncGutterScroll(entry.name);
        });

        ta.addEventListener('keydown', function (e) {
          // Ctrl/Cmd + Enter 运行
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            self.run(false);
            return;
          }
          // Tab 缩进
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            self._insertAtCursor(ta, '  ');
            return;
          }
          // Shift+Tab 反缩进
          if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            self._dedentLine(ta);
            return;
          }
          // 自动补全括号/引号
          self._handleAutoClose(ta, e);
        });

        if (!firstTab) firstTab = entry;
      })(names[i]);
    }

    tabs.appendChild(this.tabs[0].btn);
    if (this.tabs.length > 1) tabs.appendChild(this.tabs[1].btn);
    if (this.tabs.length > 2) tabs.appendChild(this.tabs[2].btn);

    // 代码面板头部：展开代码按钮（另一侧预览随之压缩）
    tabs.appendChild(el('span', 'le-tabs-spacer'));
    var codeExpand = btn('◧ 展开代码', 'le-btn le-btn-ghost le-pane-expand', '展开代码区，压缩预览区');
    codeExpand.addEventListener('click', function () {
      self.setLayout(self._layout === 'code' ? 'split' : 'code');
    });
    tabs.appendChild(codeExpand);
    this._codeExpandBtn = codeExpand;

    this.setActive(firstTab.name, true);

    body.appendChild(codePane);

    // ---------- 预览区 ----------
    var previewPane = el('div', 'le-pane le-pane-preview');
    var ph = el('div', 'le-preview-head');
    ph.appendChild(el('span', 'le-preview-label', '预览结果'));

    // 设备切换器
    var deviceGroup = el('div', 'le-device-group');
    var devices = [
      { id: 'desktop', label: '💻', title: '桌面端' },
      { id: 'tablet', label: '📱', title: '平板 (768px)' },
      { id: 'mobile', label: '📲', title: '手机 (375px)' }
    ];
    devices.forEach(function (d) {
      var b = btn(d.label, 'le-device-btn', d.title);
      b.dataset.device = d.id;
      if (d.id === 'desktop') b.classList.add('active');
      b.addEventListener('click', function () {
        self.setDevice(d.id);
        deviceGroup.querySelectorAll('.le-device-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
      deviceGroup.appendChild(b);
    });
    ph.appendChild(deviceGroup);

    var status = el('span', 'le-status', '已就绪');
    status.setAttribute('aria-live', 'polite');
    this.status = status;
    ph.appendChild(status);

    // 预览面板头部：展开预览按钮（另一侧代码随之压缩）
    var pvExpand = btn('◨ 展开预览', 'le-btn le-btn-ghost le-pane-expand', '展开预览区，压缩代码区');
    pvExpand.addEventListener('click', function () {
      self.setLayout(self._layout === 'preview' ? 'split' : 'preview');
    });
    ph.insertBefore(pvExpand, status);
    this._pvExpandBtn = pvExpand;
    previewPane.appendChild(ph);

    var preview = el('div', 'le-preview');
    var iframe = el('iframe');
    iframe.setAttribute('title', '预览结果');
    this.iframe = iframe;
    preview.appendChild(iframe);
    previewPane.appendChild(preview);

    // JS 控制台面板
    var consolePane = el('div', 'le-console');
    consolePane.style.display = 'none';
    var consoleHead = el('div', 'le-console-head');
    consoleHead.appendChild(el('span', 'le-console-title', '🖥️ 控制台'));
    var consoleToggle = btn('展开', 'le-btn le-btn-ghost le-console-toggle', '展开/收起控制台');
    var consoleExpanded = true;
    consoleToggle.addEventListener('click', function () {
      consoleExpanded = !consoleExpanded;
      consoleBody.style.display = consoleExpanded ? '' : 'none';
      consoleToggle.textContent = consoleExpanded ? '收起' : '展开';
    });
    consoleHead.appendChild(consoleToggle);
    var consoleClear = btn('清空', 'le-btn le-btn-ghost', '清空控制台');
    consoleClear.addEventListener('click', function () { self.clearConsole(); });
    consoleHead.appendChild(consoleClear);
    var consoleShowBtn = btn('控制台', 'le-btn le-btn-ghost le-console-show-btn', '显示/隐藏控制台');
    consoleShowBtn.addEventListener('click', function () {
      var visible = consolePane.style.display !== 'none';
      consolePane.style.display = visible ? 'none' : '';
      consoleShowBtn.classList.toggle('active', !visible);
    });
    ph.insertBefore(consoleShowBtn, status);

    consolePane.appendChild(consoleHead);
    var consoleBody = el('div', 'le-console-body');
    this._consoleBody = consoleBody;
    this._consolePane = consolePane;
    consolePane.appendChild(consoleBody);
    previewPane.appendChild(consolePane);

    body.appendChild(previewPane);

    if (this.tabs.length > 1) {
      // 键盘左右键切换标签
      this.tabs.forEach(function (entry) {
        entry.btn.addEventListener('keydown', function (e) {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          var idx = self.tabs.indexOf(entry);
          var next = (idx + (e.key === 'ArrowRight' ? 1 : self.tabs.length - 1)) % self.tabs.length;
          self.setActive(self.tabs[next].name);
          self.tabs[next].btn.focus();
        });
      });
    }
  };

  LiveEditor.prototype.setActive = function (name, silent) {
    var self = this;
    this.activeTab = name;
    this.tabs.forEach(function (entry) {
      var active = entry.name === name;
      entry.btn.classList.toggle('active', active);
      if (active) entry.btn.setAttribute('aria-selected', 'true');
      else entry.btn.removeAttribute('aria-selected');
      entry.wrap.style.display = active ? '' : 'none';
    });
    this.syncHighlight(name);
    this.updateGutter(name);
    if (!silent) {
      requestAnimationFrame(function () {
        var ta = self.ta[name];
        if (ta && document.activeElement !== ta) ta.focus();
      });
    }
  };

  LiveEditor.prototype.syncHighlight = function (name) {
    var mode = name === 'css' ? 'css' : (name === 'js' ? 'js' : detectMode(this.values[name]));
    this.codeEl[name].innerHTML = highlight(mode, this.values[name]);
    this.syncScroll(name);
  };

  LiveEditor.prototype.syncScroll = function (name) {
    var ta = this.ta[name], hl = this.hl[name];
    if (!ta || !hl) return;
    hl.scrollTop = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
  };

  LiveEditor.prototype.run = function (silent) {
    var self = this;
    var html = this.values.html;
    var css = this.values.css;
    var js = this.values.js;
    var docStr;
    var isFull = /^\s*(<!doctype|<html)/i.test(html.trim());

    // 控制台捕获脚本
    var consoleScript = '(function(){' +
      'var _leC=window.parent.__leConsole;' +
      'if(!_leC)return;' +
      'var _o={log:console.log,warn:console.warn,error:console.error};' +
      'console.log=function(){_o.log.apply(console,arguments);try{_leC("log",Array.prototype.slice.call(arguments).map(String))}catch(e){}};' +
      'console.warn=function(){_o.warn.apply(console,arguments);try{_leC("warn",Array.prototype.slice.call(arguments).map(String))}catch(e){}};' +
      'console.error=function(){_o.error.apply(console,arguments);try{_leC("error",Array.prototype.slice.call(arguments).map(String))}catch(e){}};' +
      'window.onerror=function(m,s,l){_leC("error",["JS 错误: "+m+(l?" (第 "+l+" 行)":"")]);return false;};' +
      '})();';

    // 注册全局控制台回调
    window.__leConsole = function (type, args) {
      self._appendConsoleLog(type, args);
    };

    if (isFull) {
      docStr = html;
    } else {
      docStr = '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n';
      if (css) docStr += '<style>\n' + css + '\n</style>\n';
      docStr += '</head>\n<body>\n' + html + '\n';
      docStr += '<script>\n' + consoleScript + '\n</script>\n';
      if (js) {
        docStr += '<script>\n' +
          js.replace(/<\/script/gi, '<\\/script') + '\n</script>\n';
      }
      docStr += '</body>\n</html>';
    }
    try {
      this.iframe.srcdoc = docStr;
      if (!silent) {
        this.status.textContent = '已更新 ✓';
        this.status.className = 'le-status le-status-ok';
        clearTimeout(this._statusTimer);
        this._statusTimer = setTimeout(function () {
          self.status.textContent = '已就绪';
          self.status.className = 'le-status';
        }, 2000);
      }
    } catch (e) {
      this.status.textContent = '运行失败';
      this.status.className = 'le-status le-status-err';
    }
  };

  LiveEditor.prototype.updateModified = function () {
    var modified = (
      this.values.html !== this.initial.html ||
      this.values.css !== this.initial.css ||
      this.values.js !== this.initial.js
    );
    this.root.classList.toggle('le-modified', modified);
    if (this._modDot) this._modDot.style.display = modified ? '' : 'none';
  };

  LiveEditor.prototype.reset = function () {
    var self = this;
    this.tabs.forEach(function (entry) {
      var n = entry.name;
      self.values[n] = self.initial[n];
      self.ta[n].value = self.initial[n];
      self.syncHighlight(n);
      self.updateGutter(n);
    });
    this.updateModified();
    this.clearConsole();
    this.run(false);
  };

  LiveEditor.prototype.copyActive = function () {
    var self = this;
    var text = this.values[this.activeTab];
    copyText(text, null, function (ok) {
      if (ok) {
        self.status.textContent = '已复制 ✓';
        self.status.className = 'le-status le-status-ok';
        setTimeout(function () { self.status.textContent = '已就绪'; self.status.className = 'le-status'; }, 1200);
      } else {
        self.status.textContent = '复制失败';
        self.status.className = 'le-status le-status-err';
      }
    });
  };

  /* ---------- 面板布局切换：code 展开 / split 分栏 / preview 展开 ---------- */

  LiveEditor.prototype.setLayout = function (mode) {
    if (mode !== 'code' && mode !== 'preview') mode = 'split';
    this._layout = mode;
    this.root.classList.toggle('le-layout-code', mode === 'code');
    this.root.classList.toggle('le-layout-preview', mode === 'preview');

    if (this._codeExpandBtn) {
      this._codeExpandBtn.textContent = mode === 'code' ? '◫ 恢复分栏' : '◧ 展开代码';
    }
    if (this._pvExpandBtn) {
      this._pvExpandBtn.textContent = mode === 'preview' ? '◫ 恢复分栏' : '◨ 展开预览';
    }
    var segBtns = this.root.querySelectorAll('.le-layout-btn');
    for (var i = 0; i < segBtns.length; i++) {
      segBtns[i].classList.toggle('active', segBtns[i].dataset.layout === mode);
    }
    this._layout = mode;
    return mode;
  };

  LiveEditor.prototype.toggleFullscreen = function () {
    this.fullscreen = !this.fullscreen;
    this.root.classList.toggle('le-fullscreen', this.fullscreen);
    var fsBtn = this.root.querySelector('.le-btn[aria-label="全屏编辑"]');
    if (fsBtn) fsBtn.textContent = this.fullscreen ? '退出全屏' : '全屏';
    var self = this;
    requestAnimationFrame(function () {
      self.run(true);
    });
  };

  LiveEditor.prototype.setTheme = function (theme) {
    this._theme = theme;
    this.root.setAttribute('data-theme', theme);
    if (this._themeBtn) this._themeBtn.textContent = theme === 'dark' ? '🌞' : '🌙';
    try { localStorage.setItem('le-theme', theme); } catch (e) {}
    
    // 同步全局主题
    if (typeof setTheme === 'function') {
      setTheme(theme);
    }
  };

  LiveEditor.prototype.toggleTheme = function () {
    this.setTheme(this._theme === 'dark' ? 'light' : 'dark');
  };

  /* ---------- 行号 ---------- */

  LiveEditor.prototype.updateGutter = function (name) {
    var gutter = this.gutterEl[name];
    if (!gutter) return;
    var lines = (this.values[name] || '').split('\n');
    var html = '';
    for (var i = 1; i <= lines.length; i++) {
      html += '<div class="le-gutter-line">' + i + '</div>';
    }
    gutter.innerHTML = html;
  };

  LiveEditor.prototype.syncGutterScroll = function (name) {
    var gutter = this.gutterEl[name];
    var ta = this.ta[name];
    if (gutter && ta) gutter.scrollTop = ta.scrollTop;
  };

  /* ---------- 设备切换 ---------- */

  LiveEditor.prototype.setDevice = function (mode) {
    this._deviceMode = mode;
    var iframe = this.iframe;
    var preview = iframe.parentElement;
    if (mode === 'desktop') {
      iframe.style.width = '100%';
      iframe.style.maxWidth = '';
      preview.style.display = 'flex';
      preview.style.justifyContent = '';
    } else if (mode === 'tablet') {
      iframe.style.width = '768px';
      iframe.style.maxWidth = '100%';
      preview.style.display = 'flex';
      preview.style.justifyContent = 'center';
    } else if (mode === 'mobile') {
      iframe.style.width = '375px';
      iframe.style.maxWidth = '100%';
      preview.style.display = 'flex';
      preview.style.justifyContent = 'center';
    }
    this.run(true);
  };

  /* ---------- 控制台 ---------- */

  LiveEditor.prototype._appendConsoleLog = function (type, args) {
    var body = this._consoleBody;
    if (!body) return;
    var line = el('div', 'le-console-line le-console-' + type);
    var icon = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '▶';
    line.textContent = icon + ' ' + args.join(' ');
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
    this._consolePane.style.display = '';
  };

  LiveEditor.prototype.clearConsole = function () {
    if (this._consoleBody) this._consoleBody.innerHTML = '';
  };

  /* ---------- Tab 缩进 & 自动补全 ---------- */

  LiveEditor.prototype._insertAtCursor = function (ta, text) {
    var start = ta.selectionStart;
    var end = ta.selectionEnd;
    var val = ta.value;
    ta.value = val.slice(0, start) + text + val.slice(end);
    ta.selectionStart = ta.selectionEnd = start + text.length;
    ta.dispatchEvent(new Event('input'));
  };

  LiveEditor.prototype._dedentLine = function (ta) {
    var start = ta.selectionStart;
    var val = ta.value;
    var lineStart = val.lastIndexOf('\n', start - 1) + 1;
    if (val.slice(lineStart, lineStart + 2) === '  ') {
      ta.value = val.slice(0, lineStart) + val.slice(lineStart + 2);
      ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - 2);
      ta.dispatchEvent(new Event('input'));
    }
  };

  LiveEditor.prototype._handleAutoClose = function (ta, e) {
    var pairs = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'", '`': '`' };
    var open = e.key;
    if (!pairs[open]) return;
    // HTML 模式下不自动补全引号（避免干扰属性输入）
    if ((open === '"' || open === "'") && this.activeTab === 'html') return;
    e.preventDefault();
    var start = ta.selectionStart;
    var end = ta.selectionEnd;
    var val = ta.value;
    // 如果有选中文本，包围选区
    if (start !== end) {
      var selected = val.slice(start, end);
      ta.value = val.slice(0, start) + open + selected + pairs[open] + val.slice(end);
      ta.selectionStart = start + 1;
      ta.selectionEnd = end + 1;
    } else {
      ta.value = val.slice(0, start) + open + pairs[open] + val.slice(end);
      ta.selectionStart = ta.selectionEnd = start + 1;
    }
    ta.dispatchEvent(new Event('input'));
  };

  /* ==================== 自动升级：把代码块 + 演示区变成可编辑示例 ==================== */

  function deriveTitle(demoEls, codeNode) {
    for (var i = 0; i < demoEls.length; i++) {
      var t = demoEls[i].querySelector('.demo-title, .demo-label');
      if (t && t.textContent.trim()) {
        return t.textContent.trim().replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\s]+/u, '');
      }
    }
    var n = codeNode;
    while (n) {
      n = n.previousElementSibling;
      if (!n) break;
      if (/^H[1-4]$/.test(n.tagName)) return n.textContent.trim();
      if (n.classList && n.classList.contains('section-card')) break;
    }
    return '试一试：修改代码，实时预览结果';
  }

  function pairItems(items) {
    var pairs = [];
    var lastCode = null;
    var pending = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.isCode) {
        if (pending.length) {
          pairs.push({ code: it.node, demos: [pending.pop().node] });
        }
        lastCode = it.node;
      } else {
        if (lastCode) {
          var p = null;
          for (var j = 0; j < pairs.length; j++) {
            if (pairs[j].code === lastCode) { p = pairs[j]; break; }
          }
          if (!p) { p = { code: lastCode, demos: [] }; pairs.push(p); }
          p.demos.push(it.node);
        } else {
          pending.push(it);
        }
      }
    }
    return pairs;
  }

  function transformPair(pair) {
    var codeNode = pair.code;
    var demoEls = pair.demos;
    var codeText = (codeNode.textContent || '').replace(/^\n+/, '').replace(/\s+$/, '');
    if (!codeText) return;
    var mode = detectMode(codeText);
    var isFull = /^\s*(<!doctype|<html)/i.test(codeText);
    var demoCss = demoEls.length ? collectDemoCss(demoEls) : '';
    var htmlSrc = '', cssSrc = '', jsSrc = '';

    if (mode === 'html') {
      htmlSrc = codeText;
      cssSrc = demoCss;
    } else if (mode === 'css') {
      htmlSrc = demoEls.map(function (d) {
        var source = d.querySelector('.demo-body') || d;
        var clone = source.cloneNode(true);
        var inner = clone.querySelectorAll('pre, .code-block');
        for (var q = inner.length - 1; q >= 0; q--) inner[q].parentNode.removeChild(inner[q]);
        return clone.innerHTML;
      }).join('\n');
      cssSrc = (demoCss ? demoCss + '\n\n' : '') + '/* ═══ 本节示例代码（可修改）═══ */\n' + codeText;
    } else {
      htmlSrc = demoEls.length ? demoEls.map(function (d) { return d.innerHTML; }).join('\n') : codeText;
      cssSrc = demoCss;
    }

    var title = deriveTitle(demoEls, codeNode);

    // 包住原始节点（隐藏，供「恢复静态版」使用）
    var parent = codeNode.parentNode;
    var origWrap = el('div', 'le-original');
    parent.insertBefore(origWrap, codeNode);
    for (var k = 0; k < demoEls.length; k++) origWrap.appendChild(demoEls[k]);
    origWrap.appendChild(codeNode);

    var holder = el('div');
    parent.insertBefore(holder, origWrap.nextSibling);

    new LiveEditor(holder, {
      html: htmlSrc,
      css: cssSrc,
      js: jsSrc,
      title: title,
      onRestore: function () {
        holder.style.display = 'none';
        origWrap.classList.add('le-original--shown');
      }
    });

    // 添加返回编辑按钮
    var backBtn = el('button', 'le-back-btn', '✏️ 返回交互编辑');
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', '返回交互式代码编辑器');
    backBtn.addEventListener('click', function () {
      holder.style.display = '';
      origWrap.classList.remove('le-original--shown');
    });
    origWrap.appendChild(backBtn);
  }

  function addCopyToUnpaired(scope, pairedSet) {
    var nodes = scope.querySelectorAll('.code-block, pre');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (pairedSet.has(node)) continue;
      if (node.closest('.le-original, .le-editor')) continue;
      if (node.closest('section') !== scope) continue;
      if (node.querySelector('.le-copy-btn')) continue;
      makeCopyable(node);
    }
  }

  function makeCopyable(node) {
    var src = (node.textContent || '').replace(/^\n+/, '').replace(/\s+$/, '');
    node.style.position = 'relative';
    var btn = el('button', 'le-copy-btn', '复制代码');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      copyText(src, btn, function (ok) {
        btn.textContent = ok ? '已复制 ✓' : '复制失败';
        if (ok) {
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = '复制代码'; btn.classList.remove('copied'); }, 1200);
        }
      });
    });
    node.appendChild(btn);
  }

  function upgradeAll() {
    var scopes = Array.prototype.slice.call(doc.querySelectorAll('section')).filter(function (s) {
      return !s.closest('pre, .code-block, .demo, .demo-area, .le-editor, .le-original');
    });
    if (!scopes.length) scopes = [doc.body];

    var globalPaired = new Set();
    for (var s = 0; s < scopes.length; s++) {
      var scope = scopes[s];
      var items = [];
      var nodes = scope.querySelectorAll('.code-block, pre, .demo, .demo-area');
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.closest('.le-editor, .le-original')) continue;
        if (node.closest('section') !== scope) continue;
        var isCode = node.matches('.code-block, pre');
        if (isCode) {
          if (node.closest('.demo, .demo-area')) continue; // 代码嵌在演示区内部：由演示区整体处理
        } else {
          var anc = node.parentElement ? node.parentElement.closest('.demo, .demo-area') : null;
          if (anc) continue; // 演示区嵌套演示区：只处理外层
        }
        items.push({ node: node, isCode: isCode });
      }
      var pairs = pairItems(items);
      for (var p = 0; p < pairs.length; p++) {
        transformPair(pairs[p]);
        globalPaired.add(pairs[p].code);
        for (var d = 0; d < pairs[p].demos.length; d++) globalPaired.add(pairs[p].demos[d]);
      }
      addCopyToUnpaired(scope, globalPaired);
    }
  }

  /* ==================== 在线练习场 ==================== */

  function mountPlayground(root, opts) {
    opts = opts || {};
    var samples = opts.samples || [];
    var initial = opts.initial || (samples[0] || { html: '', css: '', js: '', title: '示例' });

    var self = {
      values: { html: initial.html || '', css: initial.css || '', js: initial.js || '' },
      initial: { html: initial.html || '', css: initial.css || '', js: initial.js || '' },
      tabs: [],
      ta: {}, hl: {}, codeEl: {}, activeTab: 'html'
    };

    // 头部
    var head = el('div', 'pg-head');
    var titleWrap = el('div', 'pg-title');
    var titleIcon = el('span', 'pg-title-icon', '◉');
    titleWrap.appendChild(titleIcon);
    titleWrap.appendChild(el('span', null, opts.title || '在线练习场'));
    head.appendChild(titleWrap);

    var select = el('select', 'pg-select');
    select.setAttribute('aria-label', '载入示例');
    for (var i = 0; i < samples.length; i++) {
      var opt = el('option', null, samples[i].title || ('示例 ' + (i + 1)));
      opt.value = String(i);
      select.appendChild(opt);
    }
    var runBtn = btn('运行', 'pg-btn pg-btn-primary', '运行代码');
    var resetBtn = btn('重置', 'pg-btn', '恢复初始代码');
    var copyBtn = btn('复制', 'pg-btn', '复制当前代码');
    var fullBtn = btn('全屏', 'pg-btn', '全屏');
    var actions = el('div', 'pg-actions');
    actions.appendChild(select);
    actions.appendChild(copyBtn);
    actions.appendChild(resetBtn);
    actions.appendChild(fullBtn);
    actions.appendChild(runBtn);
    head.appendChild(actions);
    root.appendChild(head);

    if (opts.tip) {
      var tip = el('div', 'pg-tip');
      tip.innerHTML = opts.tip;
      root.appendChild(tip);
    }

    // 主体
    var main = el('div', 'pg-main');
    root.appendChild(main);

    var editorPane = el('div', 'pg-editor');
    var tabs = el('div', 'pg-tabs');
    editorPane.appendChild(tabs);
    var names = ['html', 'css', 'js'];
    for (var n = 0; n < names.length; n++) {
      (function (name) {
        var label = name === 'html' ? 'HTML' : name === 'css' ? 'CSS' : 'JS';
        var tabBtn = btn(label, 'pg-tab', '编辑 ' + label);
        var wrap = el('div', 'pg-code');
        wrap.style.display = 'none';
        var ta = el('textarea', 'pg-input');
        ta.value = self.values[name];
        ta.setAttribute('wrap', 'off');
        ta.spellcheck = false;
        ta.setAttribute('aria-label', label + ' 代码');
        var hl = el('pre', 'pg-hl');
        hl.setAttribute('aria-hidden', 'true');
        var code = el('code');
        hl.appendChild(code);
        wrap.appendChild(ta);
        wrap.appendChild(hl);
        editorPane.appendChild(wrap);
        self.tabs.push({ name: name, btn: tabBtn, wrap: wrap });
        self.ta[name] = ta; self.hl[name] = hl; self.codeEl[name] = code;
        tabs.appendChild(tabBtn);
        tabBtn.addEventListener('click', function () { setActive(name); });
        ta.addEventListener('input', function () {
          self.values[name] = ta.value;
          syncHighlight(name);
          clearTimeout(self.runTimer);
          self.runTimer = setTimeout(function () { run(false); }, 450);
        });
        ta.addEventListener('scroll', function () { syncScroll(name); });
        ta.addEventListener('keydown', function (e) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(false); }
        });
      })(names[n]);
    }

    var previewPane = el('div', 'pg-preview-pane');
    var ph = el('div', 'pg-preview-head');
    var status = el('span', 'pg-status', '已就绪');
    status.setAttribute('aria-live', 'polite');
    ph.appendChild(el('span', null, '运行结果'));
    ph.appendChild(status);
    previewPane.appendChild(ph);
    var preview = el('div', 'pg-preview');
    var iframe = el('iframe');
    iframe.setAttribute('title', '运行结果');
    preview.appendChild(iframe);
    previewPane.appendChild(preview);
    main.appendChild(editorPane);
    main.appendChild(previewPane);

    function setActive(name, silent) {
      self.activeTab = name;
      self.tabs.forEach(function (entry) {
        entry.btn.classList.toggle('active', entry.name === name);
        entry.wrap.style.display = entry.name === name ? '' : 'none';
      });
      syncHighlight(name);
      if (!silent) { try { self.ta[name].focus(); } catch (e) {} }
    }

    function syncHighlight(name) {
      var mode = name === 'css' ? 'css' : name === 'js' ? 'plain' : detectMode(self.values[name]);
      self.codeEl[name].innerHTML = highlight(mode, self.values[name]);
      syncScroll(name);
    }

    function syncScroll(name) {
      var ta = self.ta[name], hl = self.hl[name];
      if (ta && hl) { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; }
    }

    function run(silent) {
      var html = self.values.html;
      var css = self.values.css;
      var js = self.values.js;
      var docStr;
      var isFull = /^\s*(<!doctype|<html)/i.test(html.trim());
      if (isFull) {
        docStr = html;
      } else {
        docStr = '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n' +
          (css ? '<style>\n' + css + '\n</style>\n' : '') +
          '</head>\n<body>\n' + html + '\n';
        if (js) {
          docStr += '<script>\n(function(){ window.__leErr=function(m,s,l){var d=document.createElement("div");d.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#FBE9E7;color:#B3261E;padding:8px 12px;border-radius:8px;font:12px/1.6 monospace;box-shadow:0 2px 10px rgba(0,0,0,.2)";d.textContent="JS 错误："+m+(l?"（第 "+l+" 行）":"");document.body.appendChild(d);};window.onerror=function(m,s,l){window.__leErr(m,s,l);return false;}; })();\n' +
            js.replace(/<\/script/gi, '<\\/script') + '\n</script>\n';
        }
        docStr += '</body>\n</html>';
      }
      iframe.srcdoc = docStr;
      if (!silent) status.textContent = '已运行 ✓';
    }

    function loadSample(sample) {
      self.initial = { html: sample.html || '', css: sample.css || '', js: sample.js || '' };
      self.values = { html: sample.html || '', css: sample.css || '', js: sample.js || '' };
      names.forEach(function (name) {
        self.ta[name].value = self.values[name];
        syncHighlight(name);
      });
      run(false);
    }

    runBtn.addEventListener('click', function () { run(false); });
    resetBtn.addEventListener('click', function () {
      loadSample(self.initial);
    });
    copyBtn.addEventListener('click', function () {
      copyText(self.values[self.activeTab], null, function (ok) {
        status.textContent = ok ? '已复制 ✓' : '复制失败';
        if (ok) setTimeout(function () { status.textContent = '已运行 ✓'; }, 1200);
      });
    });
    fullBtn.addEventListener('click', function () {
      root.classList.toggle('pg-fullscreen');
      fullBtn.textContent = root.classList.contains('pg-fullscreen') ? '退出全屏' : '全屏';
      requestAnimationFrame(function () { run(true); });
    });
    select.addEventListener('change', function () {
      var s = samples[Number(select.value)];
      if (s) loadSample(s);
    });

    setActive('html', true);
    run(true);

    return {
      run: function (silent) { run(silent); },
      reset: function () { loadSample(self.initial); },
      copy: function () {
        copyText(self.values[self.activeTab], null, function (ok) {
          status.textContent = ok ? '已复制 \u2713' : '复制失败';
          if (ok) setTimeout(function () { status.textContent = '已运行 \u2713'; }, 1200);
        });
      },
      load: function (sample) { loadSample(sample); },
      setActive: setActive,
      getValues: function () { return self.values; },
      toggleFullscreen: function () {
        root.classList.toggle('pg-fullscreen');
        fullBtn.textContent = root.classList.contains('pg-fullscreen') ? '退出全屏' : '全屏';
        requestAnimationFrame(function () { run(true); });
      }
    };
  }

  /* ==================== 导出与初始化 ==================== */

  var LiveEditorApi = {
    create: function (container, opts) { return new LiveEditor(container, opts); },
    upgradeAll: upgradeAll,
    playground: mountPlayground
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveEditorApi;
  }
  global.LiveEditor = LiveEditorApi;

  // 自动升级（defer 场景下 readyState 为 interactive，直接执行）
  function boot() {
    if (doc.body && doc.body.classList && !doc.body.classList.contains('le-processed')) {
      try {
        upgradeAll();
        doc.body.classList.add('le-processed');
      } catch (err) {
        if (global.console && console.error) console.error('[live-editor] 升级失败：', err && err.name, err && err.message, err && err.stack);
      }
    }
  }

  // Esc 退出全屏
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var fs = doc.querySelectorAll('.le-editor.le-fullscreen');
      for (var i = 0; i < fs.length; i++) fs[i].classList.remove('le-fullscreen');
    }
  });

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
  /* ==================== 主题切换 ==================== */
  
  var currentTheme = localStorage.getItem('editor-theme') || 'light';
  
  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('editor-theme', theme);
    
    // 更新所有主题切换按钮的图标
    var toggleBtns = document.querySelectorAll('.theme-toggle');
    toggleBtns.forEach(function(btn) {
      var icon = btn.querySelector('.icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
      var label = btn.querySelector('.label');
      if (label) {
        label.textContent = theme === 'dark' ? '浅色' : '深色';
      }
    });
    
    // 更新所有编辑器实例的主题
    document.querySelectorAll('.le-editor').forEach(function(editor) {
      editor.setAttribute('data-theme', theme);
    });
  }
  
  function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }
  
  // 初始化主题
  setTheme(currentTheme);
  
  // 创建主题切换按钮
  function createThemeToggle() {
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', '切换编辑器主题');
    btn.innerHTML = '<span class="icon">' + (currentTheme === 'dark' ? '☀️' : '🌙') + '</span>' +
                   '<span class="label">' + (currentTheme === 'dark' ? '浅色' : '深色') + '</span>';
    btn.addEventListener('click', toggleTheme);
    return btn;
  }
  
  // 将主题切换按钮添加到工具栏
  function addThemeToggleToToolbar(toolbar) {
    var actions = toolbar.querySelector('.le-actions');
    if (actions) {
      var toggle = createThemeToggle();
      actions.appendChild(toggle);
    }
  }



