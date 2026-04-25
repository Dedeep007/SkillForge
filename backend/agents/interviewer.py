from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import os

GROQ_MODEL = "llama-3.3-70b-versatile"

INTERVIEWER_SYSTEM = """You are a senior technical interviewer.
Generate ONE question for the given skill and difficulty level.

Rules:
- If difficulty is 'conceptual' or 'scenario', MUST generate a Multiple Choice Question (with A, B, C, D options).
- If difficulty is 'applied' or 'debugging', MUST generate an open-ended descriptive question (NO options).
- For MCQs, clearly list the options but DO NOT include the correct answer in your output.
- Reference the candidate's resume context if available
- Return ONLY the question text (and choices if MCQ) — no numbering, no preamble, and NO answer keys."""

difficulty_ladder = {
    1: "conceptual",
    2: "applied",
    3: "scenario",
}

def get_llm() -> ChatGroq:
    return ChatGroq(
        model=GROQ_MODEL,
        api_key=os.getenv("GROQ_API_KEY", "dummy"),
        temperature=0.7,
    )

def get_difficulty(question_number: int, current_score: float) -> str:
    if question_number == 1:
        return "conceptual"
    if question_number == 2:
        return "applied" if current_score > 0.5 else "conceptual"
    if question_number >= 3:
        return "scenario" if current_score > 0.6 else "applied"
    return "conceptual"

def generate_question(
    skill_label: str,
    resume_context: str,
    jd_requirement_level: str,
    current_score: float,
    question_number: int,
    previous_questions: list[str],
) -> str:
    difficulty = get_difficulty(question_number, current_score)
    llm = get_llm()
    prompt = f"Skill: {skill_label}\nDifficulty: {difficulty}\nResume Context: {resume_context}\nPrevious Questions: {previous_questions}"
    messages = [
        SystemMessage(content=INTERVIEWER_SYSTEM),
        HumanMessage(content=prompt)
    ]
    response = llm.invoke(messages)
    return response.content.strip()
