"""Extract PDF figures as PNG files.

This book introduces a figure in prose (for example, ``Figure 1-1 shows ...``)
and places the diagram directly after that reference. The script therefore
extracts the first graphic following each Figure X-X reference.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pymupdf


FIGURE_PATTERN = re.compile(r"\bFigure\s+(\d+)\s*[-–—]\s*(\d+)\b", re.IGNORECASE)
FALLBACK_FIGURE_PATTERN = re.compile(
    r"\bFigure\s+(\d+)(?:\s*[-–—]\s*(\d+)\b|\s*[:.])",
    re.IGNORECASE,
)


def union_rect(rectangles: list[pymupdf.Rect]) -> pymupdf.Rect:
    """Return the smallest rectangle containing every rectangle in a list."""
    result = pymupdf.Rect(rectangles[0])
    for rectangle in rectangles[1:]:
        result |= rectangle
    return result


def find_figure_references(
    page: pymupdf.Page, pattern: re.Pattern[str] = FIGURE_PATTERN
) -> list[dict]:
    """Find Figure X-X references and their locations on one page."""
    references: list[dict] = []
    page_data = page.get_text("dict", sort=True)

    for block in page_data["blocks"]:
        if block["type"] != 0:  # Text blocks only
            continue
        for line in block["lines"]:
            text = "".join(span["text"] for span in line["spans"]).strip()
            for match in pattern.finditer(text):
                figure_id = match.group(1)
                if match.group(2):
                    figure_id = f"{figure_id}-{match.group(2)}"
                references.append(
                    {
                        "id": figure_id,
                        "reference": text,
                        "rect": pymupdf.Rect(line["bbox"]),
                    }
                )

    return sorted(references, key=lambda item: (item["rect"].y0, item["rect"].x0))


def graphic_rectangles(page: pymupdf.Page) -> list[pymupdf.Rect]:
    """Collect bounding boxes of vector drawings and embedded images."""
    rectangles: list[pymupdf.Rect] = []

    for drawing in page.get_drawings():
        rect = pymupdf.Rect(drawing["rect"])
        if rect.get_area() > 1:
            rectangles.append(rect)

    for image in page.get_images(full=True):
        for rect in page.get_image_rects(image[0]):
            if rect.get_area() > 1:
                rectangles.append(rect)

    return rectangles


def figure_crop(
    page: pymupdf.Page,
    reference: pymupdf.Rect,
    graphics: list[pymupdf.Rect],
    allow_fallback: bool,
    padding: float = 18,
) -> pymupdf.Rect:
    """Find the first graphic placed after a Figure X-X reference."""
    candidates = [
        rect
        for rect in graphics
        if rect.y0 >= reference.y1 - 3
    ]

    if candidates:
        # In this PDF each diagram is normally one embedded image. Choosing
        # the next graphic avoids merging it with a later figure on the page.
        crop = min(candidates, key=lambda rect: (rect.y0, rect.x0))
        crop.x0 -= padding
        crop.y0 -= padding
        crop.x1 += padding
        crop.y1 += padding
    elif allow_fallback:
        # Preserve a useful region when no vector/image bounds are available.
        crop = pymupdf.Rect(
            page.rect.x0 + padding,
            reference.y1 + 4,
            page.rect.x1 - padding,
            min(page.rect.y1 - padding, reference.y1 + 424),
        )

    else:
        # This avoids mistaking Figure references in a table of contents for
        # real figure captions. Enable fallback explicitly for unusual PDFs.
        raise ValueError("No vector drawing or embedded image was found above the caption")

    crop &= page.rect
    if crop.height < 10 or crop.width < 10:
        raise ValueError("The calculated figure crop is empty")
    return crop


def crop_graphic(page: pymupdf.Page, graphic: pymupdf.Rect, padding: float = 18) -> pymupdf.Rect:
    """Expand one graphic rectangle slightly, without leaving the PDF page."""
    crop = pymupdf.Rect(graphic)
    crop.x0 -= padding
    crop.y0 -= padding
    crop.x1 += padding
    crop.y1 += padding
    crop &= page.rect
    return crop


def extract_figures(
    pdf_path: Path, output_dir: Path, dpi: int, allow_fallback: bool
) -> list[dict]:
    """Extract figures using the normal pattern, then retry with a fallback."""
    metadata = _extract_figures_with_pattern(
        pdf_path, output_dir, dpi, allow_fallback, FIGURE_PATTERN
    )
    if metadata:
        return metadata

    print("No figures found with the primary pattern; trying the fallback pattern.")
    return _extract_figures_with_pattern(
        pdf_path, output_dir, dpi, allow_fallback, FALLBACK_FIGURE_PATTERN
    )


def _extract_figures_with_pattern(
    pdf_path: Path,
    output_dir: Path,
    dpi: int,
    allow_fallback: bool,
    pattern: re.Pattern[str],
) -> list[dict]:
    output_dir.mkdir(parents=True, exist_ok=True)
    document = pymupdf.open(pdf_path)
    metadata: list[dict] = []
    saved_figure_ids: set[str] = set()
    in_figure_list = False
    scale = dpi / 72
    matrix = pymupdf.Matrix(scale, scale)

    for page_number, page in enumerate(document, start=1):
        page_text = page.get_text("text")

        # The table of figures can continue across several pages.
        if "list of figures" in page_text.lower():
            in_figure_list = True
            continue
        if in_figure_list:
            if pattern.search(page_text):
                continue
            in_figure_list = False

        references = find_figure_references(page, pattern)
        if not references:
            continue

        graphics = graphic_rectangles(page)

        for reference_info in references:
            figure_id = reference_info["id"]
            if figure_id in saved_figure_ids:
                print(f"Skipping duplicate Figure {figure_id} on page {page_number}")
                continue

            reference_rect = reference_info["rect"]
            diagram_page = page
            diagram_page_number = page_number
            try:
                crop = figure_crop(
                    page,
                    reference_rect,
                    graphics,
                    False,
                )
            except ValueError:
                # Some figures are introduced at the bottom of a page and the
                # diagram begins at the top of the following page.
                next_page_index = page_number  # zero-based index of the next page
                if next_page_index < len(document):
                    next_page = document[next_page_index]
                    next_graphics = graphic_rectangles(next_page)
                    if next_graphics:
                        diagram_page = next_page
                        diagram_page_number = page_number + 1
                        crop = crop_graphic(
                            next_page,
                            min(next_graphics, key=lambda rect: (rect.y0, rect.x0)),
                        )
                    elif allow_fallback:
                        crop = figure_crop(page, reference_rect, graphics, True)
                    else:
                        print(f"Skipping Figure {figure_id} on page {page_number}: no graphic found")
                        continue
                elif allow_fallback:
                    crop = figure_crop(page, reference_rect, graphics, True)
                else:
                    print(f"Skipping Figure {figure_id} on page {page_number}: no graphic found")
                    continue

            file_name = f"figure-{figure_id}.png"
            image_path = output_dir / file_name
            # Be resilient if the output directory is removed while a long
            # extraction is running.
            output_dir.mkdir(parents=True, exist_ok=True)
            pixmap = diagram_page.get_pixmap(matrix=matrix, clip=crop, alpha=False)
            pixmap.save(image_path)

            metadata.append(
                {
                    "figure_id": figure_id,
                    "source_pdf": str(pdf_path.resolve()),
                    "page": diagram_page_number,
                    "reference_page": page_number,
                    "reference": reference_info["reference"],
                    "image_path": str(image_path.resolve()),
                    "crop_bounds": [crop.x0, crop.y0, crop.x1, crop.y1],
                }
            )
            saved_figure_ids.add(figure_id)
            print(
                f"Saved Figure {figure_id} (diagram page {diagram_page_number}) -> {image_path}"
            )

    metadata_path = output_dir / "figures_metadata.json"
    output_dir.mkdir(parents=True, exist_ok=True)
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract Figure X-X PDF diagrams into individual PNG files."
    )
    parser.add_argument("pdf", type=Path, help="Path to the source PDF")
    parser.add_argument(
        "--output-dir", type=Path, default=Path("figures"), help="PNG output directory"
    )
    parser.add_argument(
        "--dpi", type=int, default=180, help="PNG resolution (default: 180)"
    )
    parser.add_argument(
        "--only-detected-graphics",
        action="store_false",
        dest="allow_fallback_crops",
        help="Skip a caption when no graphic object is detected above it",
    )
    parser.set_defaults(allow_fallback_crops=True)
    args = parser.parse_args()

    if not args.pdf.is_file():
        parser.error(f"PDF not found: {args.pdf}")
    if args.dpi < 72:
        parser.error("dpi must be at least 72")

    figures = extract_figures(
        args.pdf, args.output_dir, args.dpi, args.allow_fallback_crops
    )
    print(f"\nExtracted {len(figures)} figure(s). Metadata: {args.output_dir / 'figures_metadata.json'}")


if __name__ == "__main__":
    main()
