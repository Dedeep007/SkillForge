def detect_mismatch(
    skill_id: str,
    resume_evidence: float,
    conversation_score: float,
    threshold: float = 0.3,
) -> dict:
    delta = resume_evidence - conversation_score
    mismatch = delta > threshold
    
    if delta < 0.3:
        severity = "none"
        label = "Verified"
    elif delta <= 0.5:
        severity = "mild"
        label = "Slight overstatement"
    else:
        severity = "significant"
        label = "Significant inflation detected"
        
    return {
        "skill_id": skill_id,
        "mismatch": mismatch,
        "delta": round(delta, 3),
        "severity": severity,
        "label": label
    }
