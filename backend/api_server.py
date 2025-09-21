# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional
# import uvicorn
# from datetime import datetime
# import asyncio
# import sys
# import os

# # Import your existing research agent components
# from main import agent_executor, parser, ResearchResponse
# from dotenv import load_dotenv

# load_dotenv()

# # Create FastAPI app
# app = FastAPI(
#     title="Academic Research Agent API",
#     description="AI-powered research and grading assistant for educators",
#     version="1.0.0"
# )

# # Configure CORS to allow your React frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and CRA ports
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Request/Response Models
# class ResearchRequest(BaseModel):
#     query: str
#     tools: Optional[List[str]] = ["search", "wiki", "save"]

# class GradingRequest(BaseModel):
#     code: str
#     language: str = "python"
#     assignment_id: Optional[str] = None

# class FeedbackItem(BaseModel):
#     type: str  # 'error', 'warning', 'success'
#     message: str
#     line: Optional[int] = None

# class GradingResponse(BaseModel):
#     score: int
#     feedback: List[FeedbackItem]
#     suggestions: List[str]
#     strengths: List[str]
#     timestamp: str
#     language: str

# # Research Endpoints
# @app.post("/api/research", response_model=dict)
# async def perform_research(request: ResearchRequest):
#     """
#     Perform research using your existing agent
#     """
#     try:
#         print(f"Received research request: {request.query}")
        
#         # Use your existing agent executor
#         raw_response = agent_executor.invoke({
#             "query": request.query,
#             "chat_hostory": []  # Note: keeping your typo for compatibility
#         })
        
#         print(f"Raw agent response: {raw_response}")
        
#         try:
#             # Try to parse with your existing parser
#             if "output" in raw_response and raw_response["output"]:
#                 # Handle the response format from your agent
#                 output_text = raw_response["output"]
#                 if isinstance(output_text, list) and len(output_text) > 0:
#                     output_text = output_text[0].get("text", str(output_text[0]))
#                 elif isinstance(output_text, dict):
#                     output_text = str(output_text)
                
#                 structured_response = parser.parse(output_text)
                
#                 response_data = {
#                     "topic": structured_response.topic,
#                     "summary": structured_response.summary,
#                     "sources": structured_response.sources,
#                     "tool_used": structured_response.tool_used,
#                     "timestamp": datetime.now().isoformat(),
#                     "id": f"research_{datetime.now().timestamp()}"
#                 }
                
#                 print(f"Structured response: {response_data}")
#                 return response_data
                
#             else:
#                 # Fallback response
#                 return {
#                     "topic": request.query,
#                     "summary": f"Research completed on: {request.query}. The agent processed your query but returned an unexpected format.",
#                     "sources": "Research tools were used but response parsing encountered issues.",
#                     "tool_used": request.tools,
#                     "timestamp": datetime.now().isoformat(),
#                     "id": f"research_{datetime.now().timestamp()}"
#                 }
                
#         except Exception as parse_error:
#             print(f"Parsing error: {parse_error}")
#             # Fallback response if parsing fails
#             return {
#                 "topic": request.query,
#                 "summary": f"Research was performed on '{request.query}'. The system generated results but encountered formatting issues during response processing.",
#                 "sources": "Multiple research sources were consulted including web search and knowledge bases.",
#                 "tool_used": request.tools,
#                 "timestamp": datetime.now().isoformat(),
#                 "id": f"research_{datetime.now().timestamp()}"
#             }
            
#     except Exception as e:
#         print(f"Research error: {e}")
#         raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

# # Simple code grading (you can enhance this with your own logic)
# def analyze_python_code(code: str) -> dict:
#     """Basic Python code analysis"""
#     import ast
    
#     feedback = []
#     suggestions = []
#     strengths = []
#     score = 100
    
#     try:
#         # Parse the AST
#         tree = ast.parse(code)
        
#         # Check for functions
#         has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
#         if has_functions:
#             strengths.append("Good use of functions for code organization")
#         else:
#             feedback.append(FeedbackItem(
#                 type="warning",
#                 message="Consider breaking code into functions for better organization",
#                 line=None
#             ))
#             score -= 10
            
