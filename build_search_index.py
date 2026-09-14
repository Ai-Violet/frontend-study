# -*- coding: utf-8 -*-
"""生成全站搜索离线索引 学习路线/assets/search-index.js

用法:  python build_search_index.py
什么时候跑：每次新增/编辑课时内容后重跑一次，搜索就能覆盖最新内容。
纯本地运行，不需要服务器；生成的 search-index.js 用 <script> 标签加载，
因此双击文件（file://）和本地服务器（http://）两种打开方式都能搜索。

索引条目与 learn.js 中原运行时抓取版完全同构：
  { u: 章节相对路径, a: 锚点(sec-N 或 空), ch: 章节名, lb: 课时名, t: 知识点标题, k: 全文小写关键字 }
"""
import os, re, json, glob

ROOT = r"d:\ProGramming\【我的前端学习】\2026新前端\学习路线"
OUT = os.path.join(ROOT, "assets", "search-index.js")

# (目录, 章节显示名)：顺序即学习顺序
CHAPTERS = [
    ("01-HTML基础", "HTML 基础"),
    ("02-CSS基础", "CSS 基础"),
    ("03-CSS布局", "CSS 布局"),
    ("04-CSS3进阶", "CSS3 进阶"),
]


def strip_blocks(html):
    """去掉注释与 <script>/<template>/<style>（内含实验代码，不应进搜索关键字）。"""
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    for tag in ("script", "template", "style"):
        html = re.sub(r"<%s\b.*?</%s>" % (tag, tag), "", html, flags=re.S | re.I)
    return html


def article_of(html):
    m = re.search(r'<article\b[^>]*class="[^"]*lx-article[^"]*"[^>]*>(.*)$', html, flags=re.S | re.I)
    return m.group(1) if m else html


def text_of(s):
    s = re.sub(r"<[^>]*>", "", s)
    for a, b in (("&nbsp;", " "), ("&lt;", "<"), ("&gt;", ">"),
                 ("&amp;", "&"), ("&quot;", '"'), ("&#39;", "'")):
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", s).strip()


def strip_sec_no(t):
    """剥掉“一、二、01.”等编号前缀。"""
    return re.sub(r"^[\s0-9一二三四五六七八九十、.]+", "", t).strip()


def entries_for(path, ch_name, rel):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    body = article_of(strip_blocks(html))
    idx = []

    # 页面级条目
    hm = re.search(r"<h1[^>]*>(.*?)</h1>", body, flags=re.S | re.I)
    cell_title = text_of(hm.group(1)) if hm else os.path.basename(path)
    title = re.sub(r"^\s*\d+\s*", "", cell_title).strip() or cell_title
    lesson_lb = ch_name if os.path.basename(path) == "index.html" else title
    page_k = (title + " " + text_of(body)).lower()
    idx.append({"u": rel, "a": "", "ch": ch_name, "lb": lesson_lb, "t": title, "k": page_k})

    # 各知识点小节，锚点 sec-N 与 initToc 的 id 规则一致
    sec = 0
    for m in re.finditer(r"<section\b[^>]*>(.*?)</section>", body, flags=re.S | re.I):
        sec += 1
        sl = m.group(1)
        hm2 = re.search(r"<h2[^>]*>(.*?)</h2>", sl, flags=re.S | re.I)
        tt = strip_sec_no(text_of(hm2.group(1))) if hm2 else "知识点 %d" % sec
        k = (tt + " " + text_of(sl)).lower()
        idx.append({"u": rel, "a": "sec-" + str(sec), "ch": ch_name, "lb": lesson_lb, "t": tt, "k": k})

    return idx


def main():
    allidx = []
    for ch_dir, ch_name in CHAPTERS:
        folder = os.path.join(ROOT, ch_dir)
        if not os.path.isdir(folder):
            continue
        for path in sorted(glob.glob(os.path.join(folder, "*.html"))):
            rel = ch_dir + "/" + os.path.basename(path)
            allidx.extend(entries_for(path, ch_name, rel))

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* 全站搜索索引：由 build_search_index.py 自动生成，请勿手改。改课时后重跑即可更新。 */\n")
        f.write("window.LX_SEARCH_INDEX = ")
        f.write(json.dumps(allidx, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")
    print("index entries:", len(allidx))
    print("wrote:", OUT)


if __name__ == "__main__":
    main()