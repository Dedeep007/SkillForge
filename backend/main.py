from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assessment, upload, roadmap
from dotenv import load_dotenv

import os
os.environ["LANGGRAPH_STRICT_MSGPACK"] = "false"

load_dotenv()

app = FastAPI(title="SkillForge AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(assessment.router)
app.include_router(roadmap.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