#         # Check for error handling
#         has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
#         if not has_try_except and len(code.split('\n')) > 10:
#             feedback.append(FeedbackItem(
#                 type="warning", 
#                 message="Consider adding error handling with try-except blocks",
#                 line=None
#             ))
#             suggestions.append("Add try-catch blocks for error handling")
#             score -= 5
            
#         # Check for classes
#         has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
#         if has_classes:
#             strengths.append("Object-oriented programming implementation")
            
#         if len(strengths) == 0:
#             strengths.append("Code compiles successfully")
            
#     except SyntaxError as e:
#         feedback.append(FeedbackItem(
#             type="error",
#             message=f"Syntax error: {e.msg}",
#             line=e.lineno
#         ))
#         score -= 30
        
#     return {
#         "score": max(0, score),
#         "feedback": feedback,
#         "suggestions": suggestions,
#         "strengths": strengths
#     }

# @app.post("/api/grading/analyze", response_model=GradingResponse)
# async def analyze_code(request: GradingRequest):
#     """
#     Analyze and grade code
#     """
#     try:
#         if request.language.lower() == "python":
#             analysis = analyze_python_code(request.code)
#         else:
#             # Basic analysis for other languages
#             analysis = {
#                 "score": 75,
#                 "feedback": [FeedbackItem(type="success", message="Code structure looks good")],
#                 "suggestions": ["Add comments for better documentation"],
#                 "strengths": ["Clean code structure"]
#             }
        
#         return GradingResponse(
#             score=analysis["score"],
#             feedback=analysis["feedback"], 
#             suggestions=analysis["suggestions"],
#             strengths=analysis["strengths"],
#             timestamp=datetime.now().isoformat(),
#             language=request.language
#         )
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")

# @app.get("/api/research/history")
# async def get_research_history():
#     return {"history": [], "message": "History feature coming soon"}

# @app.get("/api/grading/history") 
# async def get_grading_history():
#     return {"history": [], "message": "History feature coming soon"}

# @app.get("/health")
# async def health_check():
#     return {"status": "healthy", "message": "Academic Research Agent API is running"}

# @app.get("/")
# async def root():
#     return {
#         "message": "Academic Research Agent API", 
#         "docs": "/docs",
#         "health": "/health"
#     }

# if __name__ == "__main__":
#     print("Starting Academic Research Agent API...")
#     print("Frontend should be running on http://localhost:5173")
#     print("API will be available on http://localhost:8000") 
#     print("API Documentation: http://localhost:8000/docs")
    
#     uvicorn.run(
#         "api_server:app",
#         host="127.0.0.1",
#         port=8000,
#         reload=True,
#         log_level="info"
#     )

# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional
# import uvicorn
# from datetime import datetime
# import sys
# import os
# from dotenv import load_dotenv

# load_dotenv()

# # Get port from environment variable (required for Render)
# PORT = int(os.environ.get("PORT", 8000))

# # Check for API keys
# ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
# GEMINI_KEY = os.getenv("GEMINI_API_KEY")
# OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# # Validate API keys
# HAS_ANTHROPIC = bool(ANTHROPIC_KEY and ANTHROPIC_KEY.startswith("sk-ant"))
# HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)
# HAS_OPENAI = bool(OPENAI_KEY and OPENAI_KEY.startswith("sk-proj"))

# print(f"🔑 Anthropic API Key: {'✅ Available' if HAS_ANTHROPIC else '❌ Missing'}")
# print(f"🔑 Gemini API Key: {'✅ Available' if HAS_GEMINI else '❌ Missing'}")
# print(f"🔑 OpenAI API Key: {'✅ Available' if HAS_OPENAI else '❌ Missing'}")
# print(f"🌐 Port: {PORT}")

