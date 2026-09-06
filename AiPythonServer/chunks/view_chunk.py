"""Print one chunk and its PDF source metadata from the local Chroma database."""

from __future__ import annotations

import argparse
from pathlib import Path

import chromadb


def main() -> None:
    parser = argparse.ArgumentParser(description="View one stored PDF chunk.")
    parser.add_argument(
        "--number",
        type=int,
        default=0,
        help="Chunk number to view (0 is the first chunk)",
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

    if args.number < 0:
        parser.error("number must be 0 or greater")

    client = chromadb.PersistentClient(path=str(args.database))
    collection = client.get_collection(name=args.collection)
    result = collection.get(
        limit=1,
        offset=args.number,
        include=["documents", "metadatas"],
    )

    if not result["documents"]:
        print(f"No chunk exists at number {args.number}.")
        return

    print(f"Chunk number: {args.number}")
    print(f"Metadata: {result['metadatas'][0]}")
    print("\nChunk text:\n")
    print(result["documents"][0])


if __name__ == "__main__":
    main()
