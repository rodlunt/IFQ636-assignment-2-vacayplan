#!/usr/bin/env python3
"""Map each report heading to its PDF page number (for the static TOC)."""
import fitz, os, json, sys
from build_report import parse_draft, DRAFT, OUT

# Standalone runs map against the repo-root deliverable PDF (sibling of OUT).
# When driven by layout_pass.py, build_map() is called with its own render path.
PDF = os.path.splitext(OUT)[0] + ".pdf"

def _norm(s):
    return " ".join(s.split())

CONTENT_ANCHOR = "full-stack vacation-planning"   # unique to body, absent from TOC

def build_map(pdf_path, toc_page_index=1):
    pdf = fitz.open(pdf_path)
    heads = [(k, v) for k, v in parse_draft(DRAFT) if k in ("h1", "h2")]
    page_text = {p: _norm(pdf[p].get_text()) for p in range(pdf.page_count)}
    # per-page normalised lines, for line-start (heading) anchoring
    page_lines = {p: [_norm(ln) for ln in pdf[p].get_text().splitlines() if ln.strip()]
                  for p in range(pdf.page_count)}
    # find first real content page (skips however many pages the TOC occupies).
    # Hard-fail rather than silently defaulting to page 0: a stale CONTENT_ANCHOR
    # would otherwise corrupt every TOC page number with no error.
    floor = next((p for p in range(pdf.page_count)
                  if CONTENT_ANCHOR in page_text[p]), None)
    if floor is None:
        raise SystemExit(
            f"toc_map: CONTENT_ANCHOR {CONTENT_ANCHOR!r} not found in {pdf_path}. "
            "The report body sentence it anchors to was probably edited; update "
            "CONTENT_ANCHOR to a phrase that still exists in the body, or the TOC "
            "page numbers will all be wrong.")
    pages = {}
    missing = []
    for i, (k, v) in enumerate(heads):
        nv = _norm(v)
        found = None
        # pass 1: prefer a heading rendered at the start of its own line
        for pno in range(floor, pdf.page_count):
            if any(ln.startswith(nv) for ln in page_lines[pno]):
                found = pno + 1
                floor = pno        # next heading searches from here onward
                break
        # pass 2: fall back to anywhere on the page (never worse than substring)
        if found is None:
            for pno in range(floor, pdf.page_count):
                if nv in page_text[pno]:
                    found = pno + 1
                    floor = pno
                    break
        # store keyed by index to avoid duplicate-label clobbering
        pages[i] = found
        if found is None:
            missing.append(v)
    return heads, pages, missing, pdf.page_count

if __name__ == "__main__":
    heads, pages, missing, npages = build_map(PDF)
    print("headings:", len(heads), "pages:", npages, "missing:", len(missing))
    out = []
    for i, (k, v) in enumerate(heads):
        print(f'{"H1" if k=="h1" else "  H2"} p{pages[i]}: {v[:50]}')
        out.append({"level": k, "text": v, "page": pages[i]})
    if missing:
        print("MISSING:", missing)
    here = os.path.dirname(os.path.abspath(__file__))
    json.dump(out, open(os.path.join(here, "headmap.json"), "w"))
