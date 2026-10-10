import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.ai_service import ai_service
from services.pdf_service import pdf_service
from services.db_service import db_service

app = FastAPI(
    title="CRYPTON AI API",
    description="Cybersecurity AI study agent, note generator, exam preparation and quiz API",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document storage for session context (file_id -> doc_info)
DOCUMENTS_STORE: Dict[str, Dict[str, Any]] = {}

# ----------------- Models -----------------

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = "default"
    document_id: Optional[str] = None

class GenerateNotesRequest(BaseModel):
    topic: str
    format: str = "DETAILED STUDY NOTES"
    detail_level: str = "comprehensive"
    source_text: Optional[str] = None
    document_id: Optional[str] = None

class ReviseNotesRequest(BaseModel):
    content: str
    instruction: str

class SaveNoteRequest(BaseModel):
    id: Optional[str] = None
    title: str
    topic: str
    format: str
    content: str

class QuizRequest(BaseModel):
    topic: str
    count: int = Field(default=5, ge=1, le=15)
    document_id: Optional[str] = None

class FlashcardsRequest(BaseModel):
    topic: str
    count: int = Field(default=6, ge=1, le=20)
    document_id: Optional[str] = None

class ConfigKeyRequest(BaseModel):
    api_key: str

# ----------------- Endpoints -----------------

@app.get("/api/health")
def health_check():
    has_key = ai_service.has_api_key()
    return {
        "status": "online",
        "service": "CRYPTON AI Cybersecurity Agent",
        "has_api_key": has_key,
        "model": ai_service.default_model,
        "version": "1.0.0"
    }

@app.get("/api/config")
def get_config():
    return {
        "has_api_key": ai_service.has_api_key(),
        "model": ai_service.default_model,
        "available_formats": [
            "QUICK REVISION",
            "DETAILED STUDY NOTES",
            "UNIVERSITY EXAM ANSWER",
            "2-MARK ANSWER",
            "5-MARK ANSWER",
            "10-MARK ANSWER",
            "LAST-MINUTE REVISION",
            "VIVA PREPARATION"
        ]
    }

@app.post("/api/config/key")
def configure_api_key(req: ConfigKeyRequest):
    if not req.api_key.strip():
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    ai_service.set_api_key(req.api_key.strip())
    return {
        "status": "success",
        "message": "Gemini API key configured successfully",
        "has_api_key": True
    }

@app.post("/api/chat")
def handle_chat(req: ChatRequest):
    if not ai_service.has_api_key():
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MISSING_API_KEY",
                "message": "Gemini API key is not configured. Please enter your Gemini API key in the Settings tab."
            }
        )

    context_doc = None
    if req.document_id and req.document_id in DOCUMENTS_STORE:
        doc = DOCUMENTS_STORE[req.document_id]
        # Retrieve relevant text based on latest message
        latest_msg = req.messages[-1].content if req.messages else ""
        context_doc = pdf_service.retrieve_relevant_chunks(doc.get("chunks", []), latest_msg)

    try:
        messages_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
        result = ai_service.chat(messages_dicts, context_doc=context_doc)

        # Persist conversation to SQLite if session provided
        if req.session_id and req.messages:
            last_user_msg = req.messages[-1]
            db_service.add_chat_message(req.session_id, last_user_msg.role, last_user_msg.content)
            db_service.add_chat_message(req.session_id, "model", result["reply"])

        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "INVALID_KEY", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/notes/generate")
def handle_generate_notes(req: GenerateNotesRequest):
    if not ai_service.has_api_key():
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MISSING_API_KEY",
                "message": "Gemini API key is not configured. Please configure your key in Settings."
            }
        )

    source_text = req.source_text or ""
    if req.document_id and req.document_id in DOCUMENTS_STORE:
        doc = DOCUMENTS_STORE[req.document_id]
        source_text = pdf_service.retrieve_relevant_chunks(doc.get("chunks", []), req.topic, top_k=6)

    try:
        notes_res = ai_service.generate_notes(
            topic=req.topic,
            format_type=req.format,
            detail_level=req.detail_level,
            source_text=source_text
        )
        return notes_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/notes/revise")
