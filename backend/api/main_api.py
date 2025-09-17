from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from api.research import router as research_router
from api.grading import router as grading_router

# Create FastAPI app
app = FastAPI(
    title="Academic Research Agent API",
    description="AI-powered research and grading assistant for educators",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(research_router)
app.include_router(grading_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Academic Research Agent API is running"}

@app.get("/")
async def root():
    return {"message": "Academic Research Agent API", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run(
        "main_api:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )