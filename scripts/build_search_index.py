#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Сборка search-index.js — индекса для поиска по сайту (см. search.js).

Берёт все страницы сайта, вытаскивает заголовок и текст содержимого
(main.wrap, а для lessons/ — body минус боковое меню и футер),
и складывает в window.pvaSearchIndex. Запускать после добавления
новых страниц:  python3 scripts/build_search_index.py
"""
import html, io, json, os, re, sys


def detect_root():
    """Путь к папке сайта: аргумент командной строки или автоопределение
    (скрипт может лежать в <сайт>/scripts/ или в рабочей папке проектов)."""
    if len(sys.argv) > 1:
        return sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    up = os.path.dirname(here)
    for cand in (os.path.join(up, "pvaschool7.github.io-main"),
                 os.path.join(up, "work_site", "pvaschool7.github.io-main")):
        if os.path.isdir(cand):
            return cand
    return up  # скрипт лежит внутри сайта: <сайт>/scripts/


ROOT = detect_root()
OUT = os.path.join(ROOT, "search-index.js")
MAXLEN = 60000  # страницы с темами КТП выросли (~45–50 тыс. знаков), не обрезаем

PAGES = [
    "index.html",
    "informatika.html",
    "informatika-uchenikam.html",
    "informatika-uchitelyam.html",
    "informatika-propushel-urok.html",
    "matematika.html",
    "matematika-uchenikam.html",
    "matematika-uchitelyam.html",
    "matematika-propushel-urok.html",
    "materials.html",
    "obo-mne.html",
    "kontakty.html",
    "lessons/izmerenie-informacii.html",
    "lessons/izmerenie-informacii-obychnyj.html",
    "lessons/informacionnye-processy.html",
    "lessons/konspekt-izmerenie.html",
    "lessons/konspekt-processy.html",
    "lessons/trenazher.html",
    "lessons/hakaton.html",
]


def clean_text(raw):
    s = raw
    s = re.sub(r"<script\b.*?</script>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<style\b.*?</style>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<(br|/p|/h[1-6]|/li|/div|/tr|/details|/summary|/section|/article|/span|/b|/ul)\b[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t\r\f\v]+", " ", s)
    s = re.sub(r"\s*\n\s*", "\n", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()


def page_content(doc):
    """Текст содержимого: main.wrap, для lessons/ — body минус aside/footer."""
    m = re.search(r'<main class="wrap"[^>]*>(.*?)</main>', doc, re.S | re.I)
    if m:
        return m.group(1)
    m = re.search(r"<body[^>]*>(.*)</body>", doc, re.S | re.I)
    body = m.group(1) if m else doc
    body = re.sub(r'<aside class="side".*?</aside>', " ", body, flags=re.S | re.I)
    body = re.sub(r"<footer\b.*?</footer>", " ", body, flags=re.S | re.I)
    return body


def main():
    entries = []
    for p in PAGES:
        path = os.path.join(ROOT, p)
        if not os.path.exists(path):
            print("!! нет файла, пропускаю:", p, file=sys.stderr)
            continue
        with io.open(path, encoding="utf-8") as f:
            doc = f.read()
        m = re.search(r"<title>(.*?)</title>", doc, re.S | re.I)
        title = html.unescape(m.group(1)).strip() if m else p
        title = re.sub(r"\s*[—·]\s*Плотников В\. А\.\s*$", "", title)
        text = clean_text(page_content(doc))
        text = re.sub(r"^Главная\s*/\s*", "", text)  # хлебные крошки
        if len(text) > MAXLEN:
            text = text[:MAXLEN].rstrip()
            cut = text.rfind("\n")
            if cut > MAXLEN // 2:
                text = text[:cut]
            text += " …"
        entries.append({"u": p, "t": title, "x": text})
        print("%4d зн.  %s  —  %s" % (len(text), p, title))

    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Индекс поиска по сайту — собран scripts/build_search_index.py, не правьте вручную */\n")
        f.write("window.pvaSearchIndex=")
        f.write(json.dumps(entries, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")
    print("OK:", OUT, "страниц:", len(entries), "размер:", os.path.getsize(OUT), "байт")


if __name__ == "__main__":
    main()
