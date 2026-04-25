from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import json, os
from models.schemas import ExtractionResult

GROQ_MODEL = "llama-3.3-70b-versatile"

EXTRACTION_SYSTEM = """You are a skill extraction engine for a technical interview platform.
Extract structured information from a job description and a candidate resume.

Return ONLY valid JSON matching this exact schema — no markdown fences, no explanation:
{
  "jd_skills": [
    {
      "skill_id": "python",
      "label": "Python",
      "priority": "high",
      "years_required": 3,
      "context": "3+ years Python required"
    }
  ],
  "resume_skills": [
    {
      "skill_id": "python",
      "label": "Python",
      "evidence_strength": 0.7,
      "years_mentioned": 2,
      "context": "2 years Python scripting"
    }
  ],
  "seniority_level": "mid",
  "domain": "backend"
}

skill_id rules: lowercase, underscores, no spaces. "GitHub Actions" → "github_actions"
evidence_strength rubric:
  0.0 = not mentioned
  0.4 = mentioned in passing
  0.7 = mentioned with project/years
  1.0 = specific metrics or production outcomes
priority: "high" if required/must-have, "medium" if preferred, "low" if nice-to-have
domain: one of backend | data_engineering | ml | devops"""

def get_llm() -> ChatGroq:
    return ChatGroq(
        model=GROQ_MODEL,
        api_key=os.getenv("GROQ_API_KEY", "dummy"),
        temperature=0.1,
    )

def extract_skills(jd_text: str, resume_text: str) -> ExtractionResult:
    llm = get_llm()
    messages = [
        SystemMessage(content=EXTRACTION_SYSTEM),
        HumanMessage(content=f"JD: {jd_text}\n\nResume: {resume_text}")
    ]
    response = llm.invoke(messages)
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        data = json.loads(content)
        return ExtractionResult.model_validate(data)
    except Exception:
        return ExtractionResult(
            jd_skills=[],
            resume_skills=[],
            seniority_level="junior",
            domain="backend"
        )

def normalize_skill_id(label: str) -> str:
    import re
    return re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
