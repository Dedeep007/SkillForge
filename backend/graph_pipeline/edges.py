from graph_pipeline.state import AssessmentState

def route_after_scorer(state: AssessmentState) -> str:
    records = state.get("question_records", [])
    if not records:
        return "output_node"
        
    last_record = records[-1]
    signal = last_record.signal
    
    if signal == "probe_deeper":
        return "interviewer_node"
    elif signal == "fire_challenge":
        return "challenger_node"
    else:
        idx = state.get("current_skill_index", 0)
        gap_skills = state.get("gap_skill_ids", [])
        if idx < len(gap_skills):
            return "interviewer_node"
        else:
            return "output_node"

def route_after_challenger(state: AssessmentState) -> str:
    idx = state.get("current_skill_index", 0)
    gap_skills = state.get("gap_skill_ids", [])
    if idx < len(gap_skills):
        return "interviewer_node"
    return "output_node"
