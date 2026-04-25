from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import (
    StartAssessmentRequest, StartAssessmentResponse, StreamEvent
)
from graph_pipeline.pipeline import pipeline
from graph_pipeline.state import AssessmentState
import uuid, json, asyncio
from typing import Dict

router = APIRouter(prefix="/assess", tags=["assessment"])

active_assessments: Dict[str, dict] = {}

@router.post("/", response_model=StartAssessmentResponse)
async def start_assessment(body: StartAssessmentRequest):
    assessment_id = body.assessment_id if body.assessment_id else str(uuid.uuid4())
    
    config = {"configurable": {"thread_id": assessment_id}}
    active_assessments[assessment_id] = config
    
    state = AssessmentState(
        assessment_id=assessment_id,
        jd_text=body.jd_text,
        resume_text=body.resume_text,
        hours_per_day=body.hours_per_day,
        extraction=None,
        gap_skill_ids=[],
        graph_paths={},
        current_skill_index=0,
        questions_asked=0,
        questions_per_skill=3,
        question_records=[],
        conversation_scores={},
        challenge_task=None,
        pending_answer=None,
        stream_events=[],
        skill_scores=[],
        roadmap=[],
        assessment_complete=False
    )
    
    pipeline.invoke(state, config)
    
    current_state = pipeline.get_state(config)
    st = current_state.values
    
    extraction = st.get("extraction")
    
    return StartAssessmentResponse(
        assessment_id=assessment_id,
        extraction=extraction,
        message="Assessment started"
    )

@router.post("/{assessment_id}/answer")
async def submit_answer(assessment_id: str, answer: str):
    if assessment_id not in active_assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    config = active_assessments[assessment_id]
    
    pipeline.update_state(config, {"pending_answer": answer})
    pipeline.invoke(None, config)
    
    return {"status": "ok"}

@router.get("/{assessment_id}/stream")
async def stream_events(assessment_id: str):
    if assessment_id not in active_assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    config = active_assessments[assessment_id]
    
    async def event_generator():
        last_event_idx = 0
        while True:
            current_state = pipeline.get_state(config)
            st = current_state.values
            if not st:
                await asyncio.sleep(0.2)
                continue
                
            events = st.get("stream_events", [])
            while last_event_idx < len(events):
                event = events[last_event_idx]
                yield f"data: {json.dumps(event)}\n\n"
                last_event_idx += 1
                
            if st.get("assessment_complete"):
                break
                
            await asyncio.sleep(0.2)
            
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
