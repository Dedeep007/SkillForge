from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import json, os

GROQ_MODEL = "llama-3.3-70b-versatile"

CHALLENGER_SYSTEM = """You are generating a technical debugging challenge.
The challenge must:
1. Be directly relevant to the target skill
2. Contain exactly ONE bug or design flaw
3. Be solvable in 3–5 minutes by someone with genuine intermediate knowledge
4. Include a brief context sentence before the code/scenario
5. Use markdown with a fenced code block if code is involved

Return ONLY valid JSON (no markdown fences):
{
  "challenge_type": "find_the_bug",
  "skill_id": "docker",
  "context": "Your teammate pushed this Dockerfile. The container starts but immediately exits.",
  "task": "```dockerfile\\nFROM python:3.11\\nWORKDIR /app\\nCOPY . .\\nRUN pip install -r requirements.txt\\nCMD uvicorn main:app --host 0.0.0.0 --port 8000\\n```",
  "expected_answer": "CMD uses shell form — uvicorn won't receive SIGTERM. Fix: CMD [\\"uvicorn\\", \\"main:app\\", \\"--host\\", \\"0.0.0.0\\", \\"--port\\", \\"8000\\"]",
  "difficulty": "intermediate"
}"""

def get_llm() -> ChatGroq:
    return ChatGroq(
        model=GROQ_MODEL,
        api_key=os.getenv("GROQ_API_KEY", "dummy"),
        temperature=0.3,
    )

def generate_challenge(
    skill_id: str,
    graph_path: list[str],
    resume_context: str,
) -> dict:
    llm = get_llm()
    prompt = f"Skill: {skill_id}\nGraph Path: {graph_path}\nResume context: {resume_context}"
    messages = [
        SystemMessage(content=CHALLENGER_SYSTEM),
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
        return {
            "challenge_type": "find_the_bug",
            "skill_id": skill_id,
            "context": "Explain a common bug in this context.",
            "task": "No task generated",
            "expected_answer": "Any reasonable explanation",
            "difficulty": "intermediate"
        }
