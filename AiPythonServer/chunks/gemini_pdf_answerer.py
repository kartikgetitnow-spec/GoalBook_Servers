"""Gemini answer generation from already-retrieved PDF chunks.

This module intentionally does not read PDFs or query ChromaDB. Pass the user's
question and the chunks your VectorDB has already retrieved to ``answer()``.
"""

from __future__ import annotations

import json
import os
import re
import time
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types


class GeminiPdfAnswerer:
    """Generate grounded answers and questions from retrieved PDF context."""

    def __init__(self, env_file: str | Path = ".env") -> None:
        load_dotenv(dotenv_path=env_file)

        api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing. Add it to your .env file.")
        if not self.model_name:
            raise ValueError("GEMINI_MODEL is missing. Add it to your .env file.")

        self._client = genai.Client(api_key=api_key)

    def _generate_with_retry(
        self,
        contents: str,
        config: types.GenerateContentConfig,
        max_retries: int = 3,
    ) -> str:
        """Call Gemini with retry logic and fallback models for high-demand periods."""
        models = [self.model_name]
        for fallback in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            if fallback not in models:
                models.append(fallback)

        last_error: Exception | None = None
        for model in models:
            for attempt in range(max_retries):
                try:
                    response = self._client.models.generate_content(
                        model=model,
                        contents=contents,
                        config=config,
                    )
                    if response.text:
                        return response.text
                except Exception as exc:
                    last_error = exc
                    error_msg = str(exc).lower()
                    # Retry on temporary unavailable or rate limit errors
                    if "503" in error_msg or "unavailable" in error_msg or "429" in error_msg or "resource_exhausted" in error_msg:
                        time.sleep(1.0 * (attempt + 1))
                        continue
                    # For other errors, move immediately to next model/raise
                    break

        if last_error is not None:
            raise last_error
        return ""

    def answer(self, question: str, chunks: Sequence[str | Mapping[str, Any]]) -> str:
        """Return an answer using only the chunks provided by the caller.

        Each item in ``chunks`` can be a plain string, or a dictionary such as:
        ``{"text": "...", "page": 12, "source": "book.pdf"}``.
        """
        if not question.strip():
            raise ValueError("question cannot be empty")
        if not chunks:
            return "I could not find this in the PDF."

        context = self._format_context(chunks)
        prompt = f"""PDF context:
{context}

Question: {question}

Answer the question using only the PDF context above. Do not use outside
knowledge or make up facts. If the answer is not in the context, reply exactly:
I could not find this in the PDF.

When a source/page label is available, cite it in the answer.
Answer clearly and finish on a complete sentence ending with a full stop."""

        response_text = self._generate_with_retry(
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=1000,
            ),
        )

        if not response_text:
            return "Gemini did not return an answer."
        return self._complete_sentence(response_text)

    def generate_questions(
        self,
        chunks: Sequence[str | Mapping[str, Any]],
        num_questions: int = 5,
    ) -> list[dict[str, str]]:
        """Generate distinct, important questions and their answers based on retrieved PDF chunks."""
        if not chunks:
            raise ValueError("chunks cannot be empty")
        if num_questions < 1:
            raise ValueError("num_questions must be at least 1")

        context = self._format_context(chunks)
        prompt = f"""You are an expert technical educator and interviewer.
Read the following content from a document:
---
{context}
---

Generate exactly {num_questions} distinct, important, and thought-provoking questions along with accurate, comprehensive answers based strictly on the provided content.
Requirements:
- Each question must be substantive, distinct, and directly answerable from or relevant to the key concepts on this page.
- Each answer must be grounded, factual, clear, and complete based solely on the text.
- Avoid duplicate, generic, or trivial questions.
- Focus on key mechanisms, trade-offs, definitions, and technical decisions presented in the text.
- Return the output strictly as a valid JSON array of {num_questions} objects with 'question' and 'answer' keys:
[
  {{"question": "Question 1 text...", "answer": "Detailed answer 1 text..."}},
  {{"question": "Question 2 text...", "answer": "Detailed answer 2 text..."}}
]
Output valid JSON only with no surrounding markdown or explanation."""

        response_text = self._generate_with_retry(
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3,
                max_output_tokens=2048,
            ),
        )

        if not response_text:
            raise RuntimeError("Gemini did not return any questions.")

        text = response_text.strip()

        def parse_items(items: list[Any]) -> list[dict[str, str]]:
            result: list[dict[str, str]] = []
            for item in items:
                if isinstance(item, dict):
                    q = str(item.get("question") or "").strip()
                    a = str(item.get("answer") or "").strip()
                    if q:
                        result.append({"question": q, "answer": a})
                elif isinstance(item, str) and item.strip():
                    result.append({"question": item.strip(), "answer": ""})
            return result

        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                res = parse_items(parsed)
                if res:
                    return res[:num_questions]
            if isinstance(parsed, dict):
                for key in ("questions", "qa_pairs", "items", "results"):
                    if key in parsed and isinstance(parsed[key], list):
                        res = parse_items(parsed[key])
                        if res:
                            return res[:num_questions]
        except json.JSONDecodeError:
            pass

        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                if isinstance(parsed, list):
                    res = parse_items(parsed)
                    if res:
                        return res[:num_questions]
            except json.JSONDecodeError:
                pass

        lines = [
            line.strip().lstrip("0123456789.-*•) ")
            for line in text.splitlines()
            if line.strip() and not line.strip().startswith(("[", "]", "{", "}"))
        ]
        return [{"question": q, "answer": ""} for q in lines[:num_questions]]

    @staticmethod
    def _complete_sentence(answer: str) -> str:
        """Drop an incomplete trailing sentence from the model response."""
        answer = answer.strip()
        last_full_stop = answer.rfind(".")
        if last_full_stop == -1:
            return answer
        return answer[: last_full_stop + 1].strip()

    @staticmethod
    def _format_context(chunks: Sequence[str | Mapping[str, Any]]) -> str:
        formatted_chunks: list[str] = []

        for index, chunk in enumerate(chunks, start=1):
            if isinstance(chunk, str):
                formatted_chunks.append(f"[Chunk {index}]\n{chunk}")
                continue

            text = str(chunk.get("text") or chunk.get("document") or "").strip()
            if not text:
                continue

            source = chunk.get("source") or chunk.get("file_name")
            page = chunk.get("page")
            chapter_number = chunk.get("chapter_number")
            chapter_name = chunk.get("chapter_name")
            labels = []
            if source:
                labels.append(f"source: {source}")
            if chapter_number:
                labels.append(f"chapter: {chapter_number}")
            if chapter_name:
                labels.append(f"chapter_name: {chapter_name}")
            if page is not None:
                labels.append(f"page: {page}")

            label = f" ({', '.join(labels)})" if labels else ""
            formatted_chunks.append(f"[Chunk {index}{label}]\n{text}")

        if not formatted_chunks:
            raise ValueError("chunks did not contain any text")
        return "\n\n".join(formatted_chunks)
