"""Utilities for extracting chapter numbers and names from PDF files."""

from __future__ import annotations

import re
from pathlib import Path

import pymupdf


def parse_chapter_title(raw_title: str) -> tuple[str, str]:
    """Parse a TOC entry or heading into (chapter_number, chapter_name).

    Examples:
        'CHAPTER 1: SCALE FROM ZERO' -> ('1', 'SCALE FROM ZERO')
        '1. Microservices'           -> ('1', 'Microservices')
        'Chapter 10: Inheritance'    -> ('10', 'Inheritance')
        'Appendix A: Guidelines'     -> ('Appendix A', 'Guidelines')
        'Preface'                    -> ('', 'Preface')
    """
    cleaned = " ".join(raw_title.strip().split())
    if not cleaned:
        return "", ""

    # 1. 'CHAPTER 1: ...', 'Chapter 1 - ...', 'Ch. 1. ...', 'Chapter 1 ...'
    m = re.match(
        r"^(?:CHAPTER|Chapter|Ch\.?)\s+([0-9A-Za-z]+)\s*[:.\-–—\s]\s*(.*)$",
        cleaned,
        re.IGNORECASE,
    )
    if m:
        return m.group(1).strip(), m.group(2).strip()

    # 2. 'CHAPTER 1' without title
    m = re.match(r"^(?:CHAPTER|Chapter|Ch\.?)\s+([0-9A-Za-z]+)$", cleaned, re.IGNORECASE)
    if m:
        return m.group(1).strip(), ""

    # 3. 'Appendix A: ...', 'Appendix 1 - ...'
    m = re.match(
        r"^(?:APPENDIX|Appendix|App\.?)\s+([0-9A-Za-z]+)\s*[:.\-–—\s]\s*(.*)$",
        cleaned,
        re.IGNORECASE,
    )
    if m:
        return f"Appendix {m.group(1).strip()}", m.group(2).strip()

    # 4. 'Appendix A' without title
    m = re.match(r"^(?:APPENDIX|Appendix|App\.?)\s+([0-9A-Za-z]+)$", cleaned, re.IGNORECASE)
    if m:
        return f"Appendix {m.group(1).strip()}", ""

    # 5. '1. Microservices', '1 - Microservices' (leading digits followed by delimiter)
    m = re.match(r"^(\d+)\s*[:.\-–—]\s*(.*)$", cleaned)
    if m:
        return m.group(1).strip(), m.group(2).strip()

    return "", cleaned


def extract_pdf_chapters(
    doc_or_path: pymupdf.Document | str | Path,
) -> dict[int, dict[str, str]]:
    """Map every 1-based page number in the PDF to its chapter number and name.

    Returns a dict like:
        {
            1: {"chapter_number": "", "chapter_name": "Preface"},
            14: {"chapter_number": "1", "chapter_name": "Microservices"},
            ...
        }
    """
    should_close = False
    if isinstance(doc_or_path, (str, Path)):
        doc = pymupdf.open(doc_or_path)
        should_close = True
    else:
        doc = doc_or_path

    try:
        total_pages = len(doc)
        if total_pages == 0:
            return {}

        toc = doc.get_toc(simple=False)
        toc_entries = []

        for item in toc:
            level = item[0]
            title = item[1].strip()
            page = item[2]

            # In PyMuPDF, bookmark destinations with named destinations store actual page in item[3]
            if len(item) > 3 and isinstance(item[3], dict) and "page" in item[3]:
                dest_page = item[3]["page"]
                if isinstance(dest_page, int) and dest_page > 0:
                    page = dest_page

            if 1 <= page <= total_pages:
                num, name = parse_chapter_title(title)
                toc_entries.append(
                    {
                        "level": level,
                        "title": title,
                        "page": page,
                        "chapter_number": num,
                        "chapter_name": name or title,
                    }
                )

        has_numbered_chapters = any(e["chapter_number"] != "" for e in toc_entries)
        chapter_markers = []

        if has_numbered_chapters:
            # If explicit chapters exist (e.g. Chapter 1, 2. Foo), include them
            # plus top-level unnumbered sections (e.g. Preface, Index, Introduction).
            for e in toc_entries:
                if e["chapter_number"]:
                    chapter_markers.append(e)
                elif e["level"] == 1:
                    chapter_markers.append(e)
        elif toc_entries:
            # If no numbered chapters exist, use the top-level TOC items
            min_level = min(e["level"] for e in toc_entries)
            for e in toc_entries:
                if e["level"] == min_level:
                    chapter_markers.append(e)

        # Sort markers by page, preferring numbered chapters if same page
        chapter_markers.sort(key=lambda x: (x["page"], 0 if x["chapter_number"] else 1))

        # Deduplicate markers sharing the same page
        deduped_markers = []
        for e in chapter_markers:
            if deduped_markers and deduped_markers[-1]["page"] == e["page"]:
                if e["chapter_number"] and not deduped_markers[-1]["chapter_number"]:
                    deduped_markers[-1] = e
            else:
                deduped_markers.append(e)

        # Fallback for PDFs without TOC bookmarks: scan first lines of each page
        if not deduped_markers:
            for page_idx in range(total_pages):
                page_num = page_idx + 1
                page_text = doc[page_idx].get_text()[:600]
                for line in page_text.splitlines():
                    line = line.strip()
                    m = re.match(
                        r"^(?:CHAPTER|Chapter)\s+([0-9A-Za-z]+)(?:[\s:.\-–—]+(.*))?$",
                        line,
                        re.IGNORECASE,
                    )
                    if m:
                        num = m.group(1).strip()
                        name = (m.group(2) or "").strip()
                        deduped_markers.append(
                            {
                                "page": page_num,
                                "chapter_number": num,
                                "chapter_name": name or f"Chapter {num}",
                            }
                        )
                        break

        # Build map for all pages: 1..total_pages
        page_map: dict[int, dict[str, str]] = {}
        current: dict[str, str] = {"chapter_number": "", "chapter_name": ""}
        marker_idx = 0

        for page_num in range(1, total_pages + 1):
            while (
                marker_idx < len(deduped_markers)
                and deduped_markers[marker_idx]["page"] <= page_num
            ):
                current = {
                    "chapter_number": deduped_markers[marker_idx]["chapter_number"],
                    "chapter_name": deduped_markers[marker_idx]["chapter_name"],
                }
                marker_idx += 1
            page_map[page_num] = current

        return page_map
    finally:
        if should_close:
            doc.close()