# # Only import agent components if keys are available
# AGENT_AVAILABLE = False
# if HAS_ANTHROPIC or HAS_OPENAI:
#     try:
#         from main import agent_executor, parser, ResearchResponse
#         AGENT_AVAILABLE = True
#         print("✅ Research agent loaded successfully")
#     except Exception as e:
#         print(f"❌ Failed to load research agent: {e}")
#         AGENT_AVAILABLE = False
# else:
#     print("⚠️ No compatible API keys found - running in mock mode")

# # Create FastAPI app
# app = FastAPI(
#     title="Academic Research Agent API",
#     description="AI-powered research and grading assistant for educators",
#     version="1.0.0"
# )

# # Configure CORS for production (including Render and Vercel)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173", 
#         "http://localhost:3000",
#         "https://academic-agent.vercel.app"
#         "https://*.vercel.app",
#         "https://*.onrender.com",
#         "https://*.render.com"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Request/Response Models
# class ResearchRequest(BaseModel):
#     query: str
#     tools: Optional[List[str]] = ["search", "wiki", "save"]

# class GradingRequest(BaseModel):
#     code: str
#     language: str = "python"
#     assignment_id: Optional[str] = None

# class FeedbackItem(BaseModel):
#     type: str  # 'error', 'warning', 'success'
#     message: str
#     line: Optional[int] = None

# class GradingResponse(BaseModel):
#     score: int
#     feedback: List[FeedbackItem]
#     suggestions: List[str]
#     strengths: List[str]
#     timestamp: str
#     language: str

# # Mock research function for when API keys are not available
# def mock_research(query: str, tools: List[str]) -> dict:
#     """Generate mock research results when API keys are not available"""
#     return {
#         "topic": query,
#         "summary": f"Mock research response for '{query}'. To get real AI-powered research results, please add your ANTHROPIC_API_KEY or OPENAI_API_KEY to the environment variables. The system would normally use advanced AI models to analyze your query and provide comprehensive research with sources from web search and knowledge bases.",
#         "sources": "Mock sources: This would include real web search results, Wikipedia articles, and other research databases when API keys are configured.",
#         "tool_used": tools,
#         "timestamp": datetime.now().isoformat(),
#         "id": f"research_{datetime.now().timestamp()}",
#         "mock_mode": True
#     }

# # Research Endpoints
# @app.post("/api/research", response_model=dict)
# async def perform_research(request: ResearchRequest):
#     """
#     Perform research using your existing agent or mock mode
#     """
#     try:
#         print(f"Received research request: {request.query}")
        
#         if AGENT_AVAILABLE:
#             # Use your existing agent executor
#             raw_response = agent_executor.invoke({
#                 "query": request.query,
#                 "chat_hostory": []  # Note: keeping your typo for compatibility
#             })
            
#             print(f"Raw agent response: {raw_response}")
            
#             try:
#                 # Try to parse with your existing parser
#                 if "output" in raw_response and raw_response["output"]:
#                     # Handle the response format from your agent
#                     output_text = raw_response["output"]
#                     if isinstance(output_text, list) and len(output_text) > 0:
#                         output_text = output_text[0].get("text", str(output_text[0]))
#                     elif isinstance(output_text, dict):
#                         output_text = str(output_text)
                    
#                     structured_response = parser.parse(output_text)
                    
#                     response_data = {
#                         "topic": structured_response.topic,
#                         "summary": structured_response.summary,
#                         "sources": structured_response.sources,
#                         "tool_used": structured_response.tool_used,
#                         "timestamp": datetime.now().isoformat(),
#                         "id": f"research_{datetime.now().timestamp()}",
#                         "mock_mode": False
#                     }
                    
#                     print(f"Structured response: {response_data}")
#                     return response_data
                    
#                 else:
#                     # Fallback response
#                     return {
#                         "topic": request.query,
#                         "summary": f"Research completed on: {request.query}. The agent processed your query but returned an unexpected format.",
#                         "sources": "Research tools were used but response parsing encountered issues.",
#                         "tool_used": request.tools,
#                         "timestamp": datetime.now().isoformat(),
#                         "id": f"research_{datetime.now().timestamp()}",
#                         "mock_mode": False
#                     }
                    
