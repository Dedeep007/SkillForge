from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import json, os

GROQ_MODEL = "llama-3.3-70b-versatile"

SCORER_SYSTEM = """You are a silent technical interview rubric evaluator.
Score the candidate answer on a 0.0–1.0 scale.

Rubric:
0.0–0.2 = No knowledge. Vague or wrong.
0.3–0.4 = Surface awareness only. No applied depth.
0.5–0.6 = Working knowledge. Correct but generic.
0.7–0.8 = Applied knowledge. Specific examples or tradeoffs.
0.9–1.0 = Expert. Edge cases, alternatives, nuanced reasoning.

Note: If the question was a Multiple Choice Question (MCQ), evaluate if their chosen option is correct. Give 0.8–1.0 for the correct choice (1.0 if they also briefly explain why), and 0.0 for an incorrect choice.

Return ONLY valid JSON (no markdown):
{
  "score": 0.72,
  "signal": "move_on",
  "reasoning": "Candidate described specific tradeoffs in FastAPI dependency injection."
}

signal rules:
  "probe_deeper"   → (score < 0.5 OR questions_asked == 1) AND questions_asked < 3
  "fire_challenge" → score < 0.5 AND questions_asked >= 2
  "move_on"        → (score >= 0.5 AND questions_asked >= 2) OR questions_asked >= 3"""

def get_llm() -> ChatGroq:
    return ChatGroq(
        model=GROQ_MODEL,
        api_key=os.getenv("GROQ_API_KEY", "dummy"),
        temperature=0.0,
    )

def score_answer(
    skill: str,
    question: str,
    answer: str,
    questions_asked: int,
) -> dict:
    llm = get_llm()
    prompt = f"Skill: {skill}\nQuestion: {question}\nAnswer: {answer}\nQuestions asked: {questions_asked}"
    messages = [
        SystemMessage(content=SCORER_SYSTEM),
        HumanMessage(content=prompt)
    ]
    response = llm.invoke(messages)
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content)
    except Exception:
        return {"score": 0.0, "signal": "move_on", "reasoning": "Failed to parse response."}

def compute_final_score(resume_evidence: float, conversation_score: float) -> float:
    return round(0.35 * resume_evidence + 0.65 * conversation_score, 3)
