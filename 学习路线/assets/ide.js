/* ============================================================
   ide.js — 前端练习场核心逻辑
   语法高亮 / IntelliSense 补全 / 双标签自动闭合 / Emmet /
   查找替换 / 撤销重做 / 实时预览 / 控制台 / 主题 / 复习示例
   ============================================================ */
(function () {
"use strict";
var D = window.IDE_DATA;

/* ==================== 工具 ==================== */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
function pad2(n) { return n < 10 ? "0" + n : "" + n; }
function nowStr() {
    var d = new Date();
    return (d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
}
function store(k, v) { try { if (v === undefined) { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function LS(k, v) { return store("lxide." + k, v); }

/* ==================== DOM 引用 ==================== */
var ta = $("#src"), hlCode = $("#code"), hlPre = $("#hl"), findLayer = $("#find-layer");
var scrollEl = $("#ed-scroll"), gIn = $("#g-in"), mini = $("#minimap");
var tabsEl = $("#tabs"), bcEl = $("#bc"), acEl = $("#ac"), acList = $("#ac-list");
var cmdk = $("#cmdk"), ckQ = $("#ck-q"), ckList = $("#ck-list");
var modal = $("#modal"), modalBody = $("#modal-body");
var findbar = $("#findbar"), fbQ = $("#fb-q"), fbR = $("#fb-r");
var pvFrame = $("#pv-frame"), pvBody = $(".pv-body"), pvState = $("#pv-state"), pvDot = $(".pv-dot");
var stMsg = $("#st-msg"), stPos = $("#st-pos"), stLang = $("#st-lang"), stTheme = $("#st-theme");
var sbEl = $("#sidebar"), sbTitle = $("#sb-title"), sbScroll = $(".sb-scroll");
var toastEl = $("#toast"), panelEl = $("#panel"), pnBody = $("#pn-body"), pnCount = $("#pn-count");

var SVG_CHK = '<svg viewBox="0 0 24 24"><path d="m5 13 4 4 10-10" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ==================== 文件模型 ==================== */
var files = {
    html: { key: "html", name: "index.html", lang: "html", icon: "H", cls: "html", value: "", saved: "", undo: [], redo: [] },
    css: { key: "css", name: "style.css", lang: "css", icon: "C", cls: "css", value: "", saved: "", undo: [], redo: [] },
    js: { key: "js", name: "script.js", lang: "js", icon: "J", cls: "js", value: "", saved: "", undo: [], redo: [] }
};
var cur = "html";
function CF() { return files[cur]; }
var sampleId = null;
var composing = false;

/* ==================== 语法高亮 token 化 ==================== */
function tokenizeCSS(src) {
    var out = [], i = 0, n = src.length, depth = 0, buf = "", mode = "sel";
    function flush(cls) { if (buf) { out.push([cls || "", buf]); buf = ""; } }
    while (i < n) {
        var ch = src[i], two = src.substr(i, 2);
        if (two === "/*") {
            var e = src.indexOf("*/", i + 2); e = e < 0 ? n : e + 2;
            flush(); out.push(["tk-com", src.slice(i, e)]); i = e; continue;
        }
        if (ch === '"' || ch === "'") {
            var q = ch, j = i + 1;
            while (j < n && src[j] !== q) { if (src[j] === "\\") j++; j++; }
            flush(); out.push(["tk-str", src.slice(i, Math.min(j + 1, n))]); i = j + 1; continue;
        }
        if (ch === "@") {
            var m = /^@[\w-]+/.exec(src.slice(i));
            flush(); out.push(["tk-at", m[0]]); i += m[0].length; continue;
        }
        if (ch === "{") {
            flush(mode === "sel" ? "" : "");
            out.push(["tk-punc", "{"]); depth++; mode = "prop"; i++; continue;
        }
        if (ch === "}") {
            flush(mode === "val" ? "tk-val" : mode === "prop" ? "tk-prop" : "");
            out.push(["tk-punc", "}"]); depth--; mode = "sel"; i++; continue;
        }
        if (depth > 0) {
            if (mode === "prop" && ch === ":") {
                flush("tk-prop"); out.push(["tk-punc", ":"]); mode = "val"; i++; continue;
            }
            if (ch === ";") {
                flush(mode === "val" ? "tk-val" : "tk-prop");
                out.push(["tk-punc", ";"]); mode = "prop"; i++; continue;
            }
            if (mode === "val") {
                var mn = /^#[0-9a-fA-F]{3,8}\b|^-?[\d.]+(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch|ex|cm|mm|in|pt|pc)?/.exec(src.slice(i));
                if (mn && mn[0]) { flush(); out.push(["tk-num", mn[0]]); i += mn[0].length; continue; }
            }
            buf += ch; i++; continue;
        }
        buf += ch; i++;
    }
    flush(depth > 0 ? (mode === "prop" ? "tk-prop" : "tk-val") : "");
    return out;
}

function tokenizeTag(tag) {
    var out = [], re = /(<\/?)|([\w-]+)(=)("[^"]*"|'[^']*')|([\w-]+)|(\/?>)|([\s=]+)/g, m, last = 0, nameDone = false;
    while ((m = re.exec(tag))) {
        if (m.index > last) out.push(["", tag.slice(last, m.index)]);
        if (m[1]) out.push(["tk-punc", m[1]]);
        else if (m[2]) { out.push(["tk-attr", m[2]], ["tk-punc", "="], ["tk-str", m[4]]); nameDone = true; }
        else if (m[5]) { out.push([nameDone ? "tk-attr" : "tk-tag", m[5]]); nameDone = true; }
        else if (m[6]) out.push(["tk-punc", m[6]]);
        else if (m[7]) out.push(["", m[7]]);
        last = m.index + m[0].length;
    }
    if (last < tag.length) out.push(["", tag.slice(last)]);
    return out;
}

var JS_GLOBALS = { document: 1, window: 1, console: 1, Math: 1, JSON: 1, localStorage: 1, setTimeout: 1, setInterval: 1, clearTimeout: 1, clearInterval: 1, parseInt: 1, parseFloat: 1, alert: 1, location: 1, navigator: 1 };

function tokenizeJS(src) {
    var KW = /^(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|in|of|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|delete|void|null|undefined|true|false)$/;
    var out = [], i = 0, n = src.length, buf = "";
    function flush(cls) { if (buf) { out.push([cls || "", buf]); buf = ""; } }
    while (i < n) {
        var two = src.substr(i, 2), ch = src[i];
        if (two === "//") {
            var e = src.indexOf("\n", i); e = e < 0 ? n : e;
            flush(); out.push(["tk-com", src.slice(i, e)]); i = e; continue;
        }
        if (two === "/*") {
            var e2 = src.indexOf("*/", i + 2); e2 = e2 < 0 ? n : e2 + 2;
            flush(); out.push(["tk-com", src.slice(i, e2)]); i = e2; continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
            var q = ch, j = i + 1;
            while (j < n) {
                if (src[j] === "\\") { j += 2; continue; }
                if (src[j] === q) { j++; break; } j++;
            }
            flush(); out.push(["tk-str", src.slice(i, Math.min(j, n))]); i = j; continue;
        }
        if (/[A-Za-z_$]/.test(ch)) {
            var w = /^[A-Za-z_$][\w$]*/.exec(src.slice(i))[0];
            flush();
            var k = i + w.length;
            while (k < n && (src[k] === " " || src[k] === "\t")) k++;
            if (KW.test(w)) out.push(["tk-kw", w]);
            else if (src[k] === "(") out.push(["tk-fn", w]);
            else if (JS_GLOBALS[w]) out.push(["tk-ent", w]);
            else out.push(["", w]);
            i += w.length; continue;
        }
        if (/[0-9]/.test(ch)) {
            var mn = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
            if (mn) { flush(); out.push(["tk-num", mn[0]]); i += mn[0].length; continue; }
        }
        if ('{}()=;,.[]<>:+-*/%!&|?'.indexOf(ch) >= 0) { flush(); out.push(["tk-punc", ch]); i++; continue; }
        buf += ch; i++;
    }
    flush();
    return out;
}

function tokenizeHTML(src) {
    var out = [], i = 0, n = src.length, buf = "";
    function flush() { if (buf) { out.push(["", buf]); buf = ""; } }
    while (i < n) {
        if (src.substr(i, 4) === "<!--") {
            var e = src.indexOf("-->", i + 4); e = e < 0 ? n : e + 3;
            flush(); out.push(["tk-com", src.slice(i, e)]); i = e; continue;
        }
        if (src.substr(i, 9).toUpperCase() === "<!DOCTYPE".slice(0, 9).toUpperCase()) {
            var dg = src.indexOf(">", i); dg = dg < 0 ? n : dg + 1;
            flush(); out.push(["tk-doct", src.slice(i, dg)]); i = dg; continue;
        }
        var low = src.substr(i, 7).toLowerCase();
        if (low === "<style>") {
            var cs = src.toLowerCase().indexOf("</style", i + 7); cs = cs < 0 ? n : cs;
            flush();
            out.push(["tk-punc", "<"], ["tk-tag", "style"], ["tk-punc", ">"]);
            tokenizeCSS(src.slice(i + 7, cs)).forEach(function (t) { out.push(t); });
            if (cs < n) out.push(["tk-punc", "</"], ["tk-tag", "style"], ["tk-punc", ">"]);
            i = cs < n ? cs + 8 : n; continue;
        }
        if (src.substr(i, 8).toLowerCase() === "<script>") {
            var ss = src.toLowerCase().indexOf("</script", i + 8); ss = ss < 0 ? n : ss;
            flush();
            out.push(["tk-punc", "<"], ["tk-tag", "script"], ["tk-punc", ">"]);
            tokenizeJS(src.slice(i + 8, ss)).forEach(function (t) { out.push(t); });
            if (ss < n) out.push(["tk-punc", "</"], ["tk-tag", "script"], ["tk-punc", ">"]);
            i = ss < n ? ss + 9 : n; continue;
        }
        if (src[i] === "<" && /[a-zA-Z\/!]/.test(src[i + 1] || "")) {
            var gt = src.indexOf(">", i + 1); if (gt < 0) gt = n - 1;
            flush();
            tokenizeTag(src.slice(i, gt + 1)).forEach(function (t) { out.push(t); });
            i = gt + 1; continue;
        }
        if (src[i] === "&") {
            var em = /^&[\w#]+;?/.exec(src.slice(i));
            if (em) { flush(); out.push(["tk-ent", em[0]]); i += em[0].length; continue; }
        }
        buf += src[i]; i++;
    }
    flush();
    return out;
}

function tokenizeFor(lang, text) {
    return lang === "html" ? tokenizeHTML(text) : lang === "css" ? tokenizeCSS(text) : tokenizeJS(text);
}

/* ==================== 编辑器渲染 ==================== */
var charW = 7.8, lineH = 21, padX = 16, padY = 12;
var lastLineCount = -1;

function measureFont() {
    var probe = document.createElement("span");
    probe.style.cssText = 'position:absolute;visibility:hidden;font-family:var(--mono);font-size:13px;white-space:pre';
    probe.textContent = "0000000000";
    document.body.appendChild(probe);
    charW = probe.getBoundingClientRect().width / 10;
    document.body.removeChild(probe);
}

function buildLines(text, lang) {
    var toks = tokenizeFor(lang, text);
    var lines = [[]], li = 0;
    for (var t = 0; t < toks.length; t++) {
        var parts = toks[t][1].split("\n");
        for (var p = 0; p < parts.length; p++) {
            if (p > 0) { lines.push([]); li++; }
            if (parts[p]) lines[li].push([toks[t][0], parts[p]]);
        }
    }
    return lines;
}

function lineHtml(toks) {
    var html = "", lead = "";
    if (toks.length && !toks[0][0] && /^[ \t]+/.test(toks[0][1])) {
        var m = /^[ \t]+/.exec(toks[0][1])[0];
        lead = '<span class="ind">' + esc(m) + "</span>";
        var rest = toks[0][1].slice(m.length);
        if (rest) html += esc(rest);
        for (var i = 1; i < toks.length; i++) html += toks[i][0] ? '<span class="' + toks[i][0] + '">' + esc(toks[i][1]) + "</span>" : esc(toks[i][1]);
    } else {
        for (var j = 0; j < toks.length; j++) html += toks[j][0] ? '<span class="' + toks[j][0] + '">' + esc(toks[j][1]) + "</span>" : esc(toks[j][1]);
    }
    return lead + html;
}

function curLineOf(pos) {
    return (ta.value.slice(0, pos).match(/\n/g) || []).length;
}

function render() {
    var f = CF();
    var lines = buildLines(ta.value, f.lang);
    var cl = curLineOf(ta.selectionStart);
    var h = "";
    for (var i = 0; i < lines.length; i++) {
        h += '<div class="cl' + (i === cl ? " cur" : "") + '">' + lineHtml(lines[i]) + "</div>";
    }
    hlCode.innerHTML = h;
    updateGutter(lines.length, cl);
    drawMini(lines);
    renderFind();
}

function updateCurLine() {
    var cl = curLineOf(ta.selectionStart);
    var prev = hlCode.querySelector(".cl.cur");
    if (prev) prev.classList.remove("cur");
    var divs = hlCode.children;
    if (divs[cl]) divs[cl].classList.add("cur");
    var gp = gIn.querySelector("div.cur");
    if (gp) gp.classList.remove("cur");
    if (gIn.children[cl]) gIn.children[cl].classList.add("cur");
}

function updateGutter(count, cl) {
    if (count !== lastLineCount) {
        var h = "";
        for (var i = 1; i <= count; i++) h += "<div>" + i + "</div>";
        gIn.innerHTML = h;
        lastLineCount = count;
    }
    var gp = gIn.querySelector("div.cur");
    if (gp) gp.classList.remove("cur");
    if (gIn.children[cl]) gIn.children[cl].classList.add("cur");
}

function syncScroll() {
    var sl = ta.scrollLeft, st = ta.scrollTop;
    var tf = "translate(" + -sl + "px," + -st + "px)";
    hlPre.style.transform = tf;
    findLayer.style.transform = tf;
    gIn.style.transform = "translateY(" + -st + "px)";
    drawMiniView();
}

/* ==================== 微缩地图 ==================== */
var miniLines = [], miniColors = null;
function themeColors() {
    var cs = getComputedStyle(document.body);
    return {
        fg: cs.getPropertyValue("--fg").trim(),
        com: cs.getPropertyValue("--t-com").trim(),
        tag: cs.getPropertyValue("--t-tag").trim(),
        str: cs.getPropertyValue("--t-str").trim(),
        kw: cs.getPropertyValue("--t-kw").trim(),
        ac: cs.getPropertyValue("--ac").trim(),
        ln: cs.getPropertyValue("--ln").trim()
    };
}
function drawMini(lines) {
    miniLines = lines || [];
    miniColors = themeColors();
    drawMiniView();
}
function drawMiniView() {
    if (!miniColors) miniColors = themeColors();
    var wrap = $("#ed-wrap");
    var cw = 84, chh = wrap.clientHeight;
    if (mini.height !== chh * 2) { mini.height = chh * 2; mini.width = cw * 2; }
    var ctx = mini.getContext("2d");
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, cw, chh);
    var n = miniLines.length;
    var lh = Math.max(1.5, Math.min(3.2, chh / Math.max(n, 1)));
    for (var i = 0; i < n; i++) {
        var toks = miniLines[i];
        if (!toks.length) continue;
        var txt = toks.map(function (t) { return t[1]; }).join("");
        if (!txt.trim()) continue;
        var ind = /^[ \t]*/.exec(txt)[0].replace(/\t/g, "  ").length;
        var color = miniColors.fg, alpha = .5;
        for (var k = 0; k < toks.length; k++) {
            if (toks[k][0] === "tk-com") { color = miniColors.com; alpha = .8; break; }
            if (toks[k][0]) { color = miniColors[toks[k][0].slice(3)] || miniColors.fg; break; }
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        var x = 2 + Math.min(ind * .9, 56);
        var w = Math.min(txt.trim().length * .9, cw - 4 - x);
        if (w > 0) ctx.fillRect(x, i * lh, w, Math.max(1, lh - .6));
    }
    ctx.globalAlpha = 1;
    var sh = ta.scrollHeight, stp = ta.scrollTop, vh = ta.clientHeight;
    if (sh > 0) {
        var ry = stp / sh * chh, rh = vh / sh * chh;
        ctx.strokeStyle = miniColors.ac;
        ctx.globalAlpha = .35;
        ctx.lineWidth = 1;
        ctx.strokeRect(.5, ry + .5, cw - 1, Math.max(rh, 8));
        ctx.globalAlpha = 1;
    }
    mini._lh = lh; mini._chh = chh;
}
mini.addEventListener("mousedown", function (e) {
    var r = mini.getBoundingClientRect();
    var y = e.clientY - r.top;
    var target = y / mini._chh * ta.scrollHeight - ta.clientHeight / 2;
    ta.scrollTop = Math.max(0, Math.min(ta.scrollHeight, target));
    ta.focus();
});

/* ==================== 撤销 / 重做 ==================== */
var pendingSnap = null, lastPush = 0, lastIsType = false;
function snap() { return { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd }; }
function pushUndo() {
    var f = CF();
    f.undo.push(snap());
    if (f.undo.length > 250) f.undo.shift();
    f.redo.length = 0;
}
ta.addEventListener("beforeinput", function () { pendingSnap = snap(); });
ta.addEventListener("input", function (e) {
    var f = CF();
    var t = Date.now();
    var isType = e.inputType === "insertText" || e.inputType === "insertLineBreak" || e.inputType === "insertCompositionText";
    if (!f.undo.length || t - lastPush > 700 || !isType || lastIsType !== isType) {
        if (pendingSnap) f.undo.push(pendingSnap);
        if (f.undo.length > 250) f.undo.shift();
        f.redo.length = 0;
        lastPush = t;
    }
    lastIsType = isType;
    pendingSnap = null;
    onEdit();
});
function undo() {
    var f = CF();
    if (!f.undo.length) { toast("没有可撤销的内容"); return; }
    f.redo.push(snap());
    var p = f.undo.pop();
    applySnap(p);
    toast("撤销");
}
function redo() {
    var f = CF();
    if (!f.redo.length) { toast("没有可重做的内容"); return; }
    f.undo.push(snap());
    applySnap(f.redo.pop());
    toast("重做");
}
function applySnap(p) {
    ta.value = p.v;
    ta.setSelectionRange(p.s, p.e);
    onEdit();
}

/* ==================== 编辑辅助 ==================== */
function replaceRange(start, end, text, selOffset) {
    pushUndo();
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
    var pos = start + (selOffset === undefined ? text.length : selOffset);
    ta.setSelectionRange(pos, pos);
    onEdit();
}
function insertAtCursor(text, cursorBack) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    pushUndo();
    var sel = ta.value.slice(s, e);
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    var pos = s + text.length - (cursorBack || 0);
    ta.setSelectionRange(pos, pos);
    onEdit();
}
function wrapSelection(open, close) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    pushUndo();
    var sel = ta.value.slice(s, e);
    ta.value = ta.value.slice(0, s) + open + sel + close + ta.value.slice(e);
    ta.setSelectionRange(s + open.length, s + open.length + sel.length);
    onEdit();
}

/* ---------- 语言上下文（html 文件中识别 style/script 区） ---------- */
function langAtCursor() {
    var f = CF();
    if (f.lang !== "html") return f.lang;
    var low = ta.value.slice(0, ta.selectionStart).toLowerCase();
    var stOpen = low.lastIndexOf("<style"), stClose = low.lastIndexOf("</style");
    if (stOpen > stClose) return "css";
    var scOpen = low.lastIndexOf("<script"), scClose = low.lastIndexOf("</script");
    if (scOpen > scClose) return "js";
    return "html";
}

/* ---------- 查找最近的未闭合开标签 ---------- */
function unclosedTags(upto) {
    var stack = [];
    var re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g, m;
    while ((m = re.exec(upto))) {
        var closing = m[1] === "/", name = m[2], attrs = m[3] || "";
        if (closing) {
            for (var i = stack.length - 1; i >= 0; i--) {
                if (stack[i] === name) { stack.splice(i, 1); break; }
            }
        } else if (!/\/\s*$/.test(attrs) && !D.VOID[name.toLowerCase()]) {
            stack.push(name);
        }
    }
    return stack;
}
function inTagContext(upto) {
    var lt = upto.lastIndexOf("<"), gt = upto.lastIndexOf(">");
    if (lt < 0 || gt > lt) return null;
    if (upto[lt + 1] === "/" || upto[lt + 1] === "!") return { closing: upto[lt + 1] === "/" };
    var seg = upto.slice(lt + 1);
    var name = /^([\w-]+)/.exec(seg);
    if (!name) return null;
    var quotes = (seg.match(/"/g) || []).length;
    if (quotes % 2 === 1) return { inQuote: true, tag: name[1] };
    return { tag: name[1], seg: seg };
}
function isQuote(ch) { return ch === '"' || ch === "'" || ch === "`"; }

/* ==================== 键盘行为（自动补齐 / 缩进 / 删除） ==================== */
var PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };

ta.addEventListener("keydown", function (e) {
    if (composing) return;
    var k = e.key, s = ta.selectionStart, en = ta.selectionEnd;
    var v = ta.value, before = v.slice(0, s), after = v.slice(en);
    var lang = langAtCursor();
    var hasSel = s !== en;

    /* --- 智能提示导航优先 --- */
    if (ac.on) {
        if (k === "ArrowDown") { e.preventDefault(); acMove(1); return; }
        if (k === "ArrowUp") { e.preventDefault(); acMove(-1); return; }
        if (k === "Enter" || k === "Tab") { e.preventDefault(); acAccept(); return; }
        if (k === "Escape") { e.preventDefault(); acClose(); return; }
        if (k === "PageDown") { e.preventDefault(); acMove(9); return; }
        if (k === "PageUp") { e.preventDefault(); acMove(-9); return; }
    }

    /* --- Tab：接受 / Emmet / 缩进 --- */
    if (k === "Tab") {
        e.preventDefault();
        if (s !== en) {
            indentLines(!e.shiftKey);
        } else if (!e.shiftKey && lang === "html") {
            var word = /[a-zA-Z0-9$.#>*+\-()\[\]@{}!_]*$/.exec(before)[0];
            if (word && /[a-zA-Z]/.test(word)) {
                var exp = emmetExpand(word);
                if (exp) { replaceRange(s - word.length, s, exp.text, exp.cursor); return; }
            }
            insertAtCursor("  ");
        } else if (e.shiftKey) {
            outdentLine();
        } else {
            insertAtCursor("  ");
        }
        return;
    }

    /* --- Ctrl 组合（编辑器内） --- */
    if (e.ctrlKey || e.metaKey) {
        if (k === " ") { e.preventDefault(); acTrigger(true); return; }
        if (k === "z" || k === "Z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
        if (k === "y" || k === "Y") { e.preventDefault(); redo(); return; }
        if (k === "d" || k === "D") { e.preventDefault(); duplicateLine(); return; }
        if (k === "/") { e.preventDefault(); toggleComment(); return; }
        if (k === "f" || k === "F") { e.preventDefault(); openFind(false); return; }
        if (k === "h" || k === "H") { e.preventDefault(); openFind(true); return; }
        if (k === "Enter") { e.preventDefault(); runPreview(); return; }
        if (k === "s" || k === "S") { e.preventDefault(); saveReview(); return; }
        return;
    }

    /* --- Alt+方向 移动行 --- */
    if (e.altKey && (k === "ArrowUp" || k === "ArrowDown")) {
        e.preventDefault();
        moveLine(k === "ArrowUp" ? -1 : 1);
        return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey) return;

    /* --- 自动配对：括号 / 引号 --- */
    if (PAIRS[k] && !hasSel) {
        var next = after[0];
        var prevCh = before.slice(-1);
        if (isQuote(k) && (isQuote(prevCh) && PAIRS[prevCh] === prevCh || /[\w"'`]/.test(next || ""))) {
            /* 引号紧跟标识符 → 不配对 */
        } else {
            e.preventDefault();
            insertAtCursor(k + PAIRS[k], 1);
            return;
        }
    }
    if (PAIRS[k] && hasSel) {
        e.preventDefault();
        wrapSelection(k, PAIRS[k]);
        return;
    }
    /* 输入闭合符：与右侧相同则跳过（type-over） */
    if (!hasSel && after[0] === k && (")]}".indexOf(k) >= 0 || (isQuote(k) && before.slice(-1) === k))) {
        e.preventDefault();
        ta.setSelectionRange(s + 1, s + 1);
        onEdit();
        return;
    }

    /* --- HTML 双标签自动补齐：输入 </ 自动补全最近未闭合标签 --- */
    if (lang === "html" && k === "/" && !hasSel && before.slice(-1) === "<") {
        var st = unclosedTags(before.slice(0, -1));
        if (st.length) {
            e.preventDefault();
            insertAtCursor("/" + st[st.length - 1] + ">");
            return;
        }
    }

    /* --- HTML 双标签自动补齐：输入开标签 > 自动补全 </tag> --- */
    if (lang === "html" && k === ">" && !hasSel) {
        var m = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'\n<])*)$/.exec(before);
        if (m && !/\/\s*$/.test(m[2]) && !D.VOID[m[1].toLowerCase()]) {
            e.preventDefault();
            insertAtCursor("></" + m[1] + ">", ("</" + m[1] + ">").length);
            acTrigger();
            return;
        }
    }

    /* --- Enter：自动缩进 --- */
    if (k === "Enter" && !hasSel) {
        e.preventDefault();
        var line = before.slice(before.lastIndexOf("\n") + 1);
        var ind = (/^[ \t]*/.exec(line))[0];
        var extra = "";
        var pC = before.slice(-1);
        var nC = after[0];
        if (lang === "html") {
            var om = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'\n<])*)>$/.exec(before);
            var cm = /^<\/\s*([\w-]+)/.exec(after);
            if (om && !D.VOID[om[1].toLowerCase()] && !/\/\s*$/.test(om[2])) {
                if (cm && cm[1].toLowerCase() === om[1].toLowerCase()) {
                    insertAtCursor("\n" + ind + "  \n" + ind, ind.length + 3);
                    return;
                }
                extra = "  ";
            } else if (cm) {
                ind = ind.length >= 2 ? ind.slice(0, -2) : ind;
            }
        } else {
            if (pC === "{" || pC === "[" || pC === "(") extra = "  ";
            if ((pC === "{" && nC === "}") || (pC === "[" && nC === "]") || (pC === "(" && nC === ")")) {
                insertAtCursor("\n" + ind + "  \n" + ind, ind.length + 3);
                return;
            }
        }
        insertAtCursor("\n" + ind + extra);
        return;
    }

    /* --- Backspace：删除成对 / 整行空白缩进回退 --- */
    if (k === "Backspace" && !hasSel) {
        var two = before.slice(-2);
        if ((two === "()" || two === "[]" || two === "{}" || two === '""' || two === "''" || two === "``") && after[0] === two[1]) {
            e.preventDefault();
            pushUndo();
            ta.value = before.slice(0, -1) + after.slice(1);
            ta.setSelectionRange(s - 1, s - 1);
            onEdit();
            return;
        }
        var lineStart = ta.value.lastIndexOf("\n", s - 2) + 1;
        var lineTxt = ta.value.slice(lineStart, s);
        if (/^([ ]{2,})$/.test(lineTxt) && (after === "" || after[0] === "\n")) {
            e.preventDefault();
            pushUndo();
            var cut = lineTxt.length >= 2 ? 2 : lineTxt.length;
            ta.value = ta.value.slice(0, s - cut) + ta.value.slice(s);
            ta.setSelectionRange(s - cut, s - cut);
            onEdit();
            return;
        }
    }
});

ta.addEventListener("input", function () { acTrigger(); });
ta.addEventListener("keyup", function () { updateCurLine(); updatePos(); });
ta.addEventListener("click", function () { updateCurLine(); updatePos(); acClose(); });
ta.addEventListener("scroll", syncScroll);
ta.addEventListener("compositionstart", function () { composing = true; acClose(); });
ta.addEventListener("compositionend", function () { composing = false; setTimeout(function () { acTrigger(); }, 30); });
ta.addEventListener("contextmenu", function (e) { e.preventDefault(); });

function indentLines(add) {
    var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
    var ls = v.lastIndexOf("\n", s - 1) + 1;
    var le = v.indexOf("\n", e); le = le < 0 ? v.length : le;
    var block = v.slice(ls, le);
    pushUndo();
    if (add) block = block.replace(/^/gm, "  ");
    else {
        if (!/^ /m.test(block)) return;
        block = block.replace(/^ {1,2}/gm, "");
    }
    ta.value = v.slice(0, ls) + block + v.slice(le);
    var delta = add ? (block.match(/\n/g) || []).length * 2 : -(block.match(/\n/g) || []).length * 2;
    ta.setSelectionRange(Math.max(ls, s + 2), e + delta);
    onEdit();
}
function outdentLine() {
    var s = ta.selectionStart, v = ta.value;
    var ls = v.lastIndexOf("\n", s - 1) + 1;
    var line = v.slice(ls, v.indexOf("\n", ls) < 0 ? v.length : v.indexOf("\n", ls));
    var m = /^ {1,2}/.exec(line);
    if (!m) return;
    pushUndo();
    ta.value = v.slice(0, ls) + line.slice(m[0].length) + v.slice(ls + line.length);
    ta.setSelectionRange(s - m[0].length, s - m[0].length);
    onEdit();
}
function duplicateLine() {
    var s = ta.selectionStart, v = ta.value;
    var ls = v.lastIndexOf("\n", s - 1) + 1;
    var le = v.indexOf("\n", s); le = le < 0 ? v.length : le;
    var line = v.slice(ls, le);
    pushUndo();
    ta.value = v.slice(0, le) + "\n" + line + v.slice(le);
    ta.setSelectionRange(s + line.length + 1, s + line.length + 1);
    onEdit();
    toast("已复制当前行");
}
function moveLine(dir) {
    var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
    var ls = v.lastIndexOf("\n", s - 1) + 1;
    var le = v.indexOf("\n", e); le = le < 0 ? v.length : le;
    var line = v.slice(ls, le);
    var pos = s - ls;
    pushUndo();
    if (dir < 0) {
        if (ls === 0) return;
        var pl = v.lastIndexOf("\n", ls - 2) + 1;
        var prev = v.slice(pl, ls - 1);
        ta.value = v.slice(0, pl) + line + "\n" + prev + v.slice(le);
        ta.setSelectionRange(pl + pos, pl + pos);
    } else {
        if (le >= v.length) return;
        var nl = le + 1;
        var ne = v.indexOf("\n", nl); ne = ne < 0 ? v.length : ne;
        var next = v.slice(nl, ne);
        ta.value = v.slice(0, ls) + next + "\n" + line + v.slice(ne);
        ta.setSelectionRange(ls + next.length + 1 + pos, ls + next.length + 1 + pos);
    }
    onEdit();
}
function toggleComment() {
    var lang = langAtCursor();
    var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
    var ls = v.lastIndexOf("\n", s - 1) + 1;
    var le = v.indexOf("\n", e); le = le < 0 ? v.length : le;
    var block = v.slice(ls, le);
    if (!block.trim()) return;
    pushUndo();
    var out;
    if (lang === "css") {
        var isCom = /^\s*\/\*[\s\S]*\*\/\s*$/.test(block);
        out = isCom ? block.replace(/^\s*\/\*\s?/, "").replace(/\s?\*\/\s*$/, "") : "/* " + block + " */";
    } else if (lang === "js") {
        var lines = block.split("\n");
        var allCom = lines.every(function (l) { return !l.trim() || /^\s*\/\//.test(l); });
        out = lines.map(function (l) {
            if (!l.trim()) return l;
            return allCom ? l.replace(/^(\s*)\/\/ ?/, "$1") : l.replace(/^(\s*)/, "$1// ");
        }).join("\n");
    } else {
        var isH = /^\s*<!--[\s\S]*-->\s*$/.test(block);
        out = isH ? block.replace(/^\s*<!--\s?/, "").replace(/\s?-->\s*$/, "") : "<!-- " + block + " -->";
    }
    ta.value = v.slice(0, ls) + out + v.slice(le);
    ta.setSelectionRange(ls + Math.min(s - ls, out.length), ls + Math.min(s - ls, out.length));
    onEdit();
    toast("已切换注释");
}

/* ==================== Emmet 缩写展开 ==================== */
function emmetNode() { return { name: "div", classes: [], id: "", attrs: [], count: 1, text: "", children: [] }; }

function splitTop(str, sep) {
    var out = [], buf = "", depth = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str[i];
        if (c === "[" || c === "(" || c === "{") depth++;
        if (c === "]" || c === ")" || c === "}") depth--;
        if (c === sep && depth === 0) { out.push(buf); buf = ""; continue; }
        buf += c;
    }
    out.push(buf);
    return out;
}

function emmetParseSeg(seg) {
    var n = emmetNode(), i = 0;
    var mm = /^[\w-]+/.exec(seg);
    if (mm) { n.name = mm[0]; i = mm[0].length; }
    else if (seg[0] === "." || seg[0] === "#") n.name = "div";
    else return null;
    while (i < seg.length) {
        var c = seg[i];
        if (c === ".") {
            var cm = /^\.([\w-]+)/.exec(seg.slice(i));
            if (!cm) return null;
            n.classes.push(cm[1]); i += cm[0].length;
        } else if (c === "#") {
            var im = /^#([\w-]+)/.exec(seg.slice(i));
            if (!im) return null;
            n.id = im[1]; i += im[0].length;
        } else if (c === "[") {
            var close = seg.indexOf("]", i);
            if (close < 0) return null;
            n.attrs = seg.slice(i + 1, close).split(/\s+/).filter(Boolean);
            i = close + 1;
        } else if (c === "*") {
            var xm = /^\*(\d+)/.exec(seg.slice(i));
            if (!xm) return null;
            n.count = parseInt(xm[1], 10); i += xm[0].length;
        } else if (c === "{") {
            var tc = seg.indexOf("}", i);
            if (tc < 0) return null;
            n.text = seg.slice(i + 1, tc); i = tc + 1;
        } else return null;
    }
    return n;
}

function cloneNode(n, idx) {
    var sub = function (s) { return s ? s.replace(/\$\+/g, String(idx + 1)) : s; };
    var c = {
        name: n.name, classes: n.classes.map(sub), id: sub(n.id),
        attrs: n.attrs.map(function (a) { return a.replace(/=([^=\s]+)/, function (m, v) { return "=" + sub(v); }); }),
        count: 1, text: sub(n.text), children: []
    };
    for (var i = 0; i < n.children.length; i++) c.children.push(cloneNode(n.children[i], idx));
    return c;
}

function emmetParse(str) {
    var root = { frag: true, children: [] };
    var parts = splitTop(str, "+");
    for (var i = 0; i < parts.length; i++) {
        var chain = splitTop(parts[i], ">");
        var prev = null;
        for (var c = 0; c < chain.length; c++) {
            var node = emmetParseSeg(chain[c]);
            if (!node) return null;
            var list = [];
            for (var r = 0; r < node.count; r++) list.push(cloneNode(node, r));
            if (prev) {
                for (var p = 0; p < prev.length; p++) prev[p].children = prev[p].children.concat(list);
            } else {
                root.children = root.children.concat(list);
            }
            prev = list;
        }
    }
    return root;
}

function emmetExpand(abbr) {
    if (!abbr || !/^[a-zA-Z.#[({]/.test(abbr)) return null;
    if (!/[.#\[>*+{(#]/.test(abbr)) {
        /* 纯单词：仅常用标签展开 */
        var known = false;
        for (var i = 0; i < D.TAGS.length; i++) if (D.TAGS[i][0] === abbr) { known = true; break; }
        if (!known) return null;
    }
    var tree = emmetParse(abbr);
    if (!tree) return null;
    var buf = [], firstCursor = -1;
    function renderNode(n, depth) {
        for (var i = 0; i < n.children.length; i++) {
            var ch = n.children[i];
            var ind = new Array(depth * 2 + 1).join(" ");
            buf.push(ind);
            var open = "<" + ch.name;
            if (ch.id) open += ' id="' + ch.id + '"';
            if (ch.classes.length) open += ' class="' + ch.classes.join(" ") + '"';
            for (var a = 0; a < ch.attrs.length; a++) {
                var am = /^([\w-]+)(?:=(.*))?$/.exec(ch.attrs[a]);
                if (!am) continue;
                open += " " + am[1] + '="' + (am[2] || "") + '"';
            }
            open += ">";
            buf.push(open);
            if (D.VOID[ch.name.toLowerCase()]) { buf.push("\n"); continue; }
            if (ch.text) {
                buf.push(ch.text);
            } else if (firstCursor < 0) {
                firstCursor = buf.join("").length;
            }
            if (ch.children.length) {
                buf.push("\n");
                renderNode(ch, depth + 1);
                buf.push(ind);
            }
            buf.push("</" + ch.name + ">\n");
        }
    }
    renderNode(tree, 0);
    var text = buf.join("").replace(/\n+$/, "");
    if (firstCursor < 0 || firstCursor > text.length) firstCursor = text.length;
    return { text: text, cursor: firstCursor };
}

/* ==================== 智能提示（IntelliSense） ==================== */
var ac = { on: false, items: [], sel: 0, start: 0, end: 0 };
var acFoot = document.createElement("div");
acFoot.className = "ac-foot";
acFoot.innerHTML = "<span><b>Tab / Enter</b> 接受</span><span><b>↑↓</b> 选择</span><span><b>Esc</b> 关闭</span>";
acEl.appendChild(acFoot);

function IK(kind) {
    var map = { tag: "&lt;", ctag: "&lt;/", attr: "@", aval: "❝", ent: "&amp;", prop: "▸", val: "v", pseudo: ":", at: "@", kw: "k", snip: "ƒ", member: ".", glob: "◉" };
    var cls = { tag: "ik-tag", ctag: "ik-tag", attr: "ik-attr", aval: "ik-val", ent: "ik-ent", prop: "ik-prop", val: "ik-val", pseudo: "ik-prop", at: "ik-at", kw: "ik-kw", snip: "ik-fn", member: "ik-fn", glob: "ik-ent" };
    return '<b class="' + (cls[kind] || "ik-tag") + '">' + (map[kind] || "•") + "</b>";
}

function acTrigger(manual) {
    if (composing) return;
    var s = ta.selectionStart;
    if (s !== ta.selectionEnd) { acClose(); return; }
    var before = ta.value.slice(0, s);
    var lang = langAtCursor();
    var res = gatherSuggestions(before, lang, manual);
    if (!res || !res.items.length) { acClose(); return; }
    ac.items = res.items.slice(0, 60);
    ac.sel = 0;
    ac.start = s - res.prefix.length;
    ac.end = s;
    acRender();
}
function gatherSuggestions(before, lang, manual) {
    var items = [], prefix = "";

    if (lang === "html") {
        var m;
        /* 实体 */
        if ((m = /&([\w#]*)$/.exec(before)) && (m[1] || manual)) {
            prefix = m[1];
            D.ENTITIES.forEach(function (e) { items.push({ kind: "ent", label: e[0], text: e[0] + ";", desc: e[1], pr: e[2] }); });
            return { items: filterItems(items, prefix), prefix: "&" + prefix, rawPrefix: "&" + prefix };
        }
        /* 闭标签 </ */
        if ((m = /<\/([\w-]*)$/.exec(before))) {
            prefix = m[1];
            var stack = unclosedTags(before);
            var seen = {};
            stack.slice().reverse().forEach(function (t) {
                if (!seen[t]) { seen[t] = 1; items.push({ kind: "ctag", label: t, text: t + ">", desc: "闭合 " + t, pr: 0 }); }
            });
            return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
        }
        /* 开标签 < */
        if ((m = /<([\w-]*)$/.exec(before))) {
            prefix = m[1];
            D.TAGS.forEach(function (t) { items.push({ kind: "tag", label: t[0], desc: t[1], pr: t[2], void: !!D.VOID[t[0]] }); });
            return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
        }
        /* 标签内部：属性 / 属性值 */
        var tc = inTagContext(before);
        if (tc && tc.tag && !tc.inQuote) {
            if ((m = /([\w-]*)$/.exec(before)) && (m[1] || manual)) {
                prefix = m[1];
                D.ATTRS_GLOBAL.forEach(function (a) { items.push({ kind: "attr", label: a[0], desc: a[1], pr: a[2] }); });
                (D.ATTRS_BY_TAG[tc.tag.toLowerCase()] || []).forEach(function (a) { items.push({ kind: "attr", label: a[0], desc: a[1], pr: a[2], tag: true }); });
                return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
            }
        }
        if (tc && tc.tag && (m = /=\s*"([^"]*)$/.exec(before))) {
            prefix = m[1];
            var vals = [];
            var attrM = /([\w-]+)\s*=\s*"[^"]*$/.exec(before);
            if (attrM) vals = D.ATTR_VALS[attrM[1]] || [];
            vals.forEach(function (v, i) { items.push({ kind: "aval", label: v, text: v, desc: "取值", pr: i }); });
            return { items: filterItems(items, prefix, true), prefix: prefix, rawPrefix: prefix };
        }
        if (tc && tc.tag && (m = /=\s*'([^']*)$/.exec(before))) {
            prefix = m[1];
            var vals2 = [];
            var attrM2 = /([\w-]+)\s*=\s*'[^']*$/.exec(before);
            if (attrM2) vals2 = D.ATTR_VALS[attrM2[1]] || [];
            vals2.forEach(function (v, i) { items.push({ kind: "aval", label: v, text: v, desc: "取值", pr: i }); });
            return { items: filterItems(items, prefix, true), prefix: prefix, rawPrefix: prefix };
        }
        /* 正文：两个字母以上 → 常用标签快速提示 */
        if ((m = /(?:^|[>\s])([a-zA-Z][\w-]*)$/.exec(before)) && (m[1].length >= 2 || manual)) {
            prefix = m[1];
            D.TAGS.forEach(function (t) {
                if (t[2] <= 1) items.push({ kind: "tag", label: t[0], desc: t[1], pr: t[2] + 1, void: !!D.VOID[t[0]] });
            });
            return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
        }
        return null;
    }

    if (lang === "css") {
        var c;
        var lastBrace = Math.max(before.lastIndexOf("{"), before.lastIndexOf("}"));
        var inBlock = before.lastIndexOf("{") > before.lastIndexOf("}");
        if ((c = /@([\w-]*)$/.exec(before)) && !inBlock) {
            prefix = c[1];
            D.CSS_AT.forEach(function (a) { items.push({ kind: "at", label: a[0], text: a[0].slice(1) + " ", desc: a[1], pr: a[2] }); });
            return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
        }
        if (inBlock) {
            if ((c = /:([^;{}]*)$/.exec(before))) {
                prefix = c[1].trim();
                var propM = /([\w-]+)\s*:\s*[^;{}]*$/.exec(before);
                var prop = propM ? propM[1] : "";
                var list = D.CSS_VALS[prop] || [];
                list.forEach(function (v, i) { items.push({ kind: "val", label: v, text: v, desc: prop + " 的值", pr: i }); });
                D.CSS_GENERIC_VALS.forEach(function (v, i) { items.push({ kind: "val", label: v, text: v, desc: "通用值", pr: 20 + i }); });
                return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
            }
            if ((c = /([\w-]+)$/.exec(before))) {
                prefix = c[1];
                D.CSS_PROPS.forEach(function (p) { items.push({ kind: "prop", label: p[0], text: p[0] + ": ", desc: p[1], pr: p[2] }); });
                return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
            }
        } else {
            if ((c = /:([\w-]*)$/.exec(before))) {
                prefix = c[1];
                D.CSS_PSEUDO.forEach(function (p) { items.push({ kind: "pseudo", label: p[0], text: p[0].slice(1), desc: p[1], pr: p[2] }); });
                return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
            }
            if (manual) {
                D.CSS_PSEUDO.forEach(function (p) { items.push({ kind: "pseudo", label: p[0], text: p[0].slice(1), desc: p[1], pr: p[2] }); });
                D.CSS_AT.forEach(function (a) { items.push({ kind: "at", label: a[0], text: a[0].slice(1) + " ", desc: a[1], pr: a[2] }); });
                return { items: filterItems(items, ""), prefix: "", rawPrefix: "" };
            }
        }
        return null;
    }

    /* JavaScript */
    var j;
    if ((j = /\.([\w$]*)$/.exec(before))) {
        prefix = j[1];
        var objM = /([\w$]+)\s*\.[\w$]*$/.exec(before);
        var obj = objM ? objM[1] : "";
        var list = D.JS_MEMBERS[obj] || D.JS_MEMBERS.element;
        var FN_PROPS = { body: 1, title: 1, value: 1, id: 1, innerWidth: 1, innerHeight: 1, PI: 1, location: 1, style: 1, classList: 1, textContent: 1, innerHTML: 1 };
        list.forEach(function (mb) {
            var isFn = !FN_PROPS[mb[0]];
            items.push({ kind: "member", label: mb[0], text: mb[0] + (isFn ? "()" : ""), cursorBack: isFn ? 1 : 0, desc: mb[1], pr: mb[2] });
        });
        return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
    }
    if ((j = /([A-Za-z_$][\w$]*)$/.exec(before))) {
        prefix = j[1];
        D.JS_KW.forEach(function (k) { items.push({ kind: "kw", label: k[0], text: k[0] + " ", desc: k[1], pr: k[2] }); });
        D.JS_GLOB.forEach(function (g) { items.push({ kind: "glob", label: g[0], text: g[0], desc: g[1], pr: g[2] }); });
        D.JS_SNIPS.forEach(function (sp) { items.push({ kind: "snip", label: sp[0], text: sp[2], desc: sp[1], pr: sp[3], cursorBack: 0 }); });
        return { items: filterItems(items, prefix), prefix: prefix, rawPrefix: prefix };
    }
    return null;
}

function filterItems(items, prefix, keepAll) {
    if (!prefix) return items.slice().sort(function (a, b) { return a.pr - b.pr || (a.label < b.label ? -1 : 1); });
    var p = prefix.toLowerCase();
    var out = [];
    items.forEach(function (it) {
        var l = it.label.toLowerCase();
        var sc = -1;
        if (l === p) sc = 0;
        else if (l.indexOf(p) === 0) sc = 1;
        else if (l.indexOf(p) > 0) sc = 2;
        else {
            var ok = true, idx = -1;
            for (var i = 0; i < p.length; i++) {
                idx = l.indexOf(p[i], idx + 1);
                if (idx < 0) { ok = false; break; }
            }
            if (ok) sc = 3;
        }
        if (sc >= 0) { it._sc = sc; out.push(it); }
    });
    out.sort(function (a, b) { return a._sc - b._sc || a.pr - b.pr || (a.label < b.label ? -1 : 1); });
    return keepAll ? out : out;
}

function acRender() {
    var h = "";
    ac.items.forEach(function (it, i) {
        h += '<div class="aci' + (i === ac.sel ? " sel" : "") + '" data-i="' + i + '">' +
            '<span class="k">' + IK(it.kind) + "</span>" +
            '<span class="l">' + esc(it.label) + "</span>" +
            '<span class="d">' + esc(it.desc || "") + "</span></div>";
    });
    acList.innerHTML = h;
    acEl.classList.add("on");
    ac.on = true;
    acPos();
    var selEl = acList.querySelector(".aci.sel");
    if (selEl) selEl.scrollIntoView({ block: "nearest" });
}

function acPos() {
    var pos = ta.selectionStart;
    var before = ta.value.slice(0, pos);
    var col = pos - before.lastIndexOf("\n") - 1;
    var ln = (before.match(/\n/g) || []).length;
    var r = scrollEl.getBoundingClientRect();
    var x = r.left + padX + col * charW - ta.scrollLeft;
    var y = r.top + padY + (ln + 1) * lineH - ta.scrollTop;
    var w = 360;
    if (x + w > window.innerWidth - 12) x = window.innerWidth - w - 12;
    if (x < 8) x = 8;
    var bottom = y + 316 > window.innerHeight - 28;
    if (bottom) y = r.top + padY + ln * lineH - ta.scrollTop - 316;
    if (y < 52) y = 52;
    acEl.style.left = x + "px";
    acEl.style.top = y + "px";
}

function acMove(d) {
    if (!ac.items.length) return;
    ac.sel = (ac.sel + d + ac.items.length) % ac.items.length;
    var selEl = acList.querySelector(".aci.sel");
    if (selEl) selEl.scrollIntoView({ block: "nearest" });
    $$(".aci", acList).forEach(function (el, i) { el.classList.toggle("sel", i === ac.sel); });
}
function acClose() { acEl.classList.remove("on"); ac.on = false; }

function acAccept() {
    if (!ac.on || !ac.items.length) { acClose(); return; }
    var it = ac.items[ac.sel];
    acClose();
    var s = ac.start, e = ac.end;
    var lang = langAtCursor();

    if (it.kind === "tag") {
        if (it.void) {
            replaceRange(s - 1, e, "<" + it.label + ">", ("<" + it.label + ">").length);
        } else {
            var open = "<" + it.label + ">";
            var full = open + "</" + it.label + ">";
            replaceRange(s - 1, e, full, open.length);
        }
        return;
    }
    if (it.kind === "ctag") {
        replaceRange(s - 2, e, "</" + it.label + ">", ("</" + it.label + ">").length);
        return;
    }
    if (it.kind === "attr") {
        var noVal = { hidden: 1, required: 1, checked: 1, disabled: 1, controls: 1, loop: 1, muted: 1, autoplay: 1, open: 1, multiple: 1, reversed: 1, defer: 1, async: 1, download: 1, novalidate: 1 };
        if (noVal[it.label]) replaceRange(s, e, it.label + " ", it.label.length + 1);
        else replaceRange(s, e, it.label + '=""', it.label.length + 2);
        return;
    }
    if (it.kind === "aval") {
        replaceRange(s, e, it.text, it.text.length);
        return;
    }
    if (it.kind === "ent") {
        replaceRange(s - 1, e, it.text, it.text.length);
        return;
    }
    if (it.kind === "prop") {
        replaceRange(s, e, it.text, it.text.length);
        return;
    }
    if (it.kind === "val") {
        var after = ta.value.slice(e);
        var addSemi = !/^\s*[;}]/.test(after) && it.text !== "inherit" && it.text !== "initial" && it.text !== "unset" || false;
        var txt = it.text + (/^\s*[;}]/.test(after) ? "" : "");
        replaceRange(s, e, txt, txt.length);
        return;
    }
    if (it.kind === "pseudo" || it.kind === "at") {
        replaceRange(s, e, it.text, it.text.length);
        return;
    }
    if (it.kind === "kw") {
        replaceRange(s, e, it.text, it.text.length);
        return;
    }
    if (it.kind === "member" || it.kind === "snip") {
        var txt = it.text || it.label;
        var bar = txt.indexOf("¦");
        if (bar >= 0) {
            var clean = txt.replace("¦", "");
            replaceRange(s, e, clean, bar);
        } else {
            replaceRange(s, e, txt, txt.length - (it.cursorBack || 0));
        }
        return;
    }
    replaceRange(s, e, it.text || it.label, (it.text || it.label).length);
}

acList.addEventListener("mousedown", function (e) {
    var el = e.target.closest(".aci");
    if (!el) return;
    e.preventDefault();
    ac.sel = parseInt(el.getAttribute("data-i"), 10);
    acAccept();
});
acList.addEventListener("mousemove", function (e) {
    var el = e.target.closest(".aci");
    if (!el) return;
    var i = parseInt(el.getAttribute("data-i"), 10);
    if (i !== ac.sel) {
        ac.sel = i;
        $$(".aci", acList).forEach(function (n, k) { n.classList.toggle("sel", k === i); });
    }
});

/* ==================== 查找替换 ==================== */
var findState = { q: "", matches: [], idx: -1 };
function openFind(rep) {
    findbar.classList.add("on");
    if (rep) findbar.classList.add("rep"); else findbar.classList.remove("rep");
    var sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    if (sel && sel.indexOf("\n") < 0 && !fbQ.value) fbQ.value = sel;
    fbQ.focus(); fbQ.select();
    findUpdate();
}
function closeFind() {
    findbar.classList.remove("on");
    findState = { q: "", matches: [], idx: -1 };
    renderFind();
    ta.focus();
}
function findUpdate() {
    var q = fbQ.value;
    findState.q = q;
    findState.matches = [];
    findState.idx = -1;
    if (q) {
        var low = ta.value.toLowerCase(), ql = q.toLowerCase();
        var i = 0;
        while ((i = low.indexOf(ql, i)) >= 0 && findState.matches.length < 800) {
            findState.matches.push([i, i + q.length]);
            i += Math.max(1, q.length);
        }
        if (findState.matches.length) {
            var pos = ta.selectionStart;
            for (var m = 0; m < findState.matches.length; m++) {
                if (findState.matches[m][0] >= pos) { findState.idx = m; break; }
            }
            if (findState.idx < 0) findState.idx = 0;
        }
    }
    renderFind();
    updateFindCount();
}
function updateFindCount() {
    var n = findState.matches.length;
    $("#fb-count").textContent = n ? ((findState.idx + 1) + "/" + n) : "0/0";
}
function renderFind() {
    if (!findState.q) { findLayer.innerHTML = ""; return; }
    var v = ta.value, h = "";
    findState.matches.forEach(function (mm, i) {
        var before = v.slice(0, mm[0]);
        var line = (before.match(/\n/g) || []).length;
        var col = mm[0] - before.lastIndexOf("\n") - 1;
        var y = padY + line * lineH;
        var x = padX + col * charW;
        h += '<div class="fhit' + (i === findState.idx ? " cur" : "") + '" style="left:' + x + "px;top:" + y + "px;width:" + (mm[1] - mm[0]) * charW + 'px;height:' + lineH + 'px"></div>';
    });
    findLayer.innerHTML = h;
}
function findGo(d) {
    var n = findState.matches.length;
    if (!n) return;
    findState.idx = (findState.idx + d + n) % n;
    var mm = findState.matches[findState.idx];
    ta.focus();
    ta.setSelectionRange(mm[0], mm[1]);
    var before = ta.value.slice(0, mm[0]);
    var line = (before.match(/\n/g) || []).length;
    var target = padY + line * lineH - ta.clientHeight / 2;
    ta.scrollTop = Math.max(0, target);
    renderFind();
    updateFindCount();
    updateCurLine();
    updatePos();
}
function replaceOne() {
    if (findState.idx < 0 || !findState.matches.length) return;
    var mm = findState.matches[findState.idx];
    pushUndo();
    ta.value = ta.value.slice(0, mm[0]) + fbR.value + ta.value.slice(mm[1]);
    onEdit();
    findUpdate();
    toast("已替换 1 处");
}
function replaceAll() {
    if (!fbQ.value) return;
    var re = new RegExp(fbQ.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    var n = findState.matches.length;
    if (!n) { toast("没有匹配项"); return; }
    pushUndo();
    ta.value = ta.value.replace(re, fbR.value);
    onEdit();
    findUpdate();
    toast("已替换 " + n + " 处");
}
fbQ.addEventListener("input", debounce(findUpdate, 120));
fbQ.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); findGo(e.shiftKey ? -1 : 1); }
    if (e.key === "Escape") closeFind();
});
fbR.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); replaceOne(); }
    if (e.key === "Escape") closeFind();
});
$("#fb-prev").addEventListener("click", function () { findGo(-1); });
$("#fb-next").addEventListener("click", function () { findGo(1); });
$("#fb-close").addEventListener("click", closeFind);
$("#fb-rep").addEventListener("click", replaceOne);
$("#fb-repall").addEventListener("click", replaceAll);

/* ==================== 预览 ==================== */
var live = true;
var BRIDGE = '<script>(function(){function f(a){try{return typeof a==="object"&&a!==null?JSON.stringify(a):String(a)}catch(e){return String(a)}}["log","warn","error","info"].forEach(function(k){var o=console[k];console[k]=function(){try{parent.postMessage({__ide:1,k:k,m:Array.prototype.map.call(arguments,f).join(" ")},"*")}catch(e){}o&&o.apply(console,arguments)}});window.addEventListener("error",function(e){try{parent.postMessage({__ide:1,k:"error",m:e.message+"（第 "+(e.lineno||"?")+" 行）"},"*")}catch(x){}})})()<\/script>';

function assemble() {
    var h = files.html.value;
    var css = files.css.value.trim(), js = files.js.value.trim();
    var out = h;
    if (css) {
        var tag = "<style>\n" + css + "\n</style>\n";
        if (/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, function () { return tag + "</head>"; });
        else if (/<body[^>]*>/i.test(out)) out = out.replace(/<body([^>]*)>/i, function (m, a) { return "<body" + a + ">\n" + tag; });
        else out = tag + out;
    }
    if (js) {
        var stag = "<script>\n" + js + "\n<\/script>\n";
        if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, function () { return stag + "</body>"; });
        else out += "\n" + stag;
    }
    return out;
}
function runPreview() {
    pvFrame.srcdoc = BRIDGE + assemble();
    pvState.textContent = live ? "● 实时" : "● 手动运行";
}
var scheduleRun = debounce(function () { if (live) runPreview(); }, 700);

window.addEventListener("message", function (e) {
    if (!e.data || !e.data.__ide) return;
    var d = e.data;
    var row = document.createElement("div");
    row.className = "clr " + (d.k === "info" ? "log" : d.k);
    var t = new Date();
    row.innerHTML = '<span class="t">' + pad2(t.getHours()) + ":" + pad2(t.getMinutes()) + ":" + pad2(t.getSeconds()) + " " + d.k + '</span><span class="m">' + esc(d.m) + "</span>";
    pnBody.appendChild(row);
    pnBody.scrollTop = pnBody.scrollHeight;
    updatePnCount();
});
function panelCount() { return pnBody.querySelectorAll(".clr").length; }
function updatePnCount() {
    var n = panelCount();
    pnCount.textContent = n ? n + " 条" : "";
}
$("#pn-clear").addEventListener("click", function () { pnBody.innerHTML = ""; updatePnCount(); });
$("#pn-hide").addEventListener("click", togglePanel);

$("#btn-run").addEventListener("click", runPreview);
$("#btn-live").addEventListener("click", function () {
    live = !live;
    this.classList.toggle("on", !live);
    pvDot.classList.toggle("off", !live);
    pvState.classList.toggle("off", !live);
    pvState.textContent = live ? "● 实时" : "‖ 已暂停";
    if (live) runPreview();
    toast(live ? "实时预览已开启" : "实时预览已暂停（Ctrl+Enter 仍可手动运行）");
});
$("#pv-device").addEventListener("change", function () {
    var w = parseInt(this.value, 10);
    if (w) {
        pvBody.classList.add("framed");
        var holder = pvBody.querySelector(".pv-frame-holder");
        holder.style.width = w + "px";
        holder.style.setProperty("--pv-r", "14px");
    } else {
        pvBody.classList.remove("framed");
    }
});

/* ==================== 状态 / Toast ==================== */
var msgTimer = null;
function status(msg) {
    stMsg.textContent = msg;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { stMsg.textContent = ""; }, 3500);
}
function updatePos() {
    var pos = ta.selectionStart;
    var before = ta.value.slice(0, pos);
    var line = (before.match(/\n/g) || []).length + 1;
    var col = pos - before.lastIndexOf("\n");
    stPos.textContent = "行 " + line + ", 列 " + col;
}
function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast-i";
    el.textContent = msg;
    toastEl.appendChild(el);
    setTimeout(function () { el.classList.add("out"); }, 2200);
    setTimeout(function () { el.remove(); }, 2550);
}

