#!/usr/bin/env python3
"""Populate the IFQ636 A2 Declaration of contribution template.

Fills the contributions table and signature table for the three team members,
grounding each contribution description in the committed PR/commit record
(Appendix A of the report). Student IDs, signatures and dates are left as
[AWAITING ...] for the team to complete. Forces body text black and adds an
unlinked, page-numbered TOC.
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
OUT = os.path.join(ROOT, "IFQ636 Assignment 2 - Declaration of contribution.docx")
BLACK = RGBColor(0, 0, 0)
FONT = "Open Sans"

MEMBERS = [
    ("Rodney Lunt",
     "Coordinated the project and managed the GitHub workflow (issues, project board, "
     "branch/PR discipline, ~126 commits across 48 pull requests). Implemented the Singleton "
     "(database connection), Chain of Responsibility (middleware pipeline) and Decorator "
     "(withOwnership handler wrapper) patterns. Built the Postman auth/admin coverage and the "
     "live end-to-end collection run, added the PR-checks CI workflow and c8 code coverage, "
     "produced the load-test (NFR-01) evidence, and assembled the report draft including final "
     "QA, the GenAI disclosure and reflection sections, README, wireframes and system diagrams."),
    ("Lance Masina",
     "Implemented the Factory Method (user-response construction), Facade (service-layer cascade "
     "deletes) and State (trip lifecycle) patterns. Set up the CI/CD deployment to AWS EC2 and "
     "wrote the Section 7 CI/CD write-up. Authored SRS Sections 2.6-2.7 (functional and "
     "non-functional requirements) and contributed the Postman trip-CRUD and State-transition "
     "request/response evidence. ~54 commits across 9 pull requests."),
    ("Joseph Milburn",
     "Implemented the Builder (trip query/update construction) and Adapter (Open-Meteo weather "
     "integration) patterns. Authored the project overview and SRS Sections 2.1-2.5 (purpose, "
     "problem, scope, users, constraints), the Discussion and conclusion, and the activity-CRUD "
     "and weather Postman evidence with test scripts. ~33 commits across 8 pull requests."),
]


def set_black(run):
    run.font.color.rgb = BLACK
    run.font.name = FONT


def blacken_all(doc):
    for p in doc.paragraphs:
        if p.style.name.startswith("Heading") or p.style.name == "Title":
            continue
        for r in p.runs:
            set_black(r)
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        set_black(r)


def set_cell(cell, text, bold=False):
    cell.text = ""
    p = cell.paragraphs[0]
    r = p.add_run(text)
    r.bold = bold
    set_black(r)


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


def build():
    doc = Document(TEMPLATE)
    contrib, sign = doc.tables[0], doc.tables[1]

    # contributions table: header(0), then one row per member
    for idx, (name, desc) in enumerate(MEMBERS, start=1):
        cells = contrib.rows[idx].cells
        set_cell(cells[0], name)
        set_cell(cells[1], "[AWAITING: student ID]")
        set_cell(cells[2], desc)
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
    for idx, (name, _) in enumerate(MEMBERS, start=1):
        cells = sign.rows[idx].cells
        set_cell(cells[0], name)
        set_cell(cells[1], "[AWAITING: signature]")
        set_cell(cells[2], "[AWAITING: date]")
    trim_rows(sign, keep=1 + len(MEMBERS))

    blacken_all(doc)
    force_update_fields(doc)
    doc.save(OUT)
    print("wrote", OUT)


if __name__ == "__main__":
    build()
