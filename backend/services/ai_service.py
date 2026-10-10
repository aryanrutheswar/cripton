import os
import json
import re
import requests
from typing import List, Dict, Any, Optional

SYSTEM_PROMPT = """You are CRYPTON, an elite AI cybersecurity professor and research mentor designed specifically for students, university scholars, and aspiring security professionals.

BRAND & IDENTITY:
- Name: CRYPTON
- Tagline: Understand Cybersecurity. Master Every Concept.
- Tone: Highly knowledgeable, encouraging, structured, crystal clear, academically rigorous yet accessible.

STRICT SCOPE LIMITATION:
- You specialize EXCLUSIVELY in cybersecurity, computer networks, cryptography, ethical hacking, digital forensics, defensive malware analysis, application security, cloud security, and computer systems security.
- If a user asks an unrelated topic (e.g. cooking, general pop culture, stock market trading, politics, homework in non-computer subjects), politely decline with:
  "I am CRYPTON, an AI companion exclusively dedicated to cybersecurity and computer security education. Please feel free to ask any question regarding cybersecurity, network security, cryptography, digital forensics, or exam preparation!"

DEFENSIVE & ETHICAL PRINCIPLES:
- Keep all explanations strictly defensive, educational, and ethical.
- Never write weaponized exploits, phishing kits, or malware for illicit deployment.
- For offensive topics (e.g. buffer overflow, SQL injection, XSS), provide safe conceptual examples, vulnerable code snippets within localized educational sandboxes, explain the vulnerability mechanics, and provide comprehensive defensive remediation and secure coding guidelines.

DIDACTIC FORMATTING:
- Explain technical acronyms (e.g. IDS, IPS, RSA, HMAC, MITM) when first introduced.
- Use clear bullet points, comparison tables, step-by-step numbered flows, and educational code snippets with syntax highlighting.
- When architecture or flow is helpful, supply a clean Mermaid diagram block (using ```mermaid ... ```) or a clean text diagram.
- Suggest 2 to 3 insightful follow-up questions at the end of conversational responses to spark deeper student learning.
"""

