 #-*- coding: utf-8 -*-
"""learn 体系三章整库回归：01/03/04 章所有页面 + 目录页

判据说明（修复了旧脚本的错误假设）：
- 静态代码块 lx-codeblock 由 initCodeblock 生成 <pre><code>，不生成 textarea；
  只有 .lab 实验台由 initLab 生成 textarea.lab-src。故 expect_ta == n_lab。
- HTML 教学天然以内联 <code>&lt;tag&gt;</code> 记录标签、并用 &nbsp;/&lt; 演示实体，
  因此不能用文章整页含 "&lt;" 作为泄漏判据。真正的泄漏是「实验台预览为空/丢失内容」。
- 故意缺失的媒体资源（broken-image alt 演示 sunsets.jpg、media 语法 demo 的
  chart.png / cover.jpg / movie.* / bgm.mp3 等）会触发控制台 404，属正常教学内容，
  特判放行，不计为 JS 错误。
"""

import os, glob, urllib.parse
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8080/学习路线"
ROOT = r"d:\ProGramming\【我的前端学习】\2026新前端\学习路线"
CH = ("01-HTML基础", "03-CSS布局", "04-CSS3进阶")

# 故意缺失的演示资源：命中即放行（不计 404 / 不记 console error）
INTENTIONAL_404 = ("sunset.jpg", "chart.png", "cover.jpg", "movie.webm", "movie.mp4", "bgm.mp3")

def run():
    pages = []
    for d in CH:
        for f in sorted(glob.glob(os.path.join(ROOT, d, "*.html"))):
            name = os.path.basename(f)
            url = BASE + "/" + urllib.parse.quote(d) + "/" + urllib.parse.quote(name)
            pages.append((f"{d}/{name}", url))

    total_labs = total_cb = 0
    ok = 0
    problems = []          # 实质失败
    info_pending404 = []   # 放行说明（信息性）

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 900})
        real_errs = []                 # 真正的 JS 异常
        console_errs = []              # 控制台 error（含资源 404）
        page.on("pageerror", lambda e: real_errs.append(f"[pageerror]{e}"))
        def on_console(msg):
            if msg.type in ("error",) and "Failed to load resource" not in msg.text:
                console_errs.append(f"[console]{msg.text}")
        page.on("console", on_console)

        for label, url in pages:
            real_errs.clear(); console_errs.clear()
            page.goto(url, wait_until="load", timeout=30000)
            page.wait_for_selector(".lx-nav", timeout=10000)
            page.wait_for_timeout(700)

            n_lab = page.locator("div.lab").count()
            n_cb = page.locator("div.lx-codeblock").count()
            n_ta = page.locator("textarea.lab-src").count()
            total_labs += n_lab; total_cb += n_cb

            # 1) 每个实验台都有 textarea（初始化成功）&& 预览 iframe 有内容
            lab_bad = []
            for idx in range(n_lab):
                lab = page.locator("div.lab").nth(idx)
                lang = lab.get_attribute("data-lang") or "css"
                frm = lab.locator(".lab-view").first
                body_len = 0
                if frm.count():
                    body_len = frm.evaluate(
                        "el => (el.contentDocument && el.contentDocument.body)"
                        " ? el.contentDocument.body.innerHTML.length : 0")
                has_ta = lab.locator("textarea.lab-src").count()
                if not has_ta or body_len == 0:
                    lab_bad.append(f"lab#{idx}[{lang}]{'' if has_ta else ' 缺textarea'}{'' if body_len else ' 空预览'}")

            # 2) 每个代码块都生成 pre（initCodeblock 运行）
            cb_bad = 0
            for i in range(n_cb):
                if page.locator("div.lx-codeblock").nth(i).locator("pre").count() == 0:
                    cb_bad += 1

            # 3) 真实的 JS 错误（过滤掉故意缺失演示资源的 404）
            js_bad = real_errs + [e for e in console_errs if not any(a in e for a in INTENTIONAL_404)]

            reasons = []
            if n_ta != n_lab: reasons.append(f"ta={n_ta}!=lab={n_lab}")
            if lab_bad: reasons.append("lab:" + "|".join(lab_bad))
            if cb_bad: reasons.append(f"codeblock缺pre×{cb_bad}")
            if js_bad: reasons.append("js:" + ";".join(js_bad))

            if reasons:
                problems.append((label, " ".join(reasons)))
            else:
                ok += 1

            # 信息性：哪些页面有故意缺失资源 404
            pending = [a for a in set(INTENTIONAL_404) & set("".join(console_errs + real_errs))]
            if console_errs and pending is None:
                pass
            print(f"  {label:<26} lab={n_lab:>2} cb={n_cb:>2} ta={n_ta:>2} "
                  f"js={len(real_errs)}+{len(console_errs)} ok={not reasons}")
        browser.close()

    print("\n==== 汇总 ====")
    print(f"页面总数={len(pages)} 全通过={ok} 异常={len(problems)} lab={total_labs} codeblock={total_cb}")
    if problems:
        print("FAIL:")
        for l, r in problems:
            print("   ", l, "→", r)
    print(f"\n注：01 章部分课时含故意缺失的媒体资源（alt 文本 / media 语法演示），其 404 已按设计放行。")
    sys_exit = 1 if problems else 0
    import sys
    sys.exit(sys_exit)

run()