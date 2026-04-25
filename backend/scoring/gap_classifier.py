def classify_gap(final_score: float) -> str:
    if final_score < 0.3:
        return "high_gap"
    elif final_score < 0.6:
        return "medium_gap"
    else:
        return "ready"
