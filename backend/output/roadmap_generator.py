import json
from pathlib import Path
from models.schemas import RoadmapWeek, SkillScore
from knowledge_graph.graph_engine import get_engine
from agents.roadmap_builder import generate_custom_roadmap_data

def generate_roadmap(
    skill_scores: list[SkillScore],
    graph_paths: dict[str, list[str]],
    hours_per_day: float = 2.0,
    domain: str = "general",
) -> list[RoadmapWeek]:
    engine = get_engine()
    resources_path = Path("backend/knowledge_graph/resources.json")
    if resources_path.exists():
        with open(resources_path, "r", encoding="utf-8") as f:
            resources_db = json.load(f)
    else:
        resources_db = {}
        
    roadmap = []
    base_hours_per_week = hours_per_day * 5
    week_counter = 1
    
    # 1. Fetch custom LLM analysis
    custom_data = generate_custom_roadmap_data(skill_scores, domain)
    
    # Sort skills: high_gap first, then medium_gap
    gap_skills = [s for s in skill_scores if s.gap_level in ("high_gap", "medium_gap")]
    gap_skills.sort(key=lambda s: 0 if s.gap_level == "high_gap" else 1)
    
    for skill in gap_skills:
        skill_id = skill.skill_id
        path = graph_paths.get(skill_id, [])
        
        resources = []
        if skill_id in resources_db:
            resources = resources_db[skill_id].get("courses", [])
            
        custom_tiers = custom_data.get(skill_id, [])
        
        for tier in [1, 2, 3]:
            # Default values
            mini_project = f"Practice and implement {skill.label} concepts."
            why_msg = f"Essential for mastering {skill.label}."
            
            # Use LLM generated data if available
            for ct in custom_tiers:
                if ct.get("tier") == tier:
                    mini_project = ct.get("mini_project", mini_project)
                    why_msg = ct.get("why", why_msg)
                    break
                    
            roadmap.append(RoadmapWeek(
                week=week_counter,
                skill_id=skill_id,
                label=skill.label,
                tier=tier,
                resources=resources if tier == 1 else [], # Only show resources in Tier 1
                mini_project=mini_project,
                graph_path=path,
                why=why_msg
            ))
            week_counter += 1

    return roadmap