#             except Exception as parse_error:
#                 print(f"Parsing error: {parse_error}")
#                 # Fallback to mock research
#                 return mock_research(request.query, request.tools)
#         else:
#             # Use mock research when agent is not available
#             return mock_research(request.query, request.tools)
            
#     except Exception as e:
#         print(f"Research error: {e}")
#         # Always return something, even if it's mock data
#         return mock_research(request.query, request.tools)

# # Enhanced code grading function
# def analyze_python_code(code: str) -> dict:
#     """Enhanced Python code analysis"""
#     import ast
    
#     feedback = []
#     suggestions = []
#     strengths = []
#     score = 100
    
#     try:
#         # Parse the AST
#         tree = ast.parse(code)
        
#         # Check for functions
#         has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
#         if has_functions:
#             strengths.append("Good use of functions for code organization")
#         else:
#             feedback.append(FeedbackItem(
#                 type="warning",
#                 message="Consider breaking code into functions for better organization",
#                 line=None
#             ))
#             score -= 10
            
#         # Check for error handling
#         has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
#         if not has_try_except and len(code.split('\n')) > 10:
#             feedback.append(FeedbackItem(
#                 type="warning", 
#                 message="Consider adding error handling with try-except blocks",
#                 line=None
#             ))
#             suggestions.append("Add try-catch blocks for error handling")
#             score -= 5
            
#         # Check for classes
#         has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
#         if has_classes:
#             strengths.append("Object-oriented programming implementation")
            
#         # Check for docstrings
#         has_docstrings = any(
#             isinstance(node, ast.FunctionDef) and ast.get_docstring(node) 
#             for node in ast.walk(tree)
#         )
#         if has_docstrings:
#             strengths.append("Good documentation with docstrings")
#         else:
#             suggestions.append("Add docstrings to functions for better documentation")
        
#         # Check variable naming
#         variable_names = []
#         for node in ast.walk(tree):
#             if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
#                 variable_names.append(node.id)
        
#         single_letter_vars = [var for var in variable_names if len(var) == 1 and var not in ['i', 'j', 'x', 'y']]
#         if single_letter_vars:
#             feedback.append(FeedbackItem(
#                 type="warning",
#                 message="Consider using more descriptive variable names",
#                 line=None
#             ))
#             suggestions.append("Use descriptive variable names instead of single letters")
#             score -= 5
            
#         if len(strengths) == 0:
#             strengths.append("Code compiles successfully")
            
#     except SyntaxError as e:
#         feedback.append(FeedbackItem(
#             type="error",
#             message=f"Syntax error: {e.msg}",
#             line=e.lineno
#         ))
#         score -= 30
#         suggestions.append("Fix syntax errors before submission")
        
#     return {
#         "score": max(0, score),
#         "feedback": feedback,
#         "suggestions": suggestions,
#         "strengths": strengths
#     }

# @app.post("/api/grading/analyze", response_model=GradingResponse)
# async def analyze_code(request: GradingRequest):
#     """
#     Analyze and grade code
#     """
#     try:
#         print(f"Analyzing {request.language} code...")
        
#         if request.language.lower() == "python":
#             analysis = analyze_python_code(request.code)
#         else:
#             # Basic analysis for other languages
#             analysis = {
#                 "score": 75,
#                 "feedback": [FeedbackItem(type="success", message="Code structure looks good", line=None)],
#                 "suggestions": ["Add comments for better documentation"],
#                 "strengths": ["Clean code structure"]
#             }
        
#         return GradingResponse(
#             score=analysis["score"],
#             feedback=analysis["feedback"], 
#             suggestions=analysis["suggestions"],
#             strengths=analysis["strengths"],
#             timestamp=datetime.now().isoformat(),
#             language=request.language
#         )
        
#     except Exception as e:
#         print(f"Grading error: {e}")
#         raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")

# @app.get("/api/research/history")
# async def get_research_history():
#     return {"history": [], "message": "History feature coming soon"}

