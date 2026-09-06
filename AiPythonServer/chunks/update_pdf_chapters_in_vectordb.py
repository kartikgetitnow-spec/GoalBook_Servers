"""Update existing ChromaDB vector entries with chapter_number and chapter_name metadata.

This script scans already-indexed chunks in ChromaDB, locates the original source PDF,
extracts chapter numbers and chapter names per page, and updates the vector database
records in-place.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import chromadb
import pymupdf

try:
    from chapter_extractor import extract_pdf_chapters
except ImportError:
    from chunks.chapter_extractor import extract_pdf_chapters


def find_pdf_file(source_str: str | None, file_name: str | None, base_dir: Path) -> Path | None:
    """Attempt to locate a PDF file from its stored source path or filename."""
    # 1. Try exact absolute/relative path as stored
    if source_str:
        candidate = Path(source_str)
        if candidate.is_file():
            return candidate
        # Try relative to base_dir
        candidate = base_dir / source_str
        if candidate.is_file():
            return candidate

    # 2. Try searching by file_name in current dir, uploads/, and figures/
    if file_name:
        for search_dir in [base_dir, base_dir / "uploads", base_dir / "figures"]:
            if search_dir.exists():
                direct_match = search_dir / file_name
                if direct_match.is_file():
                    return direct_match
                # Check subdirectories of search_dir
                for match in search_dir.rglob(file_name):
                    if match.is_file():
                        return match

    return None


def update_existing_pdf_chapters(
    database_path: Path | str = "info.db",
    collection_name: str = "pdf_knowledge",
    target_pdf_path: Path | str | None = None,
    batch_size: int = 500,
) -> dict[str, Any]:
    """Extract chapter metadata from source PDFs and update records in ChromaDB.

    Returns a dictionary summarizing the update result:
    {
        "total_chunks_inspected": int,
        "total_chunks_updated": int,
        "pdf_reports": list[dict],
    }
    """
    database_path = Path(database_path)
    base_dir = Path.cwd()

    client = chromadb.PersistentClient(path=str(database_path))
    collection = client.get_collection(name=collection_name)

    # Fetch all records in the collection
    total_count = collection.count()
    if total_count == 0:
        print(f"Collection '{collection_name}' in '{database_path}' is empty.")
        return {
            "total_chunks_inspected": 0,
            "total_chunks_updated": 0,
            "pdf_reports": [],
        }

    # Fetch all IDs and metadatas
    existing_data = collection.get(include=["metadatas"])
    ids: list[str] = existing_data["ids"]
    metadatas: list[dict[str, Any]] = existing_data["metadatas"]

    # Group chunk indices by source file identifier
    pdf_groups: dict[str, list[int]] = {}
    for idx, meta in enumerate(metadatas):
        src_key = meta.get("source") or meta.get("file_name") or "unknown"
        pdf_groups.setdefault(src_key, []).append(idx)

    target_pdf_resolved = (
        Path(target_pdf_path).resolve() if target_pdf_path else None
    )

    pdf_reports: list[dict[str, Any]] = []
    total_updated = 0

    for src_key, chunk_indices in pdf_groups.items():
        sample_meta = metadatas[chunk_indices[0]]
        source_str = sample_meta.get("source")
        file_name = sample_meta.get("file_name")

        pdf_file = find_pdf_file(source_str, file_name, base_dir)

        if target_pdf_resolved and pdf_file and pdf_file.resolve() != target_pdf_resolved:
            continue

        if not pdf_file or not pdf_file.is_file():
            print(f"Warning: Could not locate source PDF for '{src_key}'. Skipping...")
            pdf_reports.append(
                {
                    "source": src_key,
                    "status": "file_not_found",
                    "chunks_count": len(chunk_indices),
                    "chunks_updated": 0,
                }
            )
            continue

        print(f"\nProcessing PDF: {pdf_file.name} ({len(chunk_indices)} chunks)...")

        # Extract chapter map for this PDF
        doc = pymupdf.open(pdf_file)
        chapter_map = extract_pdf_chapters(doc)
        doc.close()

        # Find distinct chapters for report
        distinct_chapters = []
        seen_ch = set()
        for page_num in sorted(chapter_map.keys()):
            ch = (
                chapter_map[page_num]["chapter_number"],
                chapter_map[page_num]["chapter_name"],
            )
            if ch not in seen_ch:
                seen_ch.add(ch)
                distinct_chapters.append(
                    {
                        "chapter_number": ch[0],
                        "chapter_name": ch[1],
                        "start_page": page_num,
                    }
                )

        # Prepare batch updates for ChromaDB
        update_ids: list[str] = []
        update_metas: list[dict[str, Any]] = []
        pdf_updated_count = 0

        for chunk_idx in chunk_indices:
            chunk_id = ids[chunk_idx]
            current_meta = dict(metadatas[chunk_idx])
            page_num = current_meta.get("page", 1)

            ch_info = chapter_map.get(
                page_num, {"chapter_number": "", "chapter_name": ""}
            )
            new_ch_num = ch_info.get("chapter_number", "")
            new_ch_name = ch_info.get("chapter_name", "")

            # Check if an update is needed
            if (
                current_meta.get("chapter_number") != new_ch_num
                or current_meta.get("chapter_name") != new_ch_name
            ):
                current_meta["chapter_number"] = new_ch_num
                current_meta["chapter_name"] = new_ch_name
                # Also ensure source path is resolved properly
                current_meta["source"] = str(pdf_file.resolve())
                current_meta["file_name"] = pdf_file.name

                update_ids.append(chunk_id)
                update_metas.append(current_meta)
                pdf_updated_count += 1

        # Execute updates in batches
        for i in range(0, len(update_ids), batch_size):
            batch_ids = update_ids[i : i + batch_size]
            batch_metas = update_metas[i : i + batch_size]
            collection.update(ids=batch_ids, metadatas=batch_metas)

        total_updated += pdf_updated_count
        pdf_reports.append(
            {
                "source": str(pdf_file.resolve()),
                "file_name": pdf_file.name,
                "status": "success",
                "chunks_count": len(chunk_indices),
                "chunks_updated": pdf_updated_count,
                "chapters_found": len(distinct_chapters),
                "chapters": distinct_chapters,
            }
        )
        print(
            f"  Updated {pdf_updated_count}/{len(chunk_indices)} chunks with "
            f"{len(distinct_chapters)} chapters/sections."
        )

    return {
        "total_chunks_inspected": len(ids),
        "total_chunks_updated": total_updated,
        "pdf_reports": pdf_reports,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract chapter metadata from PDFs and update existing ChromaDB vector entries."
    )
    parser.add_argument(
        "--database",
        type=Path,
        default=Path("info.db"),
        help="Chroma database directory (default: info.db)",
    )
    parser.add_argument(
        "--collection",
        default="pdf_knowledge",
        help="Chroma collection name (default: pdf_knowledge)",
    )
    parser.add_argument(
        "--pdf",
        type=Path,
        default=None,
        help="Optional path to a specific PDF to update (updates all if omitted)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=500,
        help="Batch size for vector DB updates (default: 500)",
    )
    args = parser.parse_args()

    result = update_existing_pdf_chapters(
        database_path=args.database,
        collection_name=args.collection,
        target_pdf_path=args.pdf,
        batch_size=args.batch_size,
    )

    print("\n" + "=" * 60)
    print("PDF Chapter Metadata Migration Summary")
    print("=" * 60)
    print(f"Total chunks inspected: {result['total_chunks_inspected']}")
    print(f"Total chunks updated:   {result['total_chunks_updated']}")
    for report in result["pdf_reports"]:
        print(f"\nPDF: {report.get('file_name', report['source'])}")
        print(f"  Status: {report['status']}")
        print(f"  Chunks updated: {report['chunks_updated']}/{report['chunks_count']}")
        if "chapters" in report:
            print(f"  Chapters extracted ({len(report['chapters'])}):")
            for ch in report["chapters"][:10]:
                num_str = f"Ch {ch['chapter_number']}" if ch["chapter_number"] else "Section"
                print(f"    - Page {ch['start_page']}: [{num_str}] {ch['chapter_name']}")
            if len(report["chapters"]) > 10:
                print(f"    ... and {len(report['chapters']) - 10} more chapters/sections.")


if __name__ == "__main__":
    main()