def handle_revise_notes(req: ReviseNotesRequest):
    if not ai_service.has_api_key():
        raise HTTPException(
            status_code=400,
            detail={"code": "MISSING_API_KEY", "message": "Gemini API key is not configured."}
        )

    try:
        revised_text = ai_service.revise_notes(req.content, req.instruction)
        return {"content": revised_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/upload")
async def handle_document_upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.txt', '.md')):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF, Markdown, or text file."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 25MB limit.")

    try:
        if file.filename.lower().endswith('.pdf'):
            extracted = pdf_service.extract_text_from_bytes(file_bytes, file.filename)
        else:
            raw_text = file_bytes.decode('utf-8', errors='ignore')
            chunks = pdf_service.chunk_text(raw_text)
            extracted = {
                "filename": file.filename,
                "page_count": 1,
                "word_count": len(raw_text.split()),
                "is_scanned": False,
                "needs_ocr": False,
                "raw_text": raw_text,
                "chunks": chunks,
                "pages": [{"page": 1, "text": raw_text[:2000]}],
            }

        doc_id = str(uuid.uuid4())
        DOCUMENTS_STORE[doc_id] = extracted

        return {
            "document_id": doc_id,
            "filename": extracted["filename"],
            "page_count": extracted["page_count"],
            "word_count": extracted["word_count"],
            "chunk_count": len(extracted["chunks"]),
            "is_scanned": extracted["is_scanned"],
            "preview_snippet": extracted["raw_text"][:400] if extracted["raw_text"] else ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract document: {str(e)}")

@app.post("/api/quiz/generate")
def handle_generate_quiz(req: QuizRequest):
    if not ai_service.has_api_key():
        raise HTTPException(
            status_code=400,
            detail={"code": "MISSING_API_KEY", "message": "Gemini API key is required to generate quizzes."}
        )

    topic_prompt = req.topic
    if req.document_id and req.document_id in DOCUMENTS_STORE:
        doc = DOCUMENTS_STORE[req.document_id]
        context = pdf_service.retrieve_relevant_chunks(doc.get("chunks", []), req.topic, top_k=4)
        topic_prompt = f"{req.topic}\n\nGrounding Text:\n{context}"

    try:
        quiz_data = ai_service.generate_quiz(topic_prompt, count=req.count)
        return {"topic": req.topic, "questions": quiz_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/flashcards/generate")
def handle_generate_flashcards(req: FlashcardsRequest):
    if not ai_service.has_api_key():
        raise HTTPException(
            status_code=400,
            detail={"code": "MISSING_API_KEY", "message": "Gemini API key is required to generate flashcards."}
        )

    topic_prompt = req.topic
    if req.document_id and req.document_id in DOCUMENTS_STORE:
        doc = DOCUMENTS_STORE[req.document_id]
        context = pdf_service.retrieve_relevant_chunks(doc.get("chunks", []), req.topic, top_k=4)
        topic_prompt = f"{req.topic}\n\nGrounding Text:\n{context}"

    try:
        flashcards_data = ai_service.generate_flashcards(topic_prompt, count=req.count)
        return {"topic": req.topic, "cards": flashcards_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- Persistence Endpoints -----------------

@app.get("/api/notes")
def get_saved_notes():
    return db_service.list_notes()

@app.post("/api/notes/save")
def save_note(req: SaveNoteRequest):
    note_id = req.id or str(uuid.uuid4())
    saved = db_service.save_note(
        note_id=note_id,
        title=req.title,
        topic=req.topic,
        format_type=req.format,
        content=req.content
    )
    return saved

@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str):
    success = db_service.delete_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "deleted", "id": note_id}

@app.get("/api/chat/history/{session_id}")
def get_chat_history(session_id: str):
    return db_service.get_chat_history(session_id)

@app.delete("/api/chat/history/{session_id}")
def clear_chat_history(session_id: str):
    db_service.clear_chat_history(session_id)
    return {"status": "cleared", "session_id": session_id}

@app.get("/api/chat/sessions")
def list_chat_sessions():
    return db_service.list_chat_sessions()

@app.get("/api/chat/sessions/{session_id}")
def get_chat_session_messages(session_id: str):
    return db_service.get_chat_history(session_id)

@app.delete("/api/chat/sessions/{session_id}")
def delete_chat_session(session_id: str):
    success = db_service.delete_chat_session(session_id)
    return {"status": "deleted" if success else "not_found", "session_id": session_id}

@app.delete("/api/chat/sessions")
def clear_all_chat_sessions():
    db_service.clear_all_chat_sessions()
    return {"status": "all_cleared"}