/* ==================== 变更联动 ==================== */
function onEdit() {
    CF().value = ta.value;
    render();
    updatePos();
    CF().dirty = true;
    refreshDirtyUI();
    saveDraftDebounced();
    scheduleRun();
    updateBc();
}
function refreshDirtyUI() {
    $$(".etab", tabsEl).forEach(function (el) {
        var f = files[el.getAttribute("data-f")];
        el.classList.toggle("dirty", !!f.dirty);
    });
    $$(".frow").forEach(function (el) {
        var f = files[el.getAttribute("data-f")];
        el.classList.toggle("dirty", !!f.dirty);
    });
}
var saveDraftDebounced = debounce(function () {
    LS("draft", {
        files: { html: files.html.value, css: files.css.value, js: files.js.value },
        sampleId: sampleId, ts: Date.now()
    });
}, 800);

/* ==================== 文件 / 标签页 ==================== */
function openFile(key) {
    if (key === cur) return;
    files[cur].value = ta.value;
    cur = key;
    var f = CF();
    ta.value = f.value;
    lastLineCount = -1;
    ta.scrollTop = 0; ta.scrollLeft = 0;
    acClose();
    closeFindSilent();
    findState = { q: "", matches: [], idx: -1 };
    render();
    syncScroll();
    updateTabs();
    updateBc();
    updateLangStatus();
    refreshDirtyUI();
    ta.focus();
    updatePos();
}
function closeFindSilent() { findbar.classList.remove("on"); }
function updateTabs() {
    var h = "";
    ["html", "css", "js"].forEach(function (k) {
        var f = files[k];
        h += '<div class="etab' + (k === cur ? " on" : "") + (f.dirty ? " dirty" : "") + '" data-f="' + k + '">' +
            '<span class="fico ' + f.cls + '">' + f.icon + "</span>" + f.name + '<span class="fdot"></span></div>';
    });
    h += '<div class="ed-tabs-x"></div>';
    tabsEl.innerHTML = h;
    $$(".etab", tabsEl).forEach(function (el) {
        el.addEventListener("click", function () { openFile(el.getAttribute("data-f")); });
    });
}
function updateBc() {
    var f = CF();
    bcEl.innerHTML = "<b>我的练习场</b><i>›</i><b>" + f.name + "</b>";
}
function updateLangStatus() {
    stLang.textContent = cur === "html" ? "HTML" : cur === "css" ? "CSS" : "JavaScript";
}

