import { NoteFormat, StudyNote, DocumentInfo, QuizQuestion, Flashcard, SystemConfig, ChatMessage, ChatSession } from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<{ status: string; service: string; has_api_key: boolean; model: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to connect to backend server');
    return res.json();
  },

  async getConfig(): Promise<SystemConfig> {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  },

  async setApiKey(apiKey: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/config/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to configure key' }));
      throw new Error(err.detail || 'Failed to configure key');
    }
    return res.json();
  },

  async sendChatMessage(
    messages: { role: string; content: string }[],
    sessionId = 'default',
    documentId?: string
  ): Promise<{ reply: string; follow_ups: string[] }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        session_id: sessionId,
        document_id: documentId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = typeof errorData.detail === 'object' ? errorData.detail.message : (errorData.detail || 'Chat request failed');
      throw new Error(msg);
    }
    return res.json();
  },

  async generateNotes(
    topic: string,
    format: NoteFormat = 'DETAILED STUDY NOTES',
    detailLevel = 'standard',
    sourceText?: string,
    documentId?: string
  ): Promise<{ topic: string; format: NoteFormat; content: string }> {
    const res = await fetch(`${API_BASE}/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        format,
        detail_level: detailLevel,
        source_text: sourceText,
        document_id: documentId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = typeof errorData.detail === 'object' ? errorData.detail.message : (errorData.detail || 'Note generation failed');
      throw new Error(msg);
    }
    return res.json();
  },

  async reviseNotes(content: string, instruction: string): Promise<{ content: string }> {
    const res = await fetch(`${API_BASE}/notes/revise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, instruction }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = typeof errorData.detail === 'object' ? errorData.detail.message : (errorData.detail || 'Note revision failed');
      throw new Error(msg);
    }
    return res.json();
  },

  async uploadDocument(file: File): Promise<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Document upload failed');
    }
    return res.json();
  },

  async generateQuiz(topic: string, count = 5, documentId?: string): Promise<{ topic: string; questions: QuizQuestion[] }> {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, count, document_id: documentId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = typeof errorData.detail === 'object' ? errorData.detail.message : (errorData.detail || 'Quiz generation failed');
      throw new Error(msg);
    }
    return res.json();
  },

  async generateFlashcards(topic: string, count = 6, documentId?: string): Promise<{ topic: string; cards: Flashcard[] }> {
    const res = await fetch(`${API_BASE}/flashcards/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, count, document_id: documentId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = typeof errorData.detail === 'object' ? errorData.detail.message : (errorData.detail || 'Flashcards generation failed');
      throw new Error(msg);
    }
    return res.json();
  },

  async getSavedNotes(): Promise<StudyNote[]> {
    try {
      const res = await fetch(`${API_BASE}/notes`);
      if (res.ok) return res.json();
    } catch {
      // fallback to localStorage
    }
    const local = localStorage.getItem('crypton_saved_notes');
    return local ? JSON.parse(local) : [];
  },

  async saveNote(note: Partial<StudyNote> & { title: string; topic: string; format: NoteFormat; content: string }): Promise<StudyNote> {
    try {
      const res = await fetch(`${API_BASE}/notes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (res.ok) {
        const saved = await res.json();
        this.saveLocalNote(saved);
        return saved;
      }
    } catch {
      // fallback
    }

    const fallback: StudyNote = {
      id: note.id || `local-${Date.now()}`,
      title: note.title,
      topic: note.topic,
      format: note.format,
      content: note.content,
      created_at: new Date().toISOString(),
    };
    this.saveLocalNote(fallback);
    return fallback;
  },

  async deleteNote(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const notes = (await this.getSavedNotes()).filter(n => n.id !== id);
    localStorage.setItem('crypton_saved_notes', JSON.stringify(notes));
    return true;
  },

  saveLocalNote(note: StudyNote) {
    const local = localStorage.getItem('crypton_saved_notes');
    let list: StudyNote[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      list[idx] = note;
    } else {
      list.unshift(note);
    }
    localStorage.setItem('crypton_saved_notes', JSON.stringify(list));
  },

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const res = await fetch(`${API_BASE}/chat/sessions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // fallback
    }
    const local = localStorage.getItem('crypton_chat_sessions');
    return local ? JSON.parse(local) : [];
  },

  async getChatSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`);
      if (res.ok) {
        const history: { role: string; content: string }[] = await res.json();
        if (Array.isArray(history) && history.length > 0) {
          return history.map((m, idx) => ({
            id: `msg-${sessionId}-${idx}`,
            role: m.role as 'user' | 'model',
            content: m.content,
            timestamp: '',
          }));
        }
      }
    } catch {
      // fallback
    }
    const local = localStorage.getItem(`crypton_chat_session_${sessionId}`);
    return local ? JSON.parse(local) : [];
  },

  async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/chat/sessions/${sessionId}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const sessions = (await this.getChatSessions()).filter(s => s.session_id !== sessionId);
    localStorage.setItem('crypton_chat_sessions', JSON.stringify(sessions));
    localStorage.removeItem(`crypton_chat_session_${sessionId}`);
    return true;
  },

  async clearAllChatSessions(): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/chat/sessions`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const sessions = await this.getChatSessions();
    sessions.forEach(s => localStorage.removeItem(`crypton_chat_session_${s.session_id}`));
    localStorage.removeItem('crypton_chat_sessions');
    return true;
  },

  saveLocalChatSession(session: ChatSession, messages?: ChatMessage[]) {
    const local = localStorage.getItem('crypton_chat_sessions');
    let list: ChatSession[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(s => s.session_id === session.session_id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...session };
    } else {
      list.unshift(session);
    }
    localStorage.setItem('crypton_chat_sessions', JSON.stringify(list));
    if (messages) {
      localStorage.setItem(`crypton_chat_session_${session.session_id}`, JSON.stringify(messages));
    }
  }
};
