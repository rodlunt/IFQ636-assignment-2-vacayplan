#!/usr/bin/env python3
"""Populate the IFQ636 A2 Declaration of contribution template.

Fills the contributions table and signature table for the three team members,
grounding each contribution description in the committed PR/commit record
(Appendix A of the report). Student IDs are filled (they also appear on the
public report cover); signatures and dates are PII and must not be published.

Two outputs are produced:
  * UNSIGNED (tracked, repo root): signature + date left as red [PLACEHOLDER].
    This is the copy that is safe to commit to the public repo.
  * SIGNED (gitignored, planning/local/): scanned signature images embedded and
    real dates filled, for the team member who submits via the QUT portal. Only
    emitted when at least one signature image is found; per-member it falls back
    to a placeholder when that member's image or date is missing.

Signature images live in the gitignored documents/ folder, named per member
(see the `sig` field in MEMBERS). Forces body text black to match the template.
"""
import os
from docx import Document
from docx.shared import RGBColor, Inches
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
TEMPLATE = os.path.join(ROOT, "documents",
                        "IFQ636 Assignment 2 - Declaration of contribution.docx")
# Tracked, public-safe copy (no signatures).
OUT_UNSIGNED = os.path.join(ROOT, "IFQ636 Assignment 2 - Declaration of contribution.docx")
# Gitignored copy with embedded signatures, for QUT-portal submission only.
SIGNED_DIR = os.path.join(ROOT, "planning", "local")
OUT_SIGNED = os.path.join(SIGNED_DIR,
                          "IFQ636 Assignment 2 - Declaration of contribution - SIGNED.docx")
# Signature images (gitignored).
SIG_DIR = os.path.join(ROOT, "documents")
BLACK = RGBColor(0, 0, 0)
RED = RGBColor(0xC0, 0x00, 0x00)
FONT = "Open Sans"

# Each member: full name, contribution description (grounded in Appendix A),
# student ID, signature-image basename to look for in SIG_DIR, and sign date.
# A signature filename or date left as None renders as a red placeholder even in
# the signed build.
MEMBERS = [
    {
        "name": "Rodney Lunt",
        "sid": "n12555941",
        "sig": "signature-rodney",
        "date": "01/07/2026",
        "desc": (
            "Coordinated the project and managed the GitHub workflow (issues, project board, "
            "branch/PR discipline, 118 commits across 59 pull requests). Implemented the Singleton "
            "(database connection), Chain of Responsibility (middleware pipeline) and Decorator "
            "(withOwnership handler wrapper) patterns. Built the Postman auth/admin coverage and the "
            "live end-to-end collection run, added the PR-checks CI workflow and c8 code coverage, "
            "produced the load-test (NFR-01) evidence, and assembled the report draft including final "
            "QA, the GenAI disclosure and reflection sections, README, wireframes and system diagrams."
        ),
    },
    {
        "name": "Lance Masina",
        "sid": "n8838411",
        "sig": "signature-lance",
        "date": "29/06/2026",
        "desc": (
            "Implemented the Factory Method (user-response construction), Facade (service-layer cascade "
            "deletes) and State (trip lifecycle) patterns. Set up the CI/CD deployment to AWS EC2 and "
            "wrote the Section 7 CI/CD write-up. Authored SRS Sections 2.6-2.7 (functional and "
            "non-functional requirements) and contributed the Postman trip-CRUD and State-transition "
            "request/response evidence. 30 commits across 10 pull requests."
        ),
    },
    {
        "name": "Joseph Milburn",
        "sid": "n10813888",
        "sig": "signature-joseph",
        "date": "30/06/2026",
        "desc": (
            "Implemented the Builder (trip query/update construction) and Adapter (Open-Meteo weather "
            "integration) patterns. Authored the project overview and SRS Sections 2.1-2.5 (purpose, "
            "problem, scope, users, constraints), the Discussion and conclusion, and the activity-CRUD "
            "and weather Postman evidence with test scripts. 21 commits across 8 pull requests."
        ),
    },
]

SIG_EXTS = (".png", ".jpg", ".jpeg")


