import os
import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from models.schemas import SkillScore

GROQ_MODEL = "llama-3.3-70b-versatile"

ROADMAP_SYSTEM = """You are a senior technical mentor.
Given a list of skills where a candidate has a gap, and their target domain, generate a personalized 3-tier roadmap for EACH skill.

Tier 1: Core concepts and fundamentals
Tier 2: Intermediate integration and application
Tier 3: Advanced / Role-specific scenario

For each tier, provide a highly specific, customized 'mini_project' description (2-3 sentences) that is directly relevant to their domain. DO NOT use generic phrases.
Also provide a 1-sentence 'why' explaining why this step is critical for overcoming their specific gap.

Return valid JSON in this exact format:
{
  "skill_id_1": [
    {
      "tier": 1,
      "mini_project": "Build a simple API using FastAPI and Pydantic to validate user inputs.",
      "why": "This establishes the fundamental routing and validation concepts."
    },
    {
      "tier": 2,
      "mini_project": "...",
      "why": "..."
    },
    {
      "tier": 3,
      "mini_project": "...",
      "why": "..."
    }
  ]
}
"""

def generate_custom_roadmap_data(skill_scores: list[SkillScore], domain: str) -> dict:
    gap_skills = [s for s in skill_scores if s.gap_level in ("high_gap", "medium_gap")]
    if not gap_skills:
        return {}
        
    prompt = f"Domain: {domain}\nGap Skills to analyze:\n"
    for s in gap_skills:
        prompt += f"- ID: {s.skill_id} | Label: {s.label} | Gap: {s.gap_level} | Final Score: {s.final_score:.2f}\n"
        
    llm = ChatGroq(
        model=GROQ_MODEL,
        api_key=os.getenv("GROQ_API_KEY", "dummy"),
        temperature=0.4,
    )
    
    messages = [
        SystemMessage(content=ROADMAP_SYSTEM),
        HumanMessage(content=prompt)
    ]
    
    try:
        response = llm.invoke(messages)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content)
    except Exception as e:
        print("Roadmap builder error:", e)
        return {}