class AIService:
    def __init__(self):
        self._load_env()
        self.api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        # Default to ultra-fast gemini-3.5-flash-lite
        self.default_model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
        # Persistent HTTP session for connection pooling and instant SSL reuse
        self.session = requests.Session()
        
    def _load_env(self):
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip("'\"")
            except Exception:
                pass

    def set_api_key(self, key: str):
        self.api_key = key.strip()
        os.environ["GEMINI_API_KEY"] = self.api_key
        # Save to .env
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        try:
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(f"GEMINI_API_KEY={self.api_key}\nGEMINI_MODEL={self.default_model}\n")
        except Exception:
            pass

    def has_api_key(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def _call_gemini_raw(
        self,
        contents: List[Dict[str, Any]],
        system_prompt: str = SYSTEM_PROMPT,
        response_mime_type: Optional[str] = None,
        max_tokens: int = 2048,
        temperature: float = 0.3
    ) -> str:
        if not self.has_api_key():
            raise ValueError(
                "Gemini API key is not configured. Please add your GEMINI_API_KEY in the workspace Settings or backend/.env file."
            )

        # Ultra-fast candidate models prioritizing low latency flash-lite
        candidate_models = [self.default_model, "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.1-flash-lite"]
        unique_models = []
        for m in candidate_models:
            if m not in unique_models:
                unique_models.append(m)

        last_error = ""
        for model in unique_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            
            payload: Dict[str, Any] = {
                "contents": contents,
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                }
            }

            if system_prompt:
                payload["system_instruction"] = {
                    "parts": [{"text": system_prompt}]
                }

            if response_mime_type:
                payload["generationConfig"]["response_mime_type"] = response_mime_type

            try:
                resp = self.session.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=25)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                    return "No content generated."
                elif resp.status_code == 400 and "API_KEY_INVALID" in resp.text:
                    raise ValueError("The provided Gemini API Key is invalid. Please check your key.")
                else:
                    last_error = f"Model {model} returned HTTP {resp.status_code}: {resp.text}"
            except requests.exceptions.RequestException as e:
                last_error = str(e)
                continue

        raise RuntimeError(f"Gemini API request failed: {last_error}")

    def chat(self, messages: List[Dict[str, str]], context_doc: Optional[str] = None) -> Dict[str, Any]:
        """Conversational chat with context window and grounding."""
        gemini_contents = []
        
        system = SYSTEM_PROMPT
        if context_doc:
            system += f"\n\nCURRENT UPLOADED STUDY MATERIAL REFERENCE:\n\"\"\"\n{context_doc[:8000]}\n\"\"\"\nEnsure explanations directly ground on or cite this study material whenever relevant."

        # Keep the conversation window tight and focused for speed (last 6 messages)
        recent_messages = messages[-6:] if len(messages) > 6 else messages

        for msg in recent_messages:
            role = "user" if msg.get("role") in ["user", "student"] else "model"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

        response_text = self._call_gemini_raw(gemini_contents, system_prompt=system, max_tokens=1500)

        # Extract suggested follow-ups if present or generate them
        follow_ups = []
        followup_matches = re.findall(r'(?:Suggested Follow-ups?|Follow-up Questions?|Next Topics?):?\s*((?:[-*•\d\.]+\s+[^\n]+\n?)+)', response_text, re.IGNORECASE)
        if followup_matches:
            lines = followup_matches[-1].strip().split("\n")
            for line in lines:
                cleaned = re.sub(r'^[-*•\d\.\s]+', '', line).strip()
                if cleaned and len(cleaned) > 5 and len(cleaned) < 120:
                    follow_ups.append(cleaned)

        if not follow_ups:
            follow_ups = [
                "Can you show a real-world example or case study?",
                "How would this appear in a university examination?",
                "What are the primary defensive countermeasures?"
            ]

        return {
            "reply": response_text,
            "follow_ups": follow_ups[:4],
        }

    def generate_notes(self, topic: str, format_type: str = "DETAILED STUDY NOTES", detail_level: str = "standard", source_text: Optional[str] = None) -> Dict[str, Any]:
        """Generates structured, exam-ready, beautifully formatted cybersecurity notes."""
        
        format_prompts = {
            "QUICK REVISION": """Create a concise, high-yield Quick Revision guide on this topic.
Include:
1. One-sentence core definition
2. Key terms & technical acronyms with definitions
3. Essential differences / comparison table
4. Top 3 exam takeaways""",

            "DETAILED STUDY NOTES": """Create an exceptional, comprehensive, university-grade study note on this topic.
Include:
1. Title & Learning Objectives
2. Formal Definition & Background
3. Core Architecture & Concepts
4. Step-by-Step Technical Mechanism (how it works)
5. Practical Technical Example / Safe Educational Code / Command
6. Comparison Table with related concepts
7. Architecture or Flowchart diagram using Mermaid (```mermaid ... ```)
8. Advantages, Limitations & Attack Vectors
9. Real-World Defensive Applications
10. Final Revision Summary""",

            "UNIVERSITY EXAM ANSWER": """Format this as a model University Examination Answer designed for high marks.
Include:
1. Formal Definition (2 marks worthy)
2. Theoretical Framework & Architecture
3. Labeled Flow Diagram (using Mermaid or clean diagram)
4. Step-by-step working principle
5. Detailed Technical Example
6. Key Advantages and Disadvantages
7. Summary / Conclusion""",

            "2-MARK ANSWER": """Format this strictly as a high-scoring 2-Mark University Question Answer.
Provide:
- A crisp, unambiguous definition (maximum 2-3 sentences)
- 2 essential technical points or keywords that examiners award marks for
- Zero fluff.""",

            "5-MARK ANSWER": """Format this strictly as a 5-Mark University Examination Answer.
Provide:
- Precise Definition & Introduction (1 mark)
- 4-5 Detailed Technical Bullet Points explaining the working principle (3 marks)
- A brief illustrative example or difference table (1 mark)""",

            "10-MARK ANSWER": """Format this strictly as an exhaustive, top-tier 10-Mark University Paper Answer.
Structure:
1. Introduction & Standard Definition
2. Architectural Diagram (generate a valid Mermaid diagram using ```mermaid ... ```)
3. Deep-Dive Working Mechanism (phases, protocols, headers, or algorithms)
4. Concrete Real-World Example / Scenario
5. Comparative Analysis (Table comparing it to alternatives)
6. Security Implications, Strengths & Limitations
7. Countermeasures / Defensive Hardening
8. Academic Conclusion""",

            "LAST-MINUTE REVISION": """Create a high-impact Last-Minute Exam Revision Cheat Sheet.
Include:
- 5 bulleted core facts you cannot forget
- Quick-reference formula or protocol port table
- Common student misconceptions & pitfalls
- Golden exam tips""",

            "VIVA PREPARATION": """Create a complete Viva Voce / Oral Examination Preparation Guide.
Include:
- 6 probable viva questions from the examiner
- Direct, confident answers for each
- Follow-up traps the professor might ask after each answer
- Key definitions to memorize word-for-word"""
        }

        instructions = format_prompts.get(format_type, format_prompts["DETAILED STUDY NOTES"])
        
        prompt = f"""TOPIC: {topic}
FORMAT REQUESTED: {format_type}
DEPTH LEVEL: {detail_level}

{instructions}
"""
        if source_text:
            prompt += f"\n\nGROUND YOUR NOTES ON THE FOLLOWING UPLOADED STUDY MATERIAL:\n\"\"\"\n{source_text[:12000]}\n\"\"\""

        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        max_tokens = 3000 if format_type in ["2-MARK ANSWER", "5-MARK ANSWER", "QUICK REVISION", "LAST-MINUTE REVISION"] else 4096
        note_markdown = self._call_gemini_raw(contents, system_prompt=SYSTEM_PROMPT, max_tokens=max_tokens)

        return {
            "topic": topic,
            "format": format_type,
            "content": note_markdown,
        }

    def revise_notes(self, original_content: str, instruction: str) -> str:
        """Modifies, simplifies, expands, or updates study notes."""
        prompt = f"""Here is an existing cybersecurity study note:
\"\"\"
{original_content}
\"\"\"

REVISION REQUEST: {instruction}

Please revise the notes according to this request while maintaining the clear structure, accurate cybersecurity concepts, and clean Markdown formatting."""

        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        return self._call_gemini_raw(contents, system_prompt=SYSTEM_PROMPT, max_tokens=3000)

    def generate_quiz(self, topic: str, count: int = 5) -> List[Dict[str, Any]]:
        """Generates multiple choice questions with explanations in structured JSON."""
        prompt = f"""Generate a high-quality cybersecurity quiz with exactly {count} multiple-choice questions for the topic: "{topic}".
Return ONLY a valid JSON array of objects with the exact schema:
[
  {{
    "id": 1,
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Detailed explanation of why this answer is correct and why other options are incorrect."
  }}
]
Rules:
- Questions must be technically accurate.
- 4 options per question.
- 'correct_index' is an integer between 0 and 3.
- Do NOT wrap in markdown code blocks if possible, or return raw JSON.
"""
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        raw_text = self._call_gemini_raw(contents, system_prompt=SYSTEM_PROMPT, response_mime_type="application/json", max_tokens=1800)
        
        # Clean json
        cleaned = re.sub(r'^```json\s*', '', raw_text.strip())
        cleaned = re.sub(r'\s*```$', '', cleaned)
        try:
            return json.loads(cleaned)
        except Exception:
            # Fallback regex extraction
            match = re.search(r'\[\s*\{.*\}\s*\]', raw_text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise ValueError("Failed to parse quiz JSON from AI response.")

    def generate_flashcards(self, topic: str, count: int = 6) -> List[Dict[str, Any]]:
        """Generates flashcards for rapid spaced repetition in structured JSON."""
        prompt = f"""Generate exactly {count} interactive cybersecurity flashcards on: "{topic}".
Return ONLY a valid JSON array of objects with the exact schema:
[
  {{
    "id": 1,
    "front": "Question or key term (e.g. 'What is a Nonce in Cryptography?')",
    "back": "Clear, concise technical explanation with exam relevance",
    "category": "e.g. Cryptography / Network Security / Web Security"
  }}
]
Rules:
- Front should be concise and test active recall.
- Back should provide clear explanation and key memorization cue.
- Do NOT wrap in markdown code blocks if possible.
"""
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        raw_text = self._call_gemini_raw(contents, system_prompt=SYSTEM_PROMPT, response_mime_type="application/json", max_tokens=1800)
        
        cleaned = re.sub(r'^```json\s*', '', raw_text.strip())
        cleaned = re.sub(r'\s*```$', '', cleaned)
        try:
            return json.loads(cleaned)
        except Exception:
            match = re.search(r'\[\s*\{.*\}\s*\]', raw_text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise ValueError("Failed to parse flashcards JSON from AI response.")

ai_service = AIService()
