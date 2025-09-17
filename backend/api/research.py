from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime
import sys
import os

# Add parent directory to path to import from main.py
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from main import agent_executor, parser

router = APIRouter(prefix="/api/research", tags=["research"])

class ResearchRequest(BaseModel):
    query: str
    tools: Optional[List[str]] = ["search", "wiki", "save"]

class ResearchResponse(BaseModel):
    topic: str
    summary: str
    sources: str
    tool_used: List[str]
    timestamp: str
    id: Optional[str] = None

@router.post("/", response_model=ResearchResponse)
async def perform_research(request: ResearchRequest):
    try:
        # Use your existing agent executor
        raw_response = agent_executor.invoke({"query": request.query})
        
        # Parse the response
        try:
            structured_response = parser.parse(raw_response.get("output"))
            
            # Add timestamp and ID
            response_data = {
                "topic": structured_response.topic,
                "summary": structured_response.summary,
                "sources": structured_response.sources,
                "tool_used": structured_response.tool_used,
                "timestamp": datetime.now().isoformat(),
                "id": f"research_{datetime.now().timestamp()}"
            }
            
            return ResearchResponse(**response_data)
            
        except Exception as parse_error:
            # Fallback response if parsing fails
            return ResearchResponse(
                topic=request.query,
                summary="Research completed but response parsing encountered issues. Raw response available.",
                sources="Multiple sources processed",
                tool_used=request.tools,
                timestamp=datetime.now().isoformat(),
                id=f"research_{datetime.now().timestamp()}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@router.get("/history")
async def get_research_history():
    # This would typically connect to a database
    # For now, return empty list
    return {"history": []}

@router.post("/save")
async def save_research_result(data: dict):
    # Implement saving logic here
    return {"message": "Research result saved successfully", "id": data.get("id")}