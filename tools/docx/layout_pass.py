#!/usr/bin/env python3
"""Measured layout pass for the report.

Iteratively: build -> render -> measure -> write headmap.json (TOC page numbers)
and layout.json (headings to force onto a new page when they fall in the bottom
25% of a page; per-image height caps to pull a screenshot off a near-empty page).
Repeats until the layout stabilises or MAX_ITERS is reached.

Run from tools/docx with the venv python:  .venv/bin/python layout_pass.py
"""
import os, sys, json, subprocess
import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_report as br
from toc_map import build_map

PY = os.path.join(HERE, ".venv", "bin", "python")
ROOT = br.ROOT
DOCX = br.OUT
PDF = os.path.splitext(DOCX)[0] + ".pdf"
HEADMAP = br.HEADMAP
LAYOUT = br.LAYOUT
MAX_ITERS = 8
BOTTOM_FRACTION = 0.75        # heading below this fraction of page height -> break
SPARSE_TEXT_CHARS = 230       # a page with <= this much text + an image is "lone"
LONG_IMG_IN = 7.0             # images taller than this at full width may sit alone
SHRINK_STEP = 0.82
SHRINK_FLOOR_IN = 3.2


def run_build():
    subprocess.run([PY, os.path.join(HERE, "build_report.py")],
                   cwd=HERE, check=True, capture_output=True)


def render():
    if os.path.exists(PDF):
        os.remove(PDF)
    subprocess.run(["soffice", "--headless",
                    "-env:UserInstallation=file:///tmp/lo_layout",
                    "--convert-to", "pdf", "--outdir", ROOT, DOCX],
                   check=True, capture_output=True)


def measure_headmap():
    heads, pages, missing, npages = build_map(PDF)
    return [{"level": k, "text": v, "page": pages[i]}
            for i, (k, v) in enumerate(heads)], npages


def heading_y_ratio(page, text):
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            line = "".join(s["text"] for s in l["spans"]).strip()
            if line and (line.startswith(text[:30]) or text.startswith(line[:30])):
                return l["bbox"][1] / page.rect.height
    return None


def measure_breaks(pdf, headmap):
    """Headings sitting in the bottom 25% of their page -> force a page break."""
    flagged = set()
    for e in headmap:
        pg = e.get("page")
        if not pg:
            continue
        ratio = heading_y_ratio(pdf[pg - 1], e["text"])
        if ratio is not None and ratio > BOTTOM_FRACTION:
            flagged.add(e["text"])
    return flagged


def page_of_caption(pdf, caption):
    key = caption[:28]
    for i in range(pdf.page_count):
        if key in " ".join(pdf[i].get_text().split()):
            return i
    return None


def measure_lone(pdf, figs, shrinks):
    """Screenshots alone on a near-empty page -> shrink (unless long)."""
    for caption, img in figs:
        if not img:
            continue
        pg = page_of_caption(pdf, caption)
        if pg is None:
            continue
        page = pdf[pg]
        txt = page.get_text().strip()
        if len(page.get_images()) != 1 or len(txt) > SPARSE_TEXT_CHARS:
            continue                      # lone == exactly one image + only a caption
        # is the source image "long"? (tall at full width -> allowed to sit alone)
        full = os.path.join(ROOT, img)
        if not os.path.exists(full):
            continue
        _, _, ar = br.img_dims_in(br.shadow_image(full))
        height_at_full = br.CONTENT_WIDTH_IN / ar
        if height_at_full > LONG_IMG_IN:
            continue
        cur = shrinks.get(img, height_at_full)
        new = max(SHRINK_FLOOR_IN, round(cur * SHRINK_STEP, 2))
        if new < cur - 0.01:
            shrinks[img] = new
    return shrinks


def main():
    figs = [p for k, p in br.parse_draft(br.DRAFT) if k == "fig"]
    breaks, shrinks = set(), {}
    prev = None
    for it in range(1, MAX_ITERS + 1):
        json.dump({"break_headings": sorted(breaks), "shrink_images": shrinks},
                  open(LAYOUT, "w"))
        run_build()
        render()
        pdf = fitz.open(PDF)
        headmap, npages = measure_headmap()
        json.dump(headmap, open(HEADMAP, "w"))
        new_breaks = breaks | measure_breaks(pdf, headmap)
        new_shrinks = measure_lone(pdf, figs, dict(shrinks))
        lone_pages = sum(1 for f in figs if False)  # (info only)
        print(f"iter {it}: pages={npages} breaks={len(new_breaks)} "
              f"shrunk={len(new_shrinks)}")
        state = (sorted(new_breaks), sorted(new_shrinks.items()),
                 [e["page"] for e in headmap])
        breaks, shrinks = new_breaks, new_shrinks
        if state == prev:
            print("converged.")
            break
        prev = state
    # final build with the converged hints
    json.dump({"break_headings": sorted(breaks), "shrink_images": shrinks},
              open(LAYOUT, "w"))
    run_build(); render()
    print("final pages:", fitz.open(PDF).page_count)


if __name__ == "__main__":
    main()
