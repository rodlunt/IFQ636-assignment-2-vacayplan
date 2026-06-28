#!/usr/bin/env python3
"""Build the IFQ636 A2 report DOCX from document_draft.md into the supplied
Word template, preserving template styles/cover and forcing body text black.

Usage:
  python build_report.py --outline      # dry run: print the parsed structure
  python build_report.py                # write the docx
"""
import os, re, sys, argparse
from docx import Document
from docx.shared import Pt, Inches, RGBColor, Emu
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from PIL import Image
import json

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DRAFT = os.path.join(ROOT, "document_draft.md")
TEMPLATE = os.path.join(ROOT, "documents", "IFQ636 Assignment 2 template.docx")
OUT = os.path.join(ROOT, "documents", "IFQ636 Assignment 2 - Report.docx")
# Two-pass static TOC: build once (field TOC), render to PDF, run toc_map.py to
# produce headmap.json next to this script, then rebuild to embed real page nums.
HEADMAP = os.path.join(HERE, "headmap.json")
TITLE = "IFQ636 Assignment 2 - VacayPlan"

BLACK = RGBColor(0x00, 0x00, 0x00)
BODY_FONT = "Open Sans"
CONTENT_WIDTH_IN = 6.27          # A4 portrait, 1in margins
MAX_IMG_HEIGHT_IN = 8.4          # leave room for caption on the page

# ---------------------------------------------------------------- parsing ----
def strip_heading_annotation(text):
    # remove a trailing parenthetical that is a word-count/figure guide,
    # but keep real ones like (NFRs) or (Low Fidelity Design)
    return re.sub(r"\s*\((?:~|\d+\s*word|[^)]*\bword)[^)]*\)\s*$", "", text).strip()

def is_italic_guide(line):
    s = line.strip()
    return len(s) > 2 and s.startswith("*") and s.endswith("*") and not s.startswith("**")

AWAIT_RE = re.compile(r"(to confirm|add yours|populate after|placeholder)", re.I)

def parse_draft(path):
    """Return ordered list of blocks: (kind, payload)."""
    lines = open(path, encoding="utf-8").read().split("\n")
    blocks = []
    i = 0
    started = False
    table_buf = []
    ref_buf = []
    in_refs = [False]

    def flush_ref():
        if ref_buf:
            blocks.append(("refpara", list(ref_buf)))
            ref_buf.clear()

    def flush_table():
        nonlocal table_buf
        if table_buf:
            # drop the markdown separator row (---|---)
            rows = [r for r in table_buf
                    if not re.match(r"^\s*\|?[\s:\-|]+\|?\s*$", r)]
            cells = [[c.strip() for c in re.split(r"(?<!\\)\|", r)[1:-1]] for r in rows]
            cells = [c for c in cells if c]
            if cells:
                blocks.append(("table", cells))
            table_buf = []

    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()
        s = line.strip()
        # begin body at the first real section
        if not started:
            if s.startswith("## Project overview"):
                started = True
            else:
                i += 1
                continue
        # table accumulation
        if s.startswith("|"):
            table_buf.append(line)
            i += 1
            continue
        else:
            flush_table()
        if not s:
            flush_ref()
            i += 1
            continue
        if s.startswith("---"):
            i += 1
            continue
        if s.startswith(">"):                      # status blockquote
            i += 1
            continue
        if s.startswith("## "):
            flush_ref()
            title = strip_heading_annotation(s[3:])
            in_refs[0] = title.lower().startswith("references")
            blocks.append(("h1", title))
            i += 1
            continue
        if s.startswith("### "):
            blocks.append(("h2", strip_heading_annotation(s[4:])))
            i += 1
            continue
        # figure: caption line (**Fig ...**) optionally followed by image
        mcap = re.match(r"^\*\*(Fig[^*]+|Figure[^*]+)\*\*\s*-?\s*(.*)$", s)
        if mcap:
            caption = (mcap.group(1) + (" - " + mcap.group(2) if mcap.group(2) else "")).strip()
            # look ahead for the image line
            img = None
            if i + 1 < len(lines):
                mimg = re.match(r"^!\[[^\]]*\]\(([^)]+)\)", lines[i+1].strip())
                if mimg:
                    img = mimg.group(1)
                    i += 1
            blocks.append(("fig", (caption, img)))
            i += 1
            continue
        # standalone image (e.g. wireframes / diagrams without a bold caption)
        mimg = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)", s)
        if mimg:
            blocks.append(("fig", (mimg.group(1), mimg.group(2))))
            i += 1
            continue
        # italic guide / placeholder lines
        if is_italic_guide(line):
            if AWAIT_RE.search(s):
                blocks.append(("await", s.strip("*").strip()))
            i += 1
            continue
        # ordinary paragraph (references accumulate into one entry per blank-sep group)
        if in_refs[0]:
            ref_buf.append(s)
        else:
            blocks.append(("para", s))
        i += 1
    flush_ref()
    flush_table()
    return blocks