/* ==================== 示例载入 ==================== */
function splitDoc(src) {
    var css = "", js = "";
    var rest = src.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function (m, c) { css += c + "\n"; return ""; });
    rest = rest.replace(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi, function (m, c) { js += c + "\n"; return ""; });
    return { html: rest.trim(), css: css.trim(), js: js.trim() };
}
function loadSample(id, quiet) {
    var s = null;
    D.SAMPLES.forEach(function (x) { if (x.id === id) s = x; });
    if (!s) return;
    var parts = splitDoc(s.html);
    files.html.value = parts.html; files.html.saved = parts.html; files.html.undo = []; files.html.redo = [];
    files.css.value = parts.css; files.css.saved = parts.css; files.css.undo = []; files.css.redo = [];
    files.js.value = parts.js; files.js.saved = parts.js; files.js.undo = []; files.js.redo = [];
    ["html", "css", "js"].forEach(function (k) { files[k].dirty = false; });
    sampleId = id;
    if (cur !== "html") { cur = "html"; }
    ta.value = files.html.value;
    lastLineCount = -1;
    ta.scrollTop = 0;
    render(); syncScroll();
    updateTabs(); updateBc(); updateLangStatus(); refreshDirtyUI();
    renderSidebar();
    pnBody.innerHTML = ""; updatePnCount();
    runPreview();
    if (!quiet) { toast("已载入示例：" + s.name); status("示例：" + s.name + " · " + s.chapter); }
    LS("draft", { files: { html: files.html.value, css: files.css.value, js: files.js.value }, sampleId: id, ts: Date.now() });
}
function newBlank() {
    files.html.value = BLANK; files.html.saved = BLANK;
    files.css.value = ""; files.css.saved = "";
    files.js.value = ""; files.js.saved = "";
    ["html", "css", "js"].forEach(function (k) { files[k].undo = []; files[k].redo = []; files[k].dirty = false; });
    sampleId = null;
    cur = "html"; ta.value = BLANK; lastLineCount = -1;
    render(); syncScroll(); updateTabs(); updateBc(); updateLangStatus(); refreshDirtyUI();
    renderSidebar();
    runPreview();
    toast("已新建空白练习");
    LS("draft", { files: { html: BLANK, css: "", js: "" }, sampleId: null, ts: Date.now() });
}
var BLANK = [
    "<!DOCTYPE html>",
    '<html lang="zh-CN">',
    "<head>",
    '  <meta charset="UTF-8">',
    "  <title>我的练习</title>",
    "</head>",
    "<body>",
    "  <h1>我的练习</h1>",
    "  <p>开始写点什么吧，右侧会实时显示效果。</p>",
    "</body>",
    "</html>"
].join("\n");

