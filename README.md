# SkillForge AI

> **From resume claims to real capability.**

A next-generation AI agent that takes a Job Description and a candidate's resume, conversationally assesses real proficiency on each required skill, identifies gaps, and generates a personalised learning plan focused on adjacent skills the candidate can realistically acquire — with curated resources and time estimates.

No simple keyword matching. No generic RAG. Pure **Knowledge Graph traversal** + **multi-agent real-time conversation**.

---

## ⚡ Architecture & Tech Stack

SkillForge AI is built as a full-stack monorepo featuring a powerful Python/AI backend and a blazing fast Next.js frontend.

### Backend (AI & Logic)
- **Framework:** FastAPI
- **Agent Orchestration:** LangGraph (Multi-agent state machines)
- **LLM Engine:** LangChain + Groq (`llama-3.3-70b-versatile`) for lightning-fast inference
- **Knowledge Graph:** NetworkX (Directed graphs with custom edge weights)
- **PDF Processing:** `pdfplumber` for clean JD/Resume extraction

### Frontend (User Interface)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom Industrial Dark Theme
- **State Management:** Zustand
- **Streaming:** Server-Sent Events (SSE) via native Web API `EventSource`

---

## 🧠 How it Works

1. **Extraction (`extractor.py`):** An LLM extracts structured capabilities from the candidate's resume and the target job description.
2. **Gap Analysis (`claim_vs_reality.py`):** Cross-references resume claims against job requirements to flag high-priority gaps.
3. **Conversational Assessment (`interviewer.py` & `scorer.py`):** The agent engages the candidate in a dynamic, progressive Q&A to verify actual competency rather than just stated experience.
4. **Targeted Challenges (`challenger.py`):** For intermediate/senior skills, the agent generates grounded "find-the-bug" style micro-challenges.
5. **Roadmap Generation (`roadmap_generator.py`):** The Knowledge Graph engine (`graph_engine.py`) calculates the shortest learning path from what the candidate *already knows* to what they *need to know*, packaging it into a multi-tiered weekly syllabus.

---

## 🚀 Running Locally

### 1. Start the FastAPI Backend
You will need a [Groq API Key](https://console.groq.com/keys) to run the LLM models.

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Set up your environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

uvicorn main:app --reload --port 8000
```
*The backend API will be running at `http://localhost:8000`*

### 2. Start the Next.js Frontend
In a new terminal window:

```bash
cd frontend
npm install

# Ensure your local environment is pointing to the backend
cp .env.local.example .env.local

npm run dev
```
*The frontend will be running at `http://localhost:3000`*

---

## 📂 Repository Structure

```text
skillforge-ai/
├── backend/                  # Python FastAPI Backend
│   ├── agents/               # LangChain/Groq agent definitions
│   ├── data/                 # Sample JDs and Resumes
│   ├── graph_pipeline/       # LangGraph state machine & nodes
│   ├── knowledge_graph/      # NetworkX implementation & static graph JSON
│   ├── models/               # Pydantic data schemas
│   ├── output/               # Roadmap synthesis logic
│   ├── routers/              # FastAPI endpoints (Upload, Assess, Roadmap)
│   └── scoring/              # Algorithmic mismatch and gap scoring
│
└── frontend/                 # Next.js 14 Frontend
    ├── app/                  # Next.js App Router pages
    ├── components/           # React components (Upload, Assessment, Results)
    ├── hooks/                # Custom React hooks (e.g. SSE streaming)
    └── lib/                  # API clients, Zustand store, and TS Types
```