import io
import re
from typing import List, Dict, Any, Optional

class PDFService:
    def __init__(self, chunk_size: int = 1200, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def extract_text_from_bytes(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Extracts text from PDF bytes using PyMuPDF, falling back to pypdf if needed."""
        text_content = ""
        page_count = 0
        pages_text = []

        # Attempt with PyMuPDF
        try:
            import pymupdf as fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                page_str = page.get_text("text") or ""
                pages_text.append({"page": page_num + 1, "text": page_str})
                text_content += f"\n--- Page {page_num + 1} ---\n" + page_str
            doc.close()
        except Exception as pymupdf_err:
            # Fallback to pypdf
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                page_count = len(reader.pages)
                for page_num, page in enumerate(reader.pages):
                    page_str = page.extract_text() or ""
                    pages_text.append({"page": page_num + 1, "text": page_str})
                    text_content += f"\n--- Page {page_num + 1} ---\n" + page_str
            except Exception as pypdf_err:
                raise ValueError(f"Failed to process PDF file: {str(pypdf_err)}")

        cleaned_text = re.sub(r'[ \t]+', ' ', text_content).strip()
        word_count = len(cleaned_text.split())

        is_scanned = word_count < 25 and page_count > 0

        chunks = self.chunk_text(cleaned_text)

        return {
            "filename": filename,
            "page_count": page_count,
            "word_count": word_count,
            "is_scanned": is_scanned,
            "needs_ocr": is_scanned,
            "raw_text": cleaned_text,
            "chunks": chunks,
            "pages": pages_text,
        }

    def chunk_text(self, text: str) -> List[Dict[str, Any]]:
        """Splits extracted text into overlapping chunks for grounding & retrieval."""
        if not text:
            return []

        chunks = []
        start = 0
        chunk_id = 1
        
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            
            # Try to snap to sentence or paragraph break
            if end < len(text):
                break_point = max(text.rfind("\n\n", start, end), text.rfind(". ", start, end))
                if break_point != -1 and break_point > start + self.chunk_size // 2:
                    end = break_point + 1

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append({
                    "id": chunk_id,
                    "text": chunk_text,
                    "char_start": start,
                    "char_end": end,
                })
                chunk_id += 1

            start = end - self.chunk_overlap
            if start < 0 or start >= len(text):
                break

        return chunks

    def retrieve_relevant_chunks(self, chunks: List[Dict[str, Any]], query: str, top_k: int = 3) -> str:
        """Lightweight keyword-frequency scoring retrieval for grounding without heavy vector DB."""
        if not chunks:
            return ""
        
        query_words = set(re.findall(r'\w+', query.lower()))
        if not query_words:
            # Return first few chunks
            return "\n\n".join([c["text"] for c in chunks[:top_k]])

        scored_chunks = []
        for c in chunks:
            text_lower = c["text"].lower()
            score = 0
            for word in query_words:
                if len(word) > 2:
                    score += text_lower.count(word)
            scored_chunks.append((score, c["text"]))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        relevant = [item[1] for item in scored_chunks[:top_k] if item[0] > 0]
        
        if not relevant:
            # Fallback to the first chunks
            relevant = [item[1] for item in scored_chunks[:top_k]]

        return "\n\n---\n\n".join(relevant)

pdf_service = PDFService()
