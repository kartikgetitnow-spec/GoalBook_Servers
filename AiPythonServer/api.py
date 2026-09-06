"""FastAPI app for the local PDF AI assistant."""

from __future__ import annotations

import sys
import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent
CHUNKS_DIR = ROOT / "chunks"
CLASSES_DIR = ROOT / "Classes"

for path in (CLASSES_DIR, CHUNKS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from pdf_ai_assistant import PdfAiAssistant  # noqa: E402


app = FastAPI(title="PDF AI Assistant", version="1.0.0")
assistant = PdfAiAssistant()
UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR = ROOT / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def figure_directory_for(filename: str) -> Path:
    """Use an existing book folder when the uploaded filename starts with it."""
    book_stem = Path(filename).stem
    matching_folders = [
        folder
        for folder in FIGURES_DIR.iterdir()
        if folder.is_dir() and book_stem.lower().startswith(folder.name.lower())
    ]
    if matching_folders:
        return max(matching_folders, key=lambda folder: len(folder.name))
    return FIGURES_DIR / book_stem


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    results: int = Field(default=5, ge=1)


class PageQuestionsRequest(BaseModel):
    book_name: str = Field(
        ...,
        description="Name or filename of the book, e.g. 'SystemDesignInterview.pdf' or 'SystemDesignInterview'",
    )
    page_number: int = Field(..., ge=1, description="1-based page number")
    num_questions: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of important questions to generate (default: 5)",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="A PDF filename is required")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    original_name = Path(file.filename).name
    upload_id = uuid.uuid4().hex[:12]
    pdf_dir = UPLOAD_DIR / f"{upload_id}_{Path(original_name).stem}"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    destination = pdf_dir / original_name
    figures_dir = figure_directory_for(original_name)
    try:
        with destination.open("wb") as target:
            shutil.copyfileobj(file.file, target)
        indexing_result = assistant.index_and_extract_figures(destination, figures_dir)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - surfaced to the client
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        await file.close()

    return {
        "upload_id": upload_id,
        "filename": destination.name,
        "pdf_path": str(destination),
        "figures_dir": str(figures_dir),
        "chunks_indexed": indexing_result["chunks_indexed"],
        "figures_count": len(indexing_result["figures"]),
        "figures": indexing_result["figures"],
    }


@app.post("/ask")
def ask(request: AskRequest) -> dict[str, str]:
    try:
        answer = assistant.ask(request.question, request.results)
        print(answer)
    except Exception as exc:  # pragma: no cover - surfaced to the client
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"question": request.question, "answer": answer}


@app.post("/page-questions")
def page_questions(request: PageQuestionsRequest) -> dict[str, Any]:
    """Fetch chunks for a specific page from VectorDB and generate 5 important questions with Gemini."""
    try:
        return assistant.generate_page_questions(
            book_name=request.book_name,
            page_number=request.page_number,
            num_questions=request.num_questions,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/books")
def list_books() -> dict[str, list[str]]:
    """List all unique indexed book filenames currently in the vector database."""
    try:
        return {"books": assistant.list_books()}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def main() -> None:
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
