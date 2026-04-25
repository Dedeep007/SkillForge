from graph_pipeline.state import AssessmentState
from agents.extractor import extract_skills
from agents.interviewer import generate_question, get_difficulty
from agents.scorer import score_answer, compute_final_score
from agents.challenger import generate_challenge
from scoring.claim_vs_reality import detect_mismatch
from scoring.gap_classifier import classify_gap
from output.roadmap_generator import generate_roadmap
from knowledge_graph.graph_engine import get_engine
from models.schemas import QuestionRecord, SkillScore, ChallengeTask

def extract_node(state: AssessmentState) -> dict:
    jd_text = state["jd_text"]
    resume_text = state["resume_text"]
    extraction = extract_skills(jd_text, resume_text)
    
    gap_skill_ids = []
    resume_skills_dict = {s.skill_id: s for s in extraction.resume_skills}
    
    for jd_skill in extraction.jd_skills:
        rs = resume_skills_dict.get(jd_skill.skill_id)
        if not rs or rs.evidence_strength < 0.6:
            gap_skill_ids.append(jd_skill.skill_id)
            
    engine = get_engine()
    graph_paths = {}
    known_skills = [s.skill_id for s in extraction.resume_skills if s.evidence_strength >= 0.6]
    if not known_skills:
        known_skills = ["python"] # fallback
    
    for gap_skill in gap_skill_ids:
        path = engine.find_shortest_path(known_skills, gap_skill)
        if path:
            graph_paths[gap_skill] = path
        else:
            graph_paths[gap_skill] = [gap_skill]

    return {
        "extraction": extraction,
        "gap_skill_ids": gap_skill_ids,
        "graph_paths": graph_paths,
        "stream_events": [{"event": "extraction_complete", "data": extraction.model_dump()}]
    }

def interviewer_node(state: AssessmentState) -> dict:
    idx = state.get("current_skill_index", 0)
    gap_skills = state.get("gap_skill_ids", [])
    if idx >= len(gap_skills):
        return {}
        
    skill_id = gap_skills[idx]
    extraction = state["extraction"]
    
    jd_skill = next((s for s in extraction.jd_skills if s.skill_id == skill_id), None)
    rs_skill = next((s for s in extraction.resume_skills if s.skill_id == skill_id), None)
    
    resume_context = rs_skill.context if rs_skill else "No resume context"
    jd_req_level = jd_skill.priority if jd_skill else "medium"
    
    questions_asked = state.get("questions_asked", 0)
    current_score = state.get("conversation_scores", {}).get(skill_id, 0.5)
    
    previous_questions = [q.question for q in state.get("question_records", []) if q.skill_id == skill_id]
    
    skill_label = jd_skill.label if jd_skill else skill_id
    question = generate_question(skill_label, resume_context, jd_req_level, current_score, questions_asked + 1, previous_questions)
    
    qr = QuestionRecord(skill_id=skill_id, question=question, answer="", score=0.0, signal="move_on")
    
    return {
        "stream_events": [{"event": "question", "skill_id": skill_id, "content": question}],
        "questions_asked": questions_asked + 1,
        "question_records": [qr]
    }

def scorer_node(state: AssessmentState) -> dict:
    records = state.get("question_records", [])
    if not records:
        return {}
    
    last_record = records[-1]
    pending_answer = state.get("pending_answer", "")
    questions_asked = state.get("questions_asked", 0)
    
    score_result = score_answer(last_record.skill_id, last_record.question, pending_answer, questions_asked)
    
    # Python lists are mutable, we just mutate the record in place
    last_record.answer = pending_answer
    last_record.score = score_result.get("score", 0.0)
    last_record.signal = score_result.get("signal", "move_on")
    
    conversation_scores = state.get("conversation_scores", {})
    skill_id = last_record.skill_id
    
    skill_records = [r for r in records if r.skill_id == skill_id and r.answer]
    avg_score = sum(r.score for r in skill_records) / len(skill_records) if skill_records else 0.0
    
    conversation_scores[skill_id] = avg_score
    
    update = {
        "conversation_scores": conversation_scores,
        "pending_answer": None,
        "stream_events": []
    }
    
    if last_record.signal == "move_on":
        idx = state.get("current_skill_index", 0)
        update["current_skill_index"] = idx + 1
        update["questions_asked"] = 0
        
    return update

def challenger_node(state: AssessmentState) -> dict:
    idx = state.get("current_skill_index", 0)
    gap_skills = state.get("gap_skill_ids", [])
    if idx >= len(gap_skills):
        return {}
    skill_id = gap_skills[idx]
    
    graph_path = state.get("graph_paths", {}).get(skill_id, [])
    extraction = state["extraction"]
    rs_skill = next((s for s in extraction.resume_skills if s.skill_id == skill_id), None)
    resume_context = rs_skill.context if rs_skill else "No resume context"
    
    challenge = generate_challenge(skill_id, graph_path, resume_context)
    ct = ChallengeTask(**challenge)
    
    markdown_task = challenge.get("task", "")
    
    return {
        "challenge_task": ct,
        "stream_events": [{"event": "challenge", "skill_id": skill_id, "content": markdown_task}],
        "current_skill_index": idx + 1,
        "questions_asked": 0
    }

def output_node(state: AssessmentState) -> dict:
    extraction = state["extraction"]
    conversation_scores = state.get("conversation_scores", {})
    
    resume_skills_dict = {s.skill_id: s for s in extraction.resume_skills}
    skill_scores = []
    
    for jd_skill in extraction.jd_skills:
        skill_id = jd_skill.skill_id
        rs = resume_skills_dict.get(skill_id)
        resume_evidence = rs.evidence_strength if rs else 0.0
        
        conv_score = conversation_scores.get(skill_id, resume_evidence)
        final_score = compute_final_score(resume_evidence, conv_score)
        
        mismatch_data = detect_mismatch(skill_id, resume_evidence, conv_score)
        gap_level = classify_gap(final_score)
        
        skill_scores.append(SkillScore(
            skill_id=skill_id,
            label=jd_skill.label,
            resume_evidence=resume_evidence,
            conversation_score=conv_score,
            final_score=final_score,
            gap_level=gap_level,
            mismatch=mismatch_data["mismatch"],
            mismatch_severity=mismatch_data["severity"]
        ))
        
    graph_paths = state.get("graph_paths", {})
    hours_per_day = state.get("hours_per_day", 2.0)
    
    roadmap = generate_roadmap(skill_scores, graph_paths, hours_per_day)
    
    return {
        "skill_scores": skill_scores,
        "roadmap": roadmap,
        "assessment_complete": True,
        "stream_events": [{"event": "assessment_complete", "data": {"status": "done"}}]
    }
