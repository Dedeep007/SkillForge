import networkx as nx
import json
import re
from pathlib import Path
from typing import List, Dict, Optional

class SkillGraphEngine:
    def __init__(self, graph_path: str = "backend/knowledge_graph/skills_graph.json"):
        self.graph = nx.DiGraph()
        path = Path(graph_path)
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for node in data.get("nodes", []):
                    self.graph.add_node(
                        node["id"], 
                        label=node.get("label", node["id"]),
                        domain=node.get("domain", "unknown"),
                        level=node.get("level", "intermediate"),
                        tags=node.get("tags", [])
                    )
                for edge in data.get("edges", []):
                    self.graph.add_edge(
                        edge["source"], 
                        edge["target"], 
                        type=edge.get("type", "PREREQUISITE"),
                        weight=edge.get("weight", 1.0),
                        hop_cost=edge.get("hop_cost", 1)
                    )
                    if edge.get("type") == "COUSIN":
                        # Bidirectional
                        self.graph.add_edge(
                            edge["target"], 
                            edge["source"], 
                            type=edge.get("type", "COUSIN"),
                            weight=edge.get("weight", 1.0),
                            hop_cost=edge.get("hop_cost", 1)
                        )

    def find_shortest_path(self, source_skills: List[str], target_skill: str, max_hops: int = 4) -> Optional[List[str]]:
        best_path = None
        best_cost = float('inf')
        
        if not self.graph.has_node(target_skill):
            return None

        for source in source_skills:
            if not self.graph.has_node(source):
                continue
            try:
                path = nx.shortest_path(self.graph, source=source, target=target_skill, weight="hop_cost")
                if len(path) - 1 <= max_hops:
                    cost = sum(self.graph[path[i]][path[i+1]]['hop_cost'] for i in range(len(path)-1))
                    if cost < best_cost:
                        best_cost = cost
                        best_path = path
            except nx.NetworkXNoPath:
                continue
        return best_path

    def get_adjacent(self, skill_id: str, hops: int = 2) -> List[Dict]:
        if not self.graph.has_node(skill_id):
            return []
        lengths = nx.single_source_dijkstra_path_length(self.graph, skill_id, cutoff=hops, weight="hop_cost")
        paths = nx.single_source_dijkstra_path(self.graph, skill_id, cutoff=hops, weight="hop_cost")
        
        results = []
        for target, cost in lengths.items():
            if target == skill_id:
                continue
            path = paths[target]
            edge_types = [self.graph[path[i]][path[i+1]]['type'] for i in range(len(path)-1)]
            results.append({
                "skill": target,
                "path": path,
                "edge_types": edge_types,
                "total_cost": float(cost)
            })
        results.sort(key=lambda x: x["total_cost"])
        return results

    def get_prerequisites(self, skill_id: str) -> List[str]:
        if not self.graph.has_node(skill_id):
            return []
        return [p for p in self.graph.predecessors(skill_id) if self.graph[p][skill_id]['type'] == 'PREREQUISITE']

    def get_domain(self, skill_id: str) -> str:
        if not self.graph.has_node(skill_id):
            return "unknown"
        return self.graph.nodes[skill_id].get("domain", "unknown")

    def path_to_steps(self, path: List[str]) -> List[Dict]:
        steps = []
        for i in range(len(path) - 1):
            source = path[i]
            target = path[i+1]
            edge_type = self.graph[source][target]['type']
            weeks = 1.5
            if edge_type == 'COUSIN':
                weeks = 0.75
            elif edge_type == 'BRIDGES':
                weeks = 2.5
            steps.append({
                "from": source,
                "to": target,
                "edge_type": edge_type,
                "weeks": weeks
            })
        return steps

    def normalize_skill_id(self, label: str) -> str:
        return re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")

_engine = None

def get_engine() -> SkillGraphEngine:
    global _engine
    if _engine is None:
        _engine = SkillGraphEngine()
    return _engine
