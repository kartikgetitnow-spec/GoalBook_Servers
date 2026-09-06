"""One class interface for indexing, searching, answering, and PDF figures."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

import chromadb

from extract_pdf_diagrams import extract_figures
from gemini_pdf_answerer import GeminiPdfAnswerer
from index_pdf_to_vectordb import index_pdf
from update_pdf_chapters_in_vectordb import update_existing_pdf_chapters


class PdfAiAssistant:
    """Work with indexed PDFs through one simple object.

    Example:
        pdf_ai = PdfAiAssistant()
        pdf_ai.index("book.pdf")
        print(pdf_ai.ask("What is a rate limiter?"))
    """

    def __init__(
        self,
        database: str | Path = "info.db",
        collection: str = "pdf_knowledge",
        env_file: str | Path = ".env",
    ) -> None:
        self.database = Path(database)
        self.collection_name = collection
        self._env_file = env_file
        self._answerer: GeminiPdfAnswerer | None = None

    def index(
        self,
        pdf_path: str | Path,
        chunk_size: int = 1000,
        overlap: int = 150,
    ) -> int:
        """Extract, chunk, and store a PDF. Return the number of chunks saved."""
        pdf = Path(pdf_path)
        if not pdf.is_file():
            raise FileNotFoundError(f"PDF not found: {pdf}")
        if chunk_size < 1 or not 0 <= overlap < chunk_size:
            raise ValueError("chunk_size must be positive and overlap must be smaller")

        return index_pdf(pdf, self.database, self.collection_name, chunk_size, overlap)

    def index_and_extract_figures(
        self,
        pdf_path: str | Path,
        figures_dir: str | Path = "figures",
        chunk_size: int = 1000,
        overlap: int = 150,
        dpi: int = 180,
        allow_fallback_crops: bool = True,
    ) -> dict[str, Any]:
        """Index PDF text first, then extract its diagrams and figures."""
        chunks_indexed = self.index(pdf_path, chunk_size, overlap)
        figures = self.extract_diagrams(
            pdf_path,
            figures_dir,
            dpi,
            allow_fallback_crops,
        )
        return {
            "chunks_indexed": chunks_indexed,
            "figures": figures,
        }

    def update_chapters(
        self,
        pdf_path: str | Path | None = None,
        batch_size: int = 500,
    ) -> dict[str, Any]:
        """Update existing vector DB entries with chapter numbers and names."""
        return update_existing_pdf_chapters(
            database_path=self.database,
            collection_name=self.collection_name,
            target_pdf_path=pdf_path,
            batch_size=batch_size,
        )

    def search(self, question: str, results: int = 5) -> list[dict[str, Any]]:
        """Return the best matching stored PDF chunks and their metadata."""
        if not question.strip():
            raise ValueError("question cannot be empty")
        if results < 1:
            raise ValueError("results must be at least 1")

        matches = self._collection().query(
            query_texts=[question],
            n_results=results,
            include=["documents", "metadatas", "distances"],
        )
        return [
            {"text": text, "distance": distance, **metadata}
            for text, metadata, distance in zip(
                matches["documents"][0],
                matches["metadatas"][0],
                matches["distances"][0],
            )
        ]

    def get_chunk(self, number: int) -> dict[str, Any] | None:
        """Return one stored chunk by its zero-based number, or ``None``."""
        if number < 0:
            raise ValueError("number must be 0 or greater")

        result = self._collection().get(
            limit=1,
            offset=number,
            include=["documents", "metadatas"],
        )
        if not result["documents"]:
            return None
        return {"text": result["documents"][0], **result["metadatas"][0]}

    def answer(
        self, question: str, chunks: Sequence[str | Mapping[str, Any]]
    ) -> str:
        """Ask Gemini to answer from chunks supplied by the caller."""
        if self._answerer is None:
            self._answerer = GeminiPdfAnswerer(self._env_file)
        return self._answerer.answer(question, chunks)

    def ask(self, question: str, results: int = 5) -> str:
        """Search the PDF VectorDB, then return a grounded Gemini answer."""
        return self.answer(question, self.search(question, results))

    def list_books(self) -> list[str]:
        """Return the list of unique book filenames stored in the database."""
        data = self._collection().get(include=["metadatas"])
        filenames = {
            meta.get("file_name")
            for meta in data["metadatas"]
            if meta.get("file_name")
        }
        return sorted(filenames)

    def resolve_book_name(self, book_name: str) -> str:
        """Resolve user-provided book name or pattern to the matching indexed filename."""
        available_books = self.list_books()
        if not available_books:
            raise ValueError("No books have been indexed in the database yet.")

        normalized_query = book_name.strip().lower()
        # 1. Exact match
        for book in available_books:
            if book.lower() == normalized_query:
                return book

        # 2. Match without extension
        query_stem = Path(book_name).stem.lower()
        for book in available_books:
            if Path(book).stem.lower() == query_stem:
                return book

        # 3. Substring match
        matches = [
            book
            for book in available_books
            if normalized_query in book.lower()
            or book.lower() in normalized_query
            or query_stem in Path(book).stem.lower()
        ]
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            return max(matches, key=len)

        raise ValueError(
            f"Book '{book_name}' was not found. Available books: {', '.join(available_books)}"
        )

    def get_page_chunks(
        self, book_name: str, page_number: int
    ) -> list[dict[str, Any]]:
        """Fetch all vector DB chunks for a given book and page number."""
        if page_number < 1:
            raise ValueError("page_number must be 1 or greater")

        resolved_name = self.resolve_book_name(book_name)
        result = self._collection().get(
            where={"$and": [{"file_name": resolved_name}, {"page": page_number}]},
            include=["documents", "metadatas"],
        )

        chunks = [
            {"text": doc, **meta}
            for doc, meta in zip(result["documents"], result["metadatas"])
        ]
        chunks.sort(key=lambda c: c.get("chunk", 0))
        return chunks

    def generate_page_questions(
        self,
        book_name: str,
        page_number: int,
        num_questions: int = 5,
    ) -> dict[str, Any]:
        """Retrieve chunks for a page from vector DB and generate important questions via Gemini."""
        resolved_name = self.resolve_book_name(book_name)
        chunks = self.get_page_chunks(resolved_name, page_number)

        if not chunks:
            raise ValueError(
                f"No content chunks found for book '{resolved_name}' on page {page_number}. "
                f"The page may be blank, an image without text, or out of range."
            )

        if self._answerer is None:
            self._answerer = GeminiPdfAnswerer(self._env_file)

        questions = self._answerer.generate_questions(
            chunks, num_questions=num_questions
        )
        sample_meta = chunks[0]

        return {
            "book_name": resolved_name,
            "page_number": page_number,
            "chapter_number": sample_meta.get("chapter_number", ""),
            "chapter_name": sample_meta.get("chapter_name", ""),
            "chunks_count": len(chunks),
            "questions_count": len(questions),
            "questions": questions,
        }

    def extract_diagrams(
        self,
        pdf_path: str | Path,
        output_dir: str | Path = "figures",
        dpi: int = 180,
        allow_fallback_crops: bool = True,
    ) -> list[dict]:
        """Extract detected PDF figures as PNG images and return metadata."""
        pdf = Path(pdf_path)
        if not pdf.is_file():
            raise FileNotFoundError(f"PDF not found: {pdf}")
        if dpi < 72:
            raise ValueError("dpi must be at least 72")

        return extract_figures(pdf, Path(output_dir), dpi, allow_fallback_crops)

    def _collection(self) -> chromadb.Collection:
        client = chromadb.PersistentClient(path=str(self.database))
        return client.get_collection(name=self.collection_name)
