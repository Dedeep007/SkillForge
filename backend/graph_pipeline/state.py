from typing import TypedDict, Annotated
import operator
from models.schemas import (
    ExtractionResult, QuestionRecord, ChallengeTask, SkillScore, RoadmapWeek
)

class AssessmentState(TypedDict):
    assessment_id: str
    jd_text: str
    resume_text: str
    hours_per_day: float

    extraction: ExtractionResult | None
    gap_skill_ids: list[str]
    graph_paths: dict[str, list[str]]

    current_skill_index: int
    questions_asked: int
    questions_per_skill: int

    question_records: Annotated[list[QuestionRecord], operator.add]
    conversation_scores: dict[str, float]
    challenge_task: ChallengeTask | None
    pending_answer: str | None

    stream_events: Annotated[list[dict], operator.add]

    skill_scores: list[SkillScore]
    roadmap: list[RoadmapWeek]
    assessment_complete: bool
