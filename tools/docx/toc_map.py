#!/usr/bin/env python3
"""Map each report heading to its PDF page number (for the static TOC)."""
import fitz, os, json, sys
from build_report import parse_draft, DRAFT

SCRATCH = ("/tmp/claude-1000/-home-aspacenoob-Projects-IFQ636-assignment-2-"
           "vacayplan/aa05df61-3610-485f-80f1-c257b6b00d96/scratchpad/render")
PDF = os.path.join(SCRATCH, "IFQ636 Assignment 2 - Report.pdf")

def _norm(s):
    return " ".join(s.split())

CONTENT_ANCHOR = "full-stack vacation-planning"   # unique to body, absent from TOC

def build_map(pdf_path, toc_page_index=1):
    pdf = fitz.open(pdf_path)
    heads = [(k, v) for k, v in parse_draft(DRAFT) if k in ("h1", "h2")]
    page_text = {p: _norm(pdf[p].get_text()) for p in range(pdf.page_count)}
    # find first real content page (skips however many pages the TOC occupies)
    floor = next((p for p in range(pdf.page_count)
                  if CONTENT_ANCHOR in page_text[p]), 0)
    pages = {}
    missing = []
    for i, (k, v) in enumerate(heads):
        nv = _norm(v)
        found = None
        for pno in range(floor, pdf.page_count):
            if nv in page_text[pno]:
                found = pno + 1
                floor = pno        # next heading searches from here onward
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