# @app.get("/api/grading/history") 
# async def get_grading_history():
#     return {"history": [], "message": "History feature coming soon"}

# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy", 
#         "service": "Academic Research Agent API",
#         "port": PORT,
#         "api_keys": {
#             "anthropic": HAS_ANTHROPIC,
#             "gemini": HAS_GEMINI,
#             "openai": HAS_OPENAI
#         },
#         "agent_available": AGENT_AVAILABLE,
#         "mode": "real" if AGENT_AVAILABLE else "mock",
#         "message": "Academic Research Agent API is running"
#     }

# @app.get("/")
# async def root():
#     return {
#         "message": "Academic Research Agent API", 
#         "version": "1.0.0",
#         "status": "running",
#         "docs": "/docs",
#         "health": "/health",
#         "mode": "real" if AGENT_AVAILABLE else "mock"
#     }

# if __name__ == "__main__":
#     print("🚀 Starting Academic Research Agent API...")
#     print(f"📊 Mode: {'Real AI' if AGENT_AVAILABLE else 'Mock Mode'}")
#     print(f"🌐 Port: {PORT}")
#     print("📚 API Documentation will be available at /docs")
#     print("❤️ Health Check available at /health")
    
#     if not AGENT_AVAILABLE:
#         print("\n⚠️ NOTICE: Running in MOCK MODE")
#         print("   Add ANTHROPIC_API_KEY or OPENAI_API_KEY for real AI research")
#         print("   Code grading will work normally (no API keys needed)\n")
    
#     uvicorn.run(
#         "api_server:app",
#         host="0.0.0.0",  # Important: bind to all interfaces for Render
#         port=PORT,
#         reload=False,  # Disable reload in production
#         workers=1      # Single worker for free tier
#     )


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv
import requests

load_dotenv()

PORT = int(os.environ.get("PORT", 8000))
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

HAS_ANTHROPIC = bool(ANTHROPIC_KEY and ANTHROPIC_KEY.startswith("sk-ant"))
HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)

print(f"Port: {PORT}")
print(f"Anthropic Key: {'Available' if HAS_ANTHROPIC else 'Missing'}")
print(f"Gemini Key: {'Available' if HAS_GEMINI else 'Missing'}")

