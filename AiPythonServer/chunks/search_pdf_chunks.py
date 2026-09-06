"""Search the local PDF VectorDB and print the most relevant stored chunks.

No LLM or Gemini request is made by this script.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import chromadb


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Search PDF chunks stored in a local Chroma VectorDB."
    )
    parser.add_argument("question", help="Question or search phrase")
    parser.add_argument(
        "--results",
        type=int,
        default=5,
        help="Number of matching chunks to print (default: 5)",
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

    client = chromadb.PersistentClient(path=str(args.database))
    collection = client.get_collection(name=args.collection)
    matches = collection.query(
        query_texts=[args.question],
        n_results=args.results,
        include=["documents", "metadatas", "distances"],
    )

    documents = matches["documents"][0]
    metadata = matches["metadatas"][0]
    distances = matches["distances"][0]

    if not documents:
        print("No matching chunks were found.")
        return

    print(f"Question: {args.question}\n")
    for number, (text, source, distance) in enumerate(
        zip(documents, metadata, distances), start=1
    ):
        chapter_parts = []
        if source.get("chapter_number"):
            chapter_parts.append(f"chapter {source['chapter_number']}")
        if source.get("chapter_name"):
            chapter_parts.append(f"({source['chapter_name']})")
        chapter_str = f" | {' '.join(chapter_parts)}" if chapter_parts else ""

        print(f"{'=' * 72}")
        print(
            f"Match {number} | {source['file_name']} | "
            f"page {source['page']}{chapter_str} | distance: {distance:.4f}"
        )
        print(f"{'-' * 72}")
        print(text)
        print()


if __name__ == "__main__":
    main()
