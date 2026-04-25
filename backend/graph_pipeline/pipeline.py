from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from graph_pipeline.state import AssessmentState
from graph_pipeline.nodes import (
    extract_node, interviewer_node, scorer_node,
    challenger_node, output_node
)
from graph_pipeline.edges import route_after_scorer, route_after_challenger

def build_pipeline():
    builder = StateGraph(AssessmentState)
    
    builder.add_node("extract_node", extract_node)
    builder.add_node("interviewer_node", interviewer_node)
    builder.add_node("scorer_node", scorer_node)
    builder.add_node("challenger_node", challenger_node)
    builder.add_node("output_node", output_node)
    
    builder.add_edge("extract_node", "interviewer_node")
    builder.add_edge("interviewer_node", "scorer_node")
    
    builder.add_conditional_edges(
        "scorer_node",
        route_after_scorer,
        {
            "interviewer_node": "interviewer_node",
            "challenger_node": "challenger_node",
            "output_node": "output_node"
        }
    )
    
    builder.add_conditional_edges(
        "challenger_node",
        route_after_challenger,
        {
            "interviewer_node": "interviewer_node",
            "output_node": "output_node"
        }
    )
    
    builder.add_edge("output_node", END)
    builder.set_entry_point("extract_node")
    
    memory = MemorySaver()
    return builder.compile(
        checkpointer=memory,
        interrupt_before=["scorer_node"],
    )

pipeline = build_pipeline()