/* ==================== 复习示例（本地保存） ==================== */
function reviews() { return LS("reviews") || []; }
function saveReviews(list) { LS("reviews", list); }
function saveReview() {
    files[cur].value = ta.value;
    var name = ($("#rv-name") && $("#rv-name").value.trim()) || "";
    var list = reviews();
    var target = null;
    if (name) {
        list.forEach(function (r) { if (r.name === name) target = r; });
    } else {
        var src = null;
        D.SAMPLES.forEach(function (x) { if (x.id === sampleId) src = x; });
        name = src ? src.name + " · 我的版本" : "练习 " + nowStr();
        list.forEach(function (r) { if (r.name === name) target = r; });
    }
    if (!target) {
        target = { id: "r" + Date.now(), name: name, ts: Date.now(), sampleId: sampleId };
        list.unshift(target);
    }
    target.files = { html: files.html.value, css: files.css.value, js: files.js.value };
    target.ts = Date.now();
    saveReviews(list);
    ["html", "css", "js"].forEach(function (k) { files[k].saved = files[k].value; files[k].dirty = false; });
    refreshDirtyUI();
    renderSidebar();
    updateActivityBadge();
    toast("已保存到【复习示例】：" + name);
    status("已保存：" + name);
}
function openReview(id) {
    var r = null;
    reviews().forEach(function (x) { if (x.id === id) r = x; });
    if (!r) return;
    files.html.value = r.files.html; files.html.saved = r.files.html; files.html.undo = []; files.html.redo = [];
    files.css.value = r.files.css || ""; files.css.saved = r.files.css || "";
    files.js.value = r.files.js || ""; files.js.saved = r.files.js || "";
    ["html", "css", "js"].forEach(function (k) { files[k].dirty = false; });
    sampleId = r.sampleId || null;
    cur = "html"; ta.value = files.html.value; lastLineCount = -1;
    render(); syncScroll(); updateTabs(); updateBc(); updateLangStatus(); refreshDirtyUI();
    renderSidebar();
    runPreview();
    toast("已打开复习示例：" + r.name);
    LS("draft", { files: { html: files.html.value, css: files.css.value, js: files.js.value }, sampleId: sampleId, ts: Date.now() });
}
function deleteReview(id) {
    saveReviews(reviews().filter(function (r) { return r.id !== id; }));
    renderSidebar();
    updateActivityBadge();
    toast("已删除");
}

