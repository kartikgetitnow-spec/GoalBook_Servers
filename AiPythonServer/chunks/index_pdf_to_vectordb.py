"""Index a PDF into a persistent local Chroma vector database.

This script only performs ingestion: PDF text extraction, chunking, and storage.
It does not call an LLM or answer questions.
"""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

import chromadb
import pymupdf

try:
    from chapter_extractor import extract_pdf_chapters
except ImportError:
    from chunks.chapter_extractor import extract_pdf_chapters


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text into overlapping chunks, preferring to break at whitespace."""
    text = " ".join(text.split())
    if not text:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))

        # Avoid cutting a word in half when there is room to move the boundary.
        if end < len(text):
            boundary = text.rfind(" ", start, end)
            if boundary > start:
                end = boundary

        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap

    return chunks


def index_pdf(
    pdf_path: Path,
    database_path: Path,
    collection_name: str,
    chunk_size: int,
    overlap: int,
) -> int:
    client = chromadb.PersistentClient(path=str(database_path))
    collection = client.get_or_create_collection(name=collection_name)

    document = pymupdf.open(pdf_path)
    file_hash = hashlib.sha256(pdf_path.read_bytes()).hexdigest()[:16]
    chapter_map = extract_pdf_chapters(document)

    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict[str, str | int]] = []

    for page_number, page in enumerate(document, start=1):
        page_text = page.get_text("text")
        ch_info = chapter_map.get(page_number, {"chapter_number": "", "chapter_name": ""})
        for chunk_number, text_chunk in enumerate(
            chunk_text(page_text, chunk_size, overlap)
        ):
            ids.append(f"{file_hash}-p{page_number}-c{chunk_number}")
            documents.append(text_chunk)
            metadatas.append(
                {
                    "source": str(pdf_path.resolve()),
                    "file_name": pdf_path.name,
                    "page": page_number,
                    "chunk": chunk_number,
                    "chapter_number": ch_info.get("chapter_number", ""),
                    "chapter_name": ch_info.get("chapter_name", ""),
                }
            )

    if not documents:
        raise ValueError(
            "No selectable text was found. The PDF may be scanned and need OCR first."
        )

    # Upsert in batches makes it safe and robust for large PDFs
    batch_size = 200
    for i in range(0, len(documents), batch_size):
        collection.upsert(
            ids=ids[i : i + batch_size],
            documents=documents[i : i + batch_size],
            metadatas=metadatas[i : i + batch_size],
        )
    return len(documents)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract PDF text, chunk it, and store it in a local Chroma VectorDB."
    )
    parser.add_argument("pdf", type=Path, help="Path to the PDF to index")
    parser.add_argument(
        "--database",
        type=Path,
        default=Path("info.db"),
        help="Directory where Chroma persists the vectors (default: info.db)",
    )
    parser.add_argument(
        "--collection", default="pdf_knowledge", help="Chroma collection name"
    )
    parser.add_argument("--chunk-size", type=int, default=1000)
    parser.add_argument("--overlap", type=int, default=150)
    args = parser.parse_args()

    if not args.pdf.is_file():
        parser.error(f"PDF not found: {args.pdf}")
    if args.chunk_size < 1 or not 0 <= args.overlap < args.chunk_size:
        parser.error("chunk-size must be positive and overlap must be smaller than chunk-size")

    count = index_pdf(
        args.pdf, args.database, args.collection, args.chunk_size, args.overlap
    )
    print(
        f"Indexed {count} chunks from '{args.pdf.name}' into "
        f"'{args.database}' (collection: '{args.collection}')."
    )


if __name__ == "__main__":
    main()
