import json
from pathlib import Path
from models.schemas import RoadmapWeek, SkillScore
from knowledge_graph.graph_engine import get_engine

def generate_roadmap(
    skill_scores: list[SkillScore],
    graph_paths: dict[str, list[str]],
    hours_per_day: float = 2.0,
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
    
    # Sort skills: high_gap first, then medium_gap
    gap_skills = [s for s in skill_scores if s.gap_level in ("high_gap", "medium_gap")]
    gap_skills.sort(key=lambda s: 0 if s.gap_level == "high_gap" else 1)
    
    for skill in gap_skills:
        skill_id = skill.skill_id
        path = graph_paths.get(skill_id, [])
        path_str = " → ".join(path)
        
        resources = []
        if skill_id in resources_db:
            resources = resources_db[skill_id].get("courses", [])
            
        why_msg = "Direct learning path"
        if len(path) > 1:
            source = path[0]
            target = path[-1]
            hops = len(path) - 1
            has_edges = True if engine.graph.has_node(source) and engine.graph.has_node(target) else False
            if has_edges:
                edge_type = "path"
                try:
                    if hops == 1:
                        edge_type = engine.graph[source][target]["type"]
                except:
                    pass
                why_msg = f"You already know {source} → {target} is {edge_type} ({hops} hop)"
            else:
                why_msg = f"Building up from {source} to {target}"
                
        roadmap.append(RoadmapWeek(
            week=week_counter,
            skill_id=skill_id,
            label=skill.label,
            tier=1,
            resources=resources,
            mini_project=f"Build a basic script using {skill.label} core features",
            graph_path=path,
            why=why_msg
        ))
        week_counter += 1
        
        roadmap.append(RoadmapWeek(
            week=week_counter,
            skill_id=skill_id,
            label=skill.label,
            tier=2,
            resources=[],
            mini_project=f"Integrate {skill.label} into a broader project",
            graph_path=path,
            why=why_msg
        ))
        week_counter += 1
        
        roadmap.append(RoadmapWeek(
            week=week_counter,
            skill_id=skill_id,
            label=skill.label,
            tier=3,
            resources=[],
            mini_project=f"Solve a role-specific scenario with {skill.label}",
            graph_path=path,
            why=why_msg
        ))
        week_counter += 1

    return roadmap
