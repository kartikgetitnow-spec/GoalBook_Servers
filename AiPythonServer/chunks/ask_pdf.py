"""Answer a question using relevant chunks from the local PDF VectorDB."""

from __future__ import annotations

import argparse
from pathlib import Path

import chromadb

from gemini_pdf_answerer import GeminiPdfAnswerer


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Search the PDF VectorDB and answer with Gemini."
    )
    parser.add_argument("question", help="Question to ask about the indexed PDFs")
    parser.add_argument(
        "--results",
        type=int,
        default=5,
        help="Number of PDF chunks to provide to Gemini (default: 5)",
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
    args = parser.parse_args()

    if args.results < 1:
        parser.error("results must be at least 1")

    collection = chromadb.PersistentClient(path=str(args.database)).get_collection(
        name=args.collection
    )
    matches = collection.query(
        query_texts=[args.question],
        n_results=args.results,
        include=["documents", "metadatas"],
    )

    chunks = [
        {"text": text, **metadata}
        for text, metadata in zip(matches["documents"][0], matches["metadatas"][0])
    ]
    print(GeminiPdfAnswerer().answer(args.question, chunks))


if __name__ == "__main__":
    main()