# --------------------------------------------------------------- rendering ---
def set_black(run):
    run.font.color.rgb = BLACK
    run.font.name = BODY_FONT

def add_runs(paragraph, text):
    """Minimal inline markdown: **bold**, `code`, *italic*, [text](url)."""
    token = re.compile(r"(\*\*.+?\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))")
    pos = 0
    for m in token.finditer(text):
        if m.start() > pos:
            set_black(paragraph.add_run(text[pos:m.start()]))
        t = m.group(0)
        if t.startswith("**"):
            r = paragraph.add_run(t[2:-2]); r.bold = True; set_black(r)
        elif t.startswith("`"):
            r = paragraph.add_run(t[1:-1]); r.font.name = "Consolas"; r.font.color.rgb = BLACK
        elif t.startswith("[") :
            mm = re.match(r"\[([^\]]+)\]\(([^)]+)\)", t)
            add_hyperlink(paragraph, mm.group(2), mm.group(1))
        else:
            r = paragraph.add_run(t[1:-1]); r.italic = True; set_black(r)
        pos = m.end()
    if pos < len(text):
        set_black(paragraph.add_run(text[pos:]))

def add_hyperlink(paragraph, url, text):
    part = paragraph.part
    r_id = part.relate_to(url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True)
    hl = OxmlElement("w:hyperlink"); hl.set(qn("r:id"), r_id)
    run = OxmlElement("w:r"); rpr = OxmlElement("w:rPr")
    col = OxmlElement("w:color"); col.set(qn("w:val"), "000000"); rpr.append(col)
    u = OxmlElement("w:u"); u.set(qn("w:val"), "single"); rpr.append(u)
    rf = OxmlElement("w:rFonts"); rf.set(qn("w:ascii"), BODY_FONT); rf.set(qn("w:hAnsi"), BODY_FONT); rpr.append(rf)
    run.append(rpr)
    t = OxmlElement("w:t"); t.set(qn("xml:space"), "preserve"); t.text = text
    run.append(t); hl.append(run)
    paragraph._p.append(hl)

def img_dims_in(path):
    with Image.open(path) as im:
        w, h = im.size
        dpi = im.info.get("dpi", (96, 96))
        dx = dpi[0] if dpi and dpi[0] else 96
        dy = dpi[1] if dpi and dpi[1] else 96
    return w / dx, h / dy, w / h

def place_image(doc, path):
    """Add an image sized to fit the content box; returns ('portrait'|'wide')."""
    full = os.path.join(ROOT, path)
    if not os.path.exists(full):
        p = doc.add_paragraph(); set_black(p.add_run("[MISSING IMAGE: %s]" % path))
        return "missing"
    win, hin, ar = img_dims_in(full)
    # target width = content width; cap height
    target_w = CONTENT_WIDTH_IN
    target_h = target_w / ar
    if target_h > MAX_IMG_HEIGHT_IN:
        target_h = MAX_IMG_HEIGHT_IN
        target_w = target_h * ar
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    run.add_picture(full, width=Inches(target_w))
    return "wide" if ar > 1.6 else "portrait"

def style_para_black(p):
    for r in p.runs:
        set_black(r)

def add_toc(doc):
    h = doc.add_paragraph("Contents", style="Heading 1")
    p = doc.add_paragraph()
    run = p.add_run()
    fld_begin = OxmlElement("w:fldChar"); fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve")
    instr.text = ' TOC \\o "1-2" \\z \\u '          # no \h -> not hyperlinked
    fld_sep = OxmlElement("w:fldChar"); fld_sep.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:r"); pt = OxmlElement("w:t")
    pt.text = "Update this field (F9) to build the table of contents."
    placeholder.append(pt)
    fld_end = OxmlElement("w:fldChar"); fld_end.set(qn("w:fldCharType"), "end")
    r = run._r
    r.append(fld_begin); r.append(instr); r.append(fld_sep)
    p._p.append(placeholder);
    rend = OxmlElement("w:r"); rend.append(fld_end); p._p.append(rend)
    doc.add_page_break()

