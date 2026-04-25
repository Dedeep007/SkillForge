from fastapi import APIRouter, HTTPException
from models.schemas import AssessmentResult
from graph_pipeline.pipeline import pipeline
from routers.assessment import active_assessments
from output.roadmap_generator import generate_roadmap

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.get("/{assessment_id}", response_model=AssessmentResult)
async def get_roadmap(assessment_id: str, hours_per_day: float = 2.0):
    if assessment_id not in active_assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    config = active_assessments[assessment_id]
    current_state = pipeline.get_state(config)
    st = current_state.values
    
    if not st.get("assessment_complete"):
        raise HTTPException(status_code=400, detail="Assessment not complete")
        
    roadmap = generate_roadmap(
        st.get("skill_scores", []),
        st.get("graph_paths", {}),
        hours_per_day
    )
    
    return AssessmentResult(
        assessment_id=assessment_id,
        extraction=st["extraction"],
        skill_scores=st.get("skill_scores", []),
        roadmap=roadmap,
        time_to_ready_weeks=len(roadmap),
        domain=st["extraction"].domain
    )