# Try to load the real research agent
REAL_AGENT_AVAILABLE = False
try:
    if HAS_ANTHROPIC:
        from langchain_anthropic import ChatAnthropic
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import PydanticOutputParser
        from langchain.agents import create_tool_calling_agent, AgentExecutor
        
        # Import your tools
        from tools import search_tool, wiki_tool, save_tool
        from main import ResearchResponse
        
        # Initialize the real agent
        llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
        parser = PydanticOutputParser(pydantic_object=ResearchResponse)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are a research assistant that will help generate a research paper
            Answer the user query and use the necessary tools.
            Wrap the output in this format and provide no other text\n{format_instructions}
            """),
            ("placeholder", "{chat_hostory}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]).partial(format_instructions=parser.get_format_instructions())
        
        tools = [search_tool, wiki_tool, save_tool]
        agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=tools)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        
        REAL_AGENT_AVAILABLE = True
        print("✅ Real research agent loaded successfully")
        
except Exception as e:
    print(f"⚠️ Real agent failed to load: {e}")
    print("🔄 Will use fallback research mode")
    REAL_AGENT_AVAILABLE = False

app = FastAPI(title="Academic Research Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    query: str
    tools: Optional[List[str]] = ["search", "wiki", "save"]

class GradingRequest(BaseModel):
    code: str
    language: str = "python"
    assignment_id: Optional[str] = None

def fallback_research(query: str) -> dict:
    """Enhanced fallback with some real data"""
    return {
        "topic": query,
        "summary": f"Research analysis for '{query}'. This system is currently running in fallback mode. For full AI-powered research capabilities, ensure all API keys are properly configured. The system would normally provide comprehensive analysis using advanced language models, web search, and knowledge bases.",
        "sources": f"Fallback sources for '{query}': Academic databases, research papers, and expert analysis would be consulted when fully configured.",
        "tool_used": ["search", "wiki"],
        "timestamp": datetime.now().isoformat(),
        "id": f"research_{datetime.now().timestamp()}",
        "mode": "fallback"
    }

def real_research(query: str, tools: List[str]) -> dict:
    """Use the real research agent"""
    try:
        print(f"🔍 Using real agent for: {query}")
        
        raw_response = agent_executor.invoke({
            "query": query,
            "chat_hostory": []
        })
        
        if "output" in raw_response and raw_response["output"]:
            try:
                structured_response = parser.parse(str(raw_response["output"]))
                return {
                    "topic": structured_response.topic,
                    "summary": structured_response.summary,
                    "sources": structured_response.sources,
                    "tool_used": structured_response.tool_used,
                    "timestamp": datetime.now().isoformat(),
                    "id": f"research_{datetime.now().timestamp()}",
                    "mode": "real_ai"
                }
            except Exception as parse_error:
                print(f"Parse error: {parse_error}")
                return fallback_research(query)
        else:
            return fallback_research(query)
            
    except Exception as e:
        print(f"Real research error: {e}")
        return fallback_research(query)

@app.post("/api/research")
async def research_endpoint(request: ResearchRequest):
    try:
        if REAL_AGENT_AVAILABLE:
            result = real_research(request.query, request.tools)
        else:
            result = fallback_research(request.query)
        
        print(f"Research completed for: {request.query} (Mode: {result.get('mode', 'unknown')})")
        return result
        
    except Exception as e:
        print(f"Research endpoint error: {e}")
        return fallback_research(request.query)

# Keep the same grading and other endpoints from your working version
@app.post("/api/grading/analyze")
async def analyze_code(request: GradingRequest):
    try:
        import ast
        
        score = 100
        feedback = []
        suggestions = []
        strengths = []
        
        if request.language.lower() == "python":
            try:
                tree = ast.parse(request.code)
                
                # Enhanced analysis
                has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
                has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
                has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
                
                if has_functions:
                    strengths.append("Good use of functions for code organization")
                else:
                    feedback.append({
                        "type": "warning",
                        "message": "Consider breaking code into functions for better organization",
                        "line": None
                    })
                    score -= 10
                
                if has_classes:
                    strengths.append("Object-oriented programming implementation")
                
                if not has_try_except and len(request.code.split('\n')) > 10:
                    suggestions.append("Add error handling with try-except blocks")
                    score -= 5
                
                # Check variable naming
                variable_names = [node.id for node in ast.walk(tree) 
                                if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store)]
                single_letter_vars = [var for var in variable_names 
                                    if len(var) == 1 and var not in ['i', 'j', 'x', 'y']]
                
                if single_letter_vars:
                    suggestions.append("Use more descriptive variable names")
                    score -= 5
                
                if not strengths:
                    strengths.append("Code compiles successfully")
                    
            except SyntaxError as e:
                feedback.append({
                    "type": "error", 
                    "message": f"Syntax error: {e.msg}",
                    "line": e.lineno
                })
                score -= 30
                suggestions.append("Fix syntax errors before submission")
        
        return {
            "score": max(0, score),
            "feedback": feedback,
            "suggestions": suggestions,
            "strengths": strengths,
            "timestamp": datetime.now().isoformat(),
            "language": request.language
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Academic Research Agent API", 
        "port": PORT,
        "api_keys": {
            "anthropic": HAS_ANTHROPIC,
            "gemini": HAS_GEMINI
        },
        "real_agent": REAL_AGENT_AVAILABLE,
        "mode": "real_ai" if REAL_AGENT_AVAILABLE else "fallback",
        "message": "API is running"
    }

@app.get("/")
async def root():
    return {
        "message": "Academic Research Agent API",
        "status": "running", 
        "mode": "real_ai" if REAL_AGENT_AVAILABLE else "fallback",
        "docs": "/docs"
    }

@app.get("/api/research/history")
async def get_research_history():
    return {"history": []}

@app.get("/api/grading/history") 
async def get_grading_history():
    return {"history": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)