def add_static_toc(doc, entries):
    """Static, page-numbered, NON-hyperlinked TOC built from (level,text,page)."""
    doc.add_paragraph("Contents", style="Heading 1")
    for e in entries:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        indent = 0.3 if e["level"] == "h2" else 0.0
        pf.left_indent = Inches(indent)
        pf.tab_stops.add_tab_stop(Inches(CONTENT_WIDTH_IN),
                                  WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
        r = p.add_run(e["text"]); set_black(r)
        if e["level"] == "h1":
            r.bold = True
        pg = str(e["page"]) if e.get("page") else ""
        rp = p.add_run("\t" + pg); set_black(rp)
    doc.add_page_break()

def force_update_fields(doc):
    settings = doc.settings.element
    el = settings.find(qn("w:updateFields"))
    if el is None:
        el = OxmlElement("w:updateFields"); settings.append(el)
    el.set(qn("w:val"), "true")

# ------------------------------------------------------------------- build ---
def fill_cover(doc):
    repls = {
        "Full names of each team member:": " Rodney Lunt, Lance Masina, Joseph Milburn",
        "Student IDs of each team member:": "  [AWAITING: student IDs]",
        "Project title:": " VacayPlan",
        "GitHub link:": " https://github.com/rodlunt/IFQ636-assignment-2-vacayplan",
        "EC2 instance name and ID:": " 3.26.14.122  [AWAITING: instance name/ID]",
    }
    for p in doc.paragraphs:
        # set the cover title (drop the word "template")
        if p.style.name == "Title":
            for r in p.runs:
                r.text = ""
            (p.runs[0] if p.runs else p.add_run("")).text = TITLE
            continue
        if p.style.name.startswith("Heading"):
            continue
        for key, val in repls.items():
            if p.text.strip().startswith(key):
                set_black(p.add_run(val))
        # blacken every existing cover run (kills the grey 808285 default)
        for r in p.runs:
            set_black(r)

def clear_body_after_cover(doc):
    # remove everything from the first Heading 1 onward (keep cover paras)
    body = doc.element.body
    removing = False
    for p in list(doc.paragraphs):
        if p.style.name == "Heading 1":
            removing = True
        if removing:
            p._element.getparent().remove(p._element)

def build():
    blocks = parse_draft(DRAFT)
    doc = Document(TEMPLATE)
    fill_cover(doc)
    clear_body_after_cover(doc)
    doc.add_page_break()
    if os.path.exists(HEADMAP):
        add_static_toc(doc, json.load(open(HEADMAP)))
    else:
        add_toc(doc)

    in_refs = False
    for kind, payload in blocks:
        if kind == "h1":
            in_refs = payload.lower().startswith("references")
            doc.add_paragraph(payload, style="Heading 1")
        elif kind == "h2":
            doc.add_paragraph(payload, style="Heading 2")
        elif kind == "para":
            p = doc.add_paragraph()
            add_runs(p, payload)
            if in_refs:
                pf = p.paragraph_format
                pf.left_indent = Inches(0.5)
                pf.first_line_indent = Inches(-0.5)
        elif kind == "refpara":
            p = doc.add_paragraph()
            pf = p.paragraph_format
            pf.left_indent = Inches(0.5)
            pf.first_line_indent = Inches(-0.5)
            for li, line in enumerate(payload):
                if li:
                    p.add_run().add_break()
                add_runs(p, line)
        elif kind == "await":
            p = doc.add_paragraph()
            r = p.add_run("[AWAITING TEAM INPUT] " + payload)
            r.bold = True; r.font.color.rgb = RGBColor(0xB0, 0x00, 0x00)
        elif kind == "fig":
            caption, img = payload
            if img:
                place_image(doc, img)
            cp = doc.add_paragraph()
            cr = cp.add_run(caption); cr.italic = True; cr.font.size = Pt(9); set_black(cr); cr.italic = True
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif kind == "table":
            cells = payload
            ncol = max(len(r) for r in cells)
            t = doc.add_table(rows=0, cols=ncol)
            t.style = "Table Grid"
            for ri, row in enumerate(cells):
                cellrow = t.add_row().cells
                for ci in range(ncol):
                    txt = row[ci] if ci < len(row) else ""
                    cp = cellrow[ci].paragraphs[0]
                    add_runs(cp, txt)
                    if ri == 0:
                        for r in cp.runs:
                            r.bold = True
            doc.add_paragraph()
    force_update_fields(doc)
    doc.save(OUT)
    return blocks

def outline():
    blocks = parse_draft(DRAFT)
    from collections import Counter
    c = Counter(k for k, _ in blocks)
    print("block counts:", dict(c))
    print("\n--- structure ---")
    for k, v in blocks:
        if k == "h1": print("\nH1:", v)
        elif k == "h2": print("  H2:", v)
        elif k == "fig": print("     fig:", v[0][:50], "| img:", v[1])
        elif k == "table": print("     table %dx%d" % (len(v), max(len(r) for r in v)))
        elif k == "await": print("     AWAIT:", v[:60])
    return blocks

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--outline", action="store_true")
    args = ap.parse_args()
    if args.outline:
        outline()
    else:
        b = build()
        print("wrote", OUT)
        print("blocks:", len(b))
