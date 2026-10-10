# CRYPTON — Serene Botanical Education AI

An AI-powered cybersecurity education platform that provides students with interactive learning experiences: real-time AI tutor chats, structured note generation in 8 formats, interactive quizzes, dynamic flashcards, PDF analysis, and full conversation history.

Designed with a serene botanical aesthetic featuring warm ivory palettes, soft sage accents, and responsive micro-animations.

---

## 🌿 Key Features

- **Interactive AI Chat & Tutor**: Ask cybersecurity and computer science questions with real-time answers powered by Google Gemini.
- **Chat History & Quick Resumption**: Full dialogue history archive with quick one-click resume directly from the sidebar.
- **Multi-Format Study Notes**: Generate notes in 8 structured formats:
  - Bullet Points & Cheat Sheets
  - Comprehensive Executive Summaries
  - FAQs & Key Definitions
  - Flashcard-ready Points & Study Guides
- **Interactive Quizzes**: Multiple-choice assessments with immediate feedback and performance breakdown.
- **Botanical Flashcards**: 3D flip study cards with mastery tracking.
- **PDF Upload & Analysis**: Upload course materials and lecture slides for AI-driven summaries and quizzes.
- **Saved Notes Library**: Bookmark and review generated study materials at any time.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: FastAPI, Python 3.10+, Google GenAI / Gemini API, SQLite, PyPDF2
- **Styling**: Botanical Design System (Warm Ivory `#FAFAF4`, Soft Sage `#DCE8D5`, Deep Olive `#596B3D`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and provide your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore CRYPTON.

---

## 📄 License
MIT License.