/* ==================== 主题 ==================== */
function applyTheme(id) {
    document.body.setAttribute("data-theme", id);
    LS("theme", id);
    var name = "Dark+ 经典";
    D.THEMES.forEach(function (t) { if (t.id === id) name = t.name; });
    stTheme.textContent = name;
    drawMini(miniLines);
    renderSidebar();
}
function currentTheme() { return document.body.getAttribute("data-theme"); }

/* ==================== 侧边栏 ==================== */
var ACT = [
    { id: "explorer", title: "资源管理器", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>' },
    { id: "samples", title: "章节示例", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>' },
    { id: "review", title: "复习示例", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"/></svg>', badge: true },
    { id: "theme", title: "主题外观", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c1.6 0 2.4-1 1.6-2.2-.9-1.4.2-2.8 1.8-2.8H19a2 2 0 0 0 2-2.2A9 9 0 0 0 12 3Z"/><circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none"/></svg>' },
    { id: "help", title: "帮助", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.8.35-1 .9-1 1.8"/><circle cx="12" cy="16.8" r=".4" fill="currentColor"/></svg>' }
];
var sbView = "samples";

function buildActivity() {
    var el = $("#activity");
    var h = "";
    ACT.forEach(function (a) {
        h += '<button class="ab-btn' + (a.id === sbView ? " on" : "") + '" data-v="' + a.id + '" title="' + a.title + '">' + a.svg + (a.badge ? '<span class="ab-badge" id="act-badge" style="display:none"></span>' : "") + "</button>";
    });
    h += '<span class="ab-sp"></span>';
    el.innerHTML = h;
    $$(".ab-btn", el).forEach(function (b) {
        b.addEventListener("click", function () {
            var v = b.getAttribute("data-v");
            if (v === "help") { openModal(); return; }
            if (sbView === v && !sbEl.classList.contains("hidden")) { toggleSidebar(); return; }
            sbView = v;
            $$(".ab-btn", el).forEach(function (x) { x.classList.toggle("on", x === b); });
            sbEl.classList.remove("hidden");
            renderSidebar();
        });
    });
    updateActivityBadge();
}
function updateActivityBadge() {
    var b = $("#act-badge");
    if (!b) return;
    var n = reviews().length;
    b.style.display = n ? "grid" : "none";
    b.textContent = n > 99 ? "99+" : n;
}
function renderSidebar() {
    sbTitle.textContent = ({ explorer: "资源管理器", samples: "章节示例", review: "复习示例", theme: "主题外观" })[sbView] || "资源管理器";
    $$(".sb-view", sbScroll).forEach(function (v) { v.classList.toggle("on", v.getAttribute("data-view") === sbView); });
    var host = $('.sb-view[data-view="' + sbView + '"]', sbScroll);
    if (!host) return;
    if (sbView === "explorer") host.innerHTML = explorerHTML();
    if (sbView === "samples") host.innerHTML = samplesHTML();
    if (sbView === "review") host.innerHTML = reviewHTML();
    if (sbView === "theme") host.innerHTML = themeHTML();
}
function explorerHTML() {
    var h = '<div class="tree-proj"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>我的练习场</div>';
    ["html", "css", "js"].forEach(function (k) {
        var f = files[k];
        h += '<div class="frow' + (k === cur ? " on" : "") + (f.dirty ? " dirty" : "") + '" data-f="' + k + '"><span class="fico ' + f.cls + '">' + f.icon + "</span>" + f.name + '<span class="fdot"></span></div>';
    });
    h += '<div class="sb-note">三文件会被自动拼装成完整页面：<b>index.html</b> 放结构，<b>style.css</b> 的内容注入 <code>&lt;style&gt;</code>，<b>script.js</b> 注入 <code>&lt;script&gt;</code>。编辑内容会<b>自动保存</b>在浏览器里，刷新不丢。</div>';
    return h;
}
function samplesHTML() {
    var prog = LS("progress") || {};
    var h = "";
    D.GROUPS.forEach(function (g, gi) {
        h += '<div class="sgrp"><div class="sgrp-h">' + g + "</div>";
        D.SAMPLES.forEach(function (s) {
            if (s.group !== gi) return;
            h += '<div class="sitem' + (s.id === sampleId ? " on" : "") + '" data-s="' + s.id + '">';
            h += '<div class="sitem-t">' + s.name + "</div>";
            h += '<div class="stags">';
            s.tags.forEach(function (t) { h += '<span class="stag">' + t + "</span>"; });
            h += "</div>";
            var done = prog[s.id] || [];
            h += '<div class="goals">';
            s.goals.forEach(function (gl, i) {
                h += '<div class="goal' + (done[i] ? " ok" : "") + '" data-g="' + i + '"><span class="gchk">' + SVG_CHK + "</span>" + gl + "</div>";
            });
            h += "</div></div>";
        });
        h += "</div>";
    });
    h += '<div class="sb-note">每个示例都列出<b>练习目标</b>，点击圆圈可勾选，进度保存在本地。选中示例后随意改代码，<b>Ctrl+S</b> 存进复习示例。</div>';
    return h;
}
function reviewHTML() {
    var list = reviews();
    var h = '<div class="rv-save"><input id="rv-name" type="text" placeholder="给当前练习起个名字（可留空）"><button class="rv-btn" id="rv-save-btn">保存</button></div>';
    if (!list.length) {
        h += '<div class="rv-empty">还没有保存的练习。<br>编辑任意示例后按 <b>Ctrl+S</b>，<br>或输入名字点「保存」。<br>刷新页面也不会丢。</div>';
    }
    list.forEach(function (r) {
        var lines = (r.files.html.match(/\n/g) || []).length + 1;
        var d = new Date(r.ts);
        h += '<div class="rv-item" data-r="' + r.id + '">' +
            '<div class="rv-name">' + esc(r.name) + "</div>" +
            '<div class="rv-meta">' + (d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + " · " + lines + " 行</div>" +
            '<div class="rv-ops"><button class="rv-op" data-op="open">打开</button><button class="rv-op" data-op="rename">重命名</button><button class="rv-op danger" data-op="del">删除</button></div>' +
            "</div>";
    });
    return h;
}
function themeHTML() {
    var h = "";
    D.THEMES.forEach(function (t) {
        h += '<div class="thc' + (t.id === currentTheme() ? " on" : "") + '" data-t="' + t.id + '">';
        h += '<div class="thc-h"><span class="thc-t">' + t.name + '</span><span class="thc-tag">当前</span></div>';
        h += '<div class="thc-d">' + t.d + "</div>";
        h += '<div class="thc-sw">' + t.sw.map(function (c) { return "<i style='background:" + c + "'></i>"; }).join("") + "</div>";
        h += "</div>";
    });
    return h;
}
sbScroll.addEventListener("click", function (e) {
    var frow = e.target.closest(".frow");
    if (frow) { openFile(frow.getAttribute("data-f")); return; }
    var goal = e.target.closest(".goal");
    if (goal) {
        var item = goal.closest(".sitem");
        var sid = item.getAttribute("data-s");
        var gi = parseInt(goal.getAttribute("data-g"), 10);
        var prog = LS("progress") || {};
        var done = prog[sid] || [];
        done[gi] = !done[gi];
        prog[sid] = done;
        LS("progress", prog);
        goal.classList.toggle("ok", !!done[gi]);
        return;
    }
    var sitem = e.target.closest(".sitem");
    if (sitem && !e.target.closest(".goal")) { loadSample(sitem.getAttribute("data-s")); return; }
    var thc = e.target.closest(".thc");
    if (thc) { applyTheme(thc.getAttribute("data-t")); return; }
    var rvSave = e.target.closest("#rv-save-btn");
    if (rvSave) { saveReview(); return; }
    var op = e.target.closest(".rv-op");
    if (op) {
        var rid = op.closest(".rv-item").getAttribute("data-r");
        var act = op.getAttribute("data-op");
        if (act === "open") openReview(rid);
        if (act === "rename") {
            var list = reviews();
            list.forEach(function (r) {
                if (r.id === rid) {
                    var nn = prompt("重命名复习示例：", r.name);
                    if (nn && nn.trim()) { r.name = nn.trim(); saveReviews(list); renderSidebar(); toast("已重命名"); }
                }
            });
        }
        if (act === "del") {
            if (op.classList.contains("confirm")) deleteReview(rid);
            else { op.classList.add("confirm"); op.textContent = "确认删除"; setTimeout(function () { op.classList.remove("confirm"); op.textContent = "删除"; }, 2500); }
        }
    }
});
sbScroll.addEventListener("keydown", function (e) {
    if (e.target.id === "rv-name" && e.key === "Enter") { e.preventDefault(); saveReview(); }
});
$("#sb-close").addEventListener("click", toggleSidebar);
stTheme.style.cursor = "pointer";
stTheme.title = "切换主题外观";
stTheme.addEventListener("click", function () { switchView("theme"); });
function toggleSidebar() {
    sbEl.classList.toggle("hidden");
}
function togglePanel() {
    panelEl.classList.toggle("hide");
    setTimeout(function () { drawMini(miniLines); }, 50);
}

/* ==================== 菜单栏 ==================== */
function buildMenus() {
    var MENUS = [
        { t: "文件", items: [
            { t: "新建空白练习", fn: newBlank },
            { t: "浏览章节示例…", fn: function () { switchView("samples"); } },
            { sep: 1 },
            { t: "保存到复习示例", k: "Ctrl+S", fn: saveReview },
            { t: "下载当前页面", fn: downloadPage },
            { sep: 1 },
            { t: "立即运行", k: "Ctrl+Enter", fn: runPreview }
        ] },
        { t: "编辑", items: [
            { t: "撤销", k: "Ctrl+Z", fn: undo },
            { t: "重做", k: "Ctrl+Y", fn: redo },
            { sep: 1 },
            { t: "查找", k: "Ctrl+F", fn: function () { openFind(false); } },
            { t: "替换", k: "Ctrl+H", fn: function () { openFind(true); } },
            { sep: 1 },
            { t: "切换注释", k: "Ctrl+/", fn: toggleComment },
            { t: "复制当前行", k: "Ctrl+D", fn: duplicateLine },
            { t: "上移当前行", k: "Alt+↑", fn: function () { moveLine(-1); } },
            { t: "下移当前行", k: "Alt+↓", fn: function () { moveLine(1); } }
        ] },
        { t: "视图", items: [
            { t: "切换侧边栏", k: "Ctrl+B", fn: toggleSidebar },
            { t: "切换控制台", k: "Ctrl+J", fn: togglePanel },
            { t: "命令面板", k: "Ctrl+K", fn: openCmdk },
            { sep: 1 }].concat(D.THEMES.map(function (th) {
                return { t: "主题：" + th.name, fn: function () { applyTheme(th.id); } };
            }))
        },
        { t: "帮助", items: [
            { t: "快捷键与用法", fn: openModal },
            { t: "关于前端练习场", fn: function () { toast("前端练习场 · 离线网页版编辑器 · 数据保存在本浏览器"); } }
        ] }
    ];
    var host = $("#menus");
    var h = "";
    MENUS.forEach(function (m, i) {
        h += '<div class="menu" data-m="' + i + '"><button class="menu-btn">' + m.t + "</button><div class=\"menu-pop\">";
        m.items.forEach(function (it) {
            if (it.sep) { h += '<div class="mi-sep"></div>'; return; }
            h += '<div class="mi" data-act="' + it.t + '">' + it.t + (it.k ? " <kbd>" + it.k + "</kbd>" : "") + "</div>";
        });
        h += "</div></div>";
    });
    host.innerHTML = h;
    $$(".menu", host).forEach(function (menu, i) {
        var btn = $(".menu-btn", menu);
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var was = menu.classList.contains("on");
            $$(".menu", host).forEach(function (x) { x.classList.remove("on"); });
            if (!was) menu.classList.add("on");
        });
        menu.addEventListener("click", function (e) {
            var mi = e.target.closest(".mi");
            if (!mi) return;
            e.stopPropagation();
            menu.classList.remove("on");
            MENUS[i].items.forEach(function (it) { if (it.t === mi.getAttribute("data-act")) it.fn(); });
        });
    });
    document.addEventListener("click", function () {
        $$(".menu", host).forEach(function (x) { x.classList.remove("on"); });
    });
}
function switchView(v) {
    sbView = v;
    sbEl.classList.remove("hidden");
    $$(".ab-btn", $("#activity")).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === v); });
    renderSidebar();
}
function downloadPage() {
    var blob = new Blob([assemble()], { type: "text/html;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    var s = null;
    D.SAMPLES.forEach(function (x) { if (x.id === sampleId) s = x; });
    a.download = (s ? s.name : "我的练习") + ".html";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast("已下载当前页面 HTML");
}

/* ==================== 命令面板 ==================== */
var ck = { items: [], sel: 0 };
function cmdItems() {
    var out = [
        { k: "运行", d: "立即运行预览 Ctrl+Enter", fn: runPreview },
        { k: "保存到复习示例", d: "Ctrl+S · 本地持久保存", fn: saveReview },
        { k: "新建空白练习", d: "清空编辑器，从零开始", fn: newBlank },
        { k: "下载当前页面", d: "导出为 .html 文件", fn: downloadPage },
        { k: "切换侧边栏", d: "Ctrl+B", fn: toggleSidebar },
        { k: "切换控制台", d: "Ctrl+J", fn: togglePanel },
        { k: "查找", d: "Ctrl+F", fn: function () { openFind(false); } },
        { k: "替换", d: "Ctrl+H", fn: function () { openFind(true); } },
        { k: "快捷键帮助", d: "查看全部快捷键", fn: openModal },
        { k: "暂停/恢复实时预览", d: "切换自动运行", fn: function () { $("#btn-live").click(); } }
    ];
    D.THEMES.forEach(function (t) {
        out.push({ k: "主题：" + t.name, d: t.d, fn: function () { applyTheme(t.id); } });
    });
    D.SAMPLES.forEach(function (s) {
        out.push({ k: "示例：" + s.name, d: s.chapter + " · " + s.tags.join(" / "), fn: function () { loadSample(s.id); switchView("samples"); } });
    });
    reviews().forEach(function (r) {
        out.push({ k: "复习：" + r.name, d: "本地保存的练习", fn: function () { openReview(r.id); switchView("review"); } });
    });
    return out;
}
function openCmdk() {
    ck.items = cmdItems();
    ck.sel = 0;
    ckQ.value = "";
    ckRender();
    cmdk.classList.add("on");
    setTimeout(function () { ckQ.focus(); }, 30);
}
function ckFilter() {
    var q = ckQ.value.trim().toLowerCase();
    var items = ck.items;
    if (q) {
        items = items.filter(function (it) {
            var hay = (it.k + it.d).toLowerCase();
            var idx = -1, ok = true;
            for (var i = 0; i < q.length; i++) {
                idx = hay.indexOf(q[i], idx + 1);
                if (idx < 0) { ok = false; break; }
            }
            return ok || hay.indexOf(q) >= 0;
        });
    }
    return items.slice(0, 40);
}
function ckRender() {
    var items = ckFilter();
    if (!ckQ.value.trim()) items = items.slice(0, 14);
    if (ck.sel >= items.length) ck.sel = 0;
    var h = "";
    items.forEach(function (it, i) {
        h += '<div class="cki' + (i === ck.sel ? " sel" : "") + '" data-i="' + i + '"><span class="k">›</span>' + esc(it.k) + '<span class="d">' + esc(it.d) + "</span></div>";
    });
    if (!items.length) h = '<div class="ck-empty">没有匹配的命令</div>';
    ckList.innerHTML = h;
    ckList._items = items;
}
function ckRun() {
    var items = ckList._items || [];
    if (!items.length) return;
    cmdk.classList.remove("on");
    items[ck.sel].fn();
}
ckQ.addEventListener("input", function () { ck.sel = 0; ckRender(); });
ckQ.addEventListener("keydown", function (e) {
    var items = ckList._items || [];
    if (e.key === "ArrowDown") { e.preventDefault(); ck.sel = (ck.sel + 1) % Math.max(items.length, 1); ckRender(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); ck.sel = (ck.sel - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1); ckRender(); }
    else if (e.key === "Enter") { e.preventDefault(); ckRun(); }
    else if (e.key === "Escape") { cmdk.classList.remove("on"); ta.focus(); }
});
ckList.addEventListener("click", function (e) {
    var el = e.target.closest(".cki");
    if (!el) return;
    ck.sel = parseInt(el.getAttribute("data-i"), 10);
    ckRun();
});
cmdk.addEventListener("mousedown", function (e) { if (e.target === cmdk) cmdk.classList.remove("on"); });
$("#btn-palette").addEventListener("click", openCmdk);

/* ==================== 帮助弹窗 ==================== */
function openModal() {
    modalBody.innerHTML = [
        "<h4>智能补全（IntelliSense）</h4>",
        krow("输入 <d", "弹出 HTML 标签候选（一个字母即可）"),
        krow("标签内空格后", "属性候选；=\" 后是属性值候选"),
        krow("输入 &", "HTML 实体候选"),
        krow("CSS 属性 / 冒号后", "属性名 / 取值候选；: 后有伪类候选"),
        krow("JS 输入字母 / 点号后", "关键字、代码片段 / 对象成员候选"),
        krow("Tab / Enter", "接受选中的候选"),
        "<h4>标签自动补齐</h4>",
        krow("输入 <div 然后按 >", "自动补全 </div> 闭合"),
        krow("输入 </ ", "自动补全最近未闭合的标签"),
        krow("Tab（缩写）", "Emmet 展开：如 ul>li*3、div.card、a{文字}"),
        "<h4>编辑</h4>",
        krow("Ctrl+Z / Ctrl+Y", "撤销 / 重做"),
        krow("Ctrl+/", "切换注释（HTML/CSS/JS 各自语法）"),
        krow("Ctrl+D", "复制当前行"),
        krow("Alt+↑ / Alt+↓", "上移 / 下移当前行"),
        krow("Tab / Shift+Tab", "缩进 / 取消缩进（支持多行）"),
        krow("括号 / 引号", "自动配对，选中后输入则包裹"),
        "<h4>查找替换</h4>",
        krow("Ctrl+F / Ctrl+H", "查找 / 查找替换"),
        krow("F3 / Shift+F3", "下一个 / 上一个"),
        "<h4>运行与保存</h4>",
        krow("Ctrl+Enter", "立即运行"),
        krow("Ctrl+S", "保存到【复习示例】（本地存储，刷新不丢）"),
        "<h4>界面</h4>",
        krow("Ctrl+K", "命令面板（搜命令 / 示例 / 主题）"),
        krow("Ctrl+B / Ctrl+J", "切换侧边栏 / 控制台"),
        "<p style='margin-top:14px;color:var(--fg3)'>编辑内容自动暂存到浏览器 localStorage，刷新页面后自动恢复。三个文件（index.html / style.css / script.js）运行时自动拼装为完整页面。</p>"
    ].join("");
    modal.classList.add("on");
}
function krow(k, d) {
    return '<div class="kbd-row"><span>' + d + '</span><kbd>' + k + "</kbd></div>";
}
$("#modal-x").addEventListener("click", function () { modal.classList.remove("on"); });
modal.addEventListener("mousedown", function (e) { if (e.target === modal) modal.classList.remove("on"); });

/* ==================== 全局快捷键 ==================== */
window.addEventListener("keydown", function (e) {
    var mod = e.ctrlKey || e.metaKey;
    var inEditor = document.activeElement === ta;
    var inInput = ["INPUT", "TEXTAREA", "SELECT"].indexOf(document.activeElement.tagName) >= 0;

    if (mod && (e.key === "k" || e.key === "K")) { e.preventDefault(); openCmdk(); return; }
    if (e.key === "F3") { e.preventDefault(); if (findbar.classList.contains("on")) findGo(e.shiftKey ? -1 : 1); else openFind(false); return; }
    if (e.key === "Escape") {
        if (cmdk.classList.contains("on")) { cmdk.classList.remove("on"); return; }
        if (modal.classList.contains("on")) { modal.classList.remove("on"); return; }
        if (findbar.classList.contains("on") && !inEditor) { closeFind(); return; }
    }
    if (!inEditor) {
        if (!inInput && mod && (e.key === "z" || e.key === "Z")) { e.preventDefault(); ta.focus(); undo(); return; }
        if (!inInput && mod && (e.key === "y" || e.key === "Y")) { e.preventDefault(); ta.focus(); redo(); return; }
        if (mod && (e.key === "s" || e.key === "S") && document.activeElement.id !== "rv-name") { e.preventDefault(); saveReview(); return; }
        if (mod && e.key === "Enter") { e.preventDefault(); runPreview(); return; }
        if (mod && (e.key === "b" || e.key === "B")) { e.preventDefault(); toggleSidebar(); return; }
        if (mod && (e.key === "j" || e.key === "J")) { e.preventDefault(); togglePanel(); return; }
        return;
    }
    if (mod && (e.key === "b" || e.key === "B")) { e.preventDefault(); toggleSidebar(); return; }
    if (mod && (e.key === "j" || e.key === "J")) { e.preventDefault(); togglePanel(); return; }
});

/* ==================== 拖拽条 ==================== */
function bindGrip(grip, apply) {
    var dragging = false;
    grip.addEventListener("mousedown", function (e) {
        dragging = true;
        grip.classList.add("drag");
        document.body.style.userSelect = "none";
        e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
        if (dragging) apply(e);
    });
    window.addEventListener("mouseup", function () {
        if (dragging) {
            dragging = false;
            grip.classList.remove("drag");
            document.body.style.userSelect = "";
            drawMini(miniLines);
        }
    });
}
bindGrip($("#grip-sb"), function (e) {
    var w = e.clientX - 46;
    w = Math.max(190, Math.min(430, w));
    sbEl.style.width = w + "px";
});
bindGrip($("#grip-pv"), function (e) {
    var wrap = $("#ed-wrap");
    var w = window.innerWidth - e.clientX;
    w = Math.max(280, Math.min(window.innerWidth - 380, w));
    var ed = $(".ed");
    ed.style.flex = "none";
    ed.style.width = (window.innerWidth - w - 46 - (sbEl.classList.contains("hidden") ? 0 : sbEl.offsetWidth) - 4) + "px";
});

/* ==================== 窗口尺寸 ==================== */
window.addEventListener("resize", debounce(function () {
    drawMini(miniLines);
}, 120));

/* 刷新 / 关页前立即落盘草稿（防抖未到期也不丢） */
window.addEventListener("beforeunload", function () {
    CF().value = ta.value;
    LS("draft", { files: { html: files.html.value, css: files.css.value, js: files.js.value }, sampleId: sampleId, ts: Date.now() });
});

/* ==================== 初始化 ==================== */
function init() {
    buildMenus();
    buildActivity();

    /* 主题 */
    var th = LS("theme") || "dark";
    document.body.setAttribute("data-theme", th);
    D.THEMES.forEach(function (t) { if (t.id === th) stTheme.textContent = t.name; });

    /* 载入：本地草稿 优先 */
    var draft = LS("draft");
    if (draft && draft.files && (draft.files.html || draft.files.css || draft.files.js)) {
        files.html.value = draft.files.html || BLANK;
        files.css.value = draft.files.css || "";
        files.js.value = draft.files.js || "";
        ["html", "css", "js"].forEach(function (k) {
            files[k].saved = files[k].value;
            files[k].dirty = false;
        });
        sampleId = draft.sampleId || null;
        ta.value = files.html.value;
        status("已恢复上次编辑的内容");
        toast("已恢复上次编辑（本地自动保存）");
    } else {
        var first = D.SAMPLES[0];
        var parts = splitDoc(first.html);
        files.html.value = parts.html; files.css.value = parts.css; files.js.value = parts.js;
        ["html", "css", "js"].forEach(function (k) { files[k].saved = files[k].value; files[k].dirty = false; });
        sampleId = first.id;
        ta.value = files.html.value;
    }
    renderSidebar();
    updateTabs();
    updateBc();
    updateLangStatus();
    updatePos();
    render();
    syncScroll();
    measureFont();
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { measureFont(); render(); });
    }
    setTimeout(function () { runPreview(); updatePnCount(); }, 120);
    pvState.textContent = "● 实时";
    ta.focus();
}

init();
window.IDE_APP = {
    loadSample: loadSample, openFile: openFile, applyTheme: applyTheme,
    files: files, runPreview: runPreview, saveReview: saveReview
};
})();
