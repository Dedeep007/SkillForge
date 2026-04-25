from pydantic import BaseModel, Field
from typing import Literal

class JDSkill(BaseModel):
    skill_id: str
    label: str
    priority: Literal["high", "medium", "low"]
    years_required: int | None
    context: str

class ResumeSkill(BaseModel):
    skill_id: str
    label: str
    evidence_strength: float = Field(ge=0.0, le=1.0)
    years_mentioned: int | None
    context: str

class ExtractionResult(BaseModel):
    jd_skills: list[JDSkill]
    resume_skills: list[ResumeSkill]
    seniority_level: Literal["junior", "mid", "senior", "lead"]
    domain: Literal["backend", "data_engineering", "ml", "devops"]

class QuestionRecord(BaseModel):
    skill_id: str
    question: str
    answer: str
    score: float
    signal: Literal["probe_deeper", "fire_challenge", "move_on"]

class ChallengeTask(BaseModel):
    challenge_type: Literal["find_the_bug", "design_flaw", "sql_query"]
    skill_id: str
    context: str
    task: str
    expected_answer: str
    difficulty: Literal["junior", "intermediate", "senior"]

class SkillScore(BaseModel):
    skill_id: str
    label: str
    resume_evidence: float
    conversation_score: float
    final_score: float
    gap_level: Literal["high_gap", "medium_gap", "ready"]
    mismatch: bool
    mismatch_severity: Literal["none", "mild", "significant"]

class RoadmapWeek(BaseModel):
    week: int
    skill_id: str
    label: str
    tier: Literal[1, 2, 3]
    resources: list[dict]
    mini_project: str
    graph_path: list[str]
    why: str

class AssessmentResult(BaseModel):
    assessment_id: str
    extraction: ExtractionResult
    skill_scores: list[SkillScore]
    roadmap: list[RoadmapWeek]
    time_to_ready_weeks: float
    domain: str

class UploadResponse(BaseModel):
    text: str
    filename: str

class StartAssessmentRequest(BaseModel):
    jd_text: str
    resume_text: str
    hours_per_day: float = 2.0
    assessment_id: str | None = None

class StartAssessmentResponse(BaseModel):
    assessment_id: str
    extraction: ExtractionResult
    message: str

class StreamEvent(BaseModel):
    event: Literal[
        "question", "challenge", "skill_complete",
        "assessment_complete", "error", "extraction_complete"
    ]
    skill_id: str | None = None
    skill_label: str | None = None
    content: str | None = None
    progress: float | None = None
    data: dict | None = None