def find_sig(basename):
    """Return the path to a signature image for `basename`, or None if absent."""
    if not basename:
        return None
    for ext in SIG_EXTS:
        path = os.path.join(SIG_DIR, basename + ext)
        if os.path.exists(path):
            return path
    return None


def set_black(run):
    run.font.color.rgb = BLACK
    run.font.name = FONT


def _is_red(run):
    c = run.font.color
    return c is not None and c.rgb is not None and str(c.rgb) == "C00000"


def blacken_all(doc):
    for p in doc.paragraphs:
        if p.style.name.startswith("Heading") or p.style.name == "Title":
            continue
        for r in p.runs:
            if not _is_red(r):
                set_black(r)
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        if not _is_red(r):       # keep [PLACEHOLDER] runs red
                            set_black(r)


def set_cell(cell, text, bold=False, red=False):
    cell.text = ""
    p = cell.paragraphs[0]
    r = p.add_run(text)
    r.bold = bold or red
    r.font.name = FONT
    r.font.color.rgb = RED if red else BLACK


def set_cell_image(cell, img_path, height_in=0.5):
    """Replace a cell's content with an embedded signature image."""
    cell.text = ""
    cell.paragraphs[0].add_run().add_picture(img_path, height=Inches(height_in))


def trim_rows(table, keep):
    """Delete data rows beyond `keep` (header counted in keep)."""
    for row in list(table.rows)[keep:]:
        row._element.getparent().remove(row._element)


def force_update_fields(doc):
    s = doc.settings.element
    el = s.find(qn("w:updateFields"))
    if el is None:
        el = OxmlElement("w:updateFields"); s.append(el)
    el.set(qn("w:val"), "true")


def build(signed=False):
    """Build the declaration. signed=True embeds available signatures + dates."""
    doc = Document(TEMPLATE)
    contrib, sign = doc.tables[0], doc.tables[1]

    # contributions table: header(0), then one row per member
    for idx, m in enumerate(MEMBERS, start=1):
        cells = contrib.rows[idx].cells
        set_cell(cells[0], m["name"])
        set_cell(cells[1], m["sid"])
        set_cell(cells[2], m["desc"])
    trim_rows(contrib, keep=1 + len(MEMBERS))
    # rebalance columns: name / id narrow, description wide (dxa: 1in = 1440)
    col_dxa = [2016, 1872, 5184]
    contrib.autofit = False
    grid = contrib._tbl.find(qn("w:tblGrid"))
    for gc, w in zip(grid.findall(qn("w:gridCol")), col_dxa):
        gc.set(qn("w:w"), str(w))
    for row in contrib.rows:
        for cell, w in zip(row.cells, col_dxa):
            cell.width = Inches(w / 1440)

    # signatures table: header(0), then one row per member
    for idx, m in enumerate(MEMBERS, start=1):
        cells = sign.rows[idx].cells
        set_cell(cells[0], m["name"])
        sig_path = find_sig(m["sig"]) if signed else None
        if sig_path:
            set_cell_image(cells[1], sig_path)
        elif signed:
            set_cell(cells[1], "")   # blank cell to hand-sign in Acrobat
        else:
            set_cell(cells[1], "[PLACEHOLDER: signature]", red=True)
        if signed and m["date"]:
            set_cell(cells[2], m["date"])
        else:
            set_cell(cells[2], "[PLACEHOLDER: date]", red=True)
    trim_rows(sign, keep=1 + len(MEMBERS))

    blacken_all(doc)
    force_update_fields(doc)
    out = OUT_SIGNED if signed else OUT_UNSIGNED
    if signed:
        os.makedirs(SIGNED_DIR, exist_ok=True)
    doc.save(out)
    print("wrote", out)
    return out


if __name__ == "__main__":
    # Always (re)build the public-safe unsigned copy.
    build(signed=False)
    # Build the signed copy only if at least one signature image is present.
    if any(find_sig(m["sig"]) for m in MEMBERS):
        build(signed=True)
    else:
        print("no signature images found in", SIG_DIR,
              "- skipped signed build (expected names: "
              + ", ".join(m["sig"] + SIG_EXTS[0] for m in MEMBERS) + ")")
