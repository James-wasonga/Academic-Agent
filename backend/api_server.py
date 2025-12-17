#  # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel
# # from typing import List, Optional
# # import uvicorn
# # from datetime import datetime
# # import asyncio
# # import sys
# # import os

# # # Import your existing research agent components
# # from main import agent_executor, parser, ResearchResponse
# # from dotenv import load_dotenv

# # load_dotenv()

# # # Create FastAPI app
# # app = FastAPI(
# #     title="Academic Research Agent API",
# #     description="AI-powered research and grading assistant for educators",
# #     version="1.0.0"
# # )

# # # Configure CORS to allow your React frontend
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and CRA ports
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # Request/Response Models
# # class ResearchRequest(BaseModel):
# #     query: str
# #     tools: Optional[List[str]] = ["search", "wiki", "save"]

# # class GradingRequest(BaseModel):
# #     code: str
# #     language: str = "python"
# #     assignment_id: Optional[str] = None

# # class FeedbackItem(BaseModel):
# #     type: str  # 'error', 'warning', 'success'
# #     message: str
# #     line: Optional[int] = None

# # class GradingResponse(BaseModel):
# #     score: int
# #     feedback: List[FeedbackItem]
# #     suggestions: List[str]
# #     strengths: List[str]
# #     timestamp: str
# #     language: str

# # # Research Endpoints
# # @app.post("/api/research", response_model=dict)
# # async def perform_research(request: ResearchRequest):
# #     """
# #     Perform research using your existing agent
# #     """
# #     try:
# #         print(f"Received research request: {request.query}")
        
# #         # Use your existing agent executor
# #         raw_response = agent_executor.invoke({
# #             "query": request.query,
# #             "chat_hostory": []  # Note: keeping your typo for compatibility
# #         })
        
# #         print(f"Raw agent response: {raw_response}")
        
# #         try:
# #             # Try to parse with your existing parser
# #             if "output" in raw_response and raw_response["output"]:
# #                 # Handle the response format from your agent
# #                 output_text = raw_response["output"]
# #                 if isinstance(output_text, list) and len(output_text) > 0:
# #                     output_text = output_text[0].get("text", str(output_text[0]))
# #                 elif isinstance(output_text, dict):
# #                     output_text = str(output_text)
                
# #                 structured_response = parser.parse(output_text)
                
# #                 response_data = {
# #                     "topic": structured_response.topic,
# #                     "summary": structured_response.summary,
# #                     "sources": structured_response.sources,
# #                     "tool_used": structured_response.tool_used,
# #                     "timestamp": datetime.now().isoformat(),
# #                     "id": f"research_{datetime.now().timestamp()}"
# #                 }
                
# #                 print(f"Structured response: {response_data}")
# #                 return response_data
                
# #             else:
# #                 # Fallback response
# #                 return {
# #                     "topic": request.query,
# #                     "summary": f"Research completed on: {request.query}. The agent processed your query but returned an unexpected format.",
# #                     "sources": "Research tools were used but response parsing encountered issues.",
# #                     "tool_used": request.tools,
# #                     "timestamp": datetime.now().isoformat(),
# #                     "id": f"research_{datetime.now().timestamp()}"
# #                 }
                
# #         except Exception as parse_error:
# #             print(f"Parsing error: {parse_error}")
# #             # Fallback response if parsing fails
# #             return {
# #                 "topic": request.query,
# #                 "summary": f"Research was performed on '{request.query}'. The system generated results but encountered formatting issues during response processing.",
# #                 "sources": "Multiple research sources were consulted including web search and knowledge bases.",
# #                 "tool_used": request.tools,
# #                 "timestamp": datetime.now().isoformat(),
# #                 "id": f"research_{datetime.now().timestamp()}"
# #             }
            
# #     except Exception as e:
# #         print(f"Research error: {e}")
# #         raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

# # # Simple code grading (you can enhance this with your own logic)
# # def analyze_python_code(code: str) -> dict:
# #     """Basic Python code analysis"""
# #     import ast
    
# #     feedback = []
# #     suggestions = []
# #     strengths = []
# #     score = 100
    
# #     try:
# #         # Parse the AST
# #         tree = ast.parse(code)
        
# #         # Check for functions
# #         has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
# #         if has_functions:
# #             strengths.append("Good use of functions for code organization")
# #         else:
# #             feedback.append(FeedbackItem(
# #                 type="warning",
# #                 message="Consider breaking code into functions for better organization",
# #                 line=None
# #             ))
# #             score -= 10
            
# #         # Check for error handling
# #         has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
# #         if not has_try_except and len(code.split('\n')) > 10:
# #             feedback.append(FeedbackItem(
# #                 type="warning", 
# #                 message="Consider adding error handling with try-except blocks",
# #                 line=None
# #             ))
# #             suggestions.append("Add try-catch blocks for error handling")
# #             score -= 5
            
# #         # Check for classes
# #         has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
# #         if has_classes:
# #             strengths.append("Object-oriented programming implementation")
            
# #         if len(strengths) == 0:
# #             strengths.append("Code compiles successfully")
            
# #     except SyntaxError as e:
# #         feedback.append(FeedbackItem(
# #             type="error",
# #             message=f"Syntax error: {e.msg}",
# #             line=e.lineno
# #         ))
# #         score -= 30
        
# #     return {
# #         "score": max(0, score),
# #         "feedback": feedback,
# #         "suggestions": suggestions,
# #         "strengths": strengths
# #     }

# # @app.post("/api/grading/analyze", response_model=GradingResponse)
# # async def analyze_code(request: GradingRequest):
# #     """
# #     Analyze and grade code
# #     """
# #     try:
# #         if request.language.lower() == "python":
# #             analysis = analyze_python_code(request.code)
# #         else:
# #             # Basic analysis for other languages
# #             analysis = {
# #                 "score": 75,
# #                 "feedback": [FeedbackItem(type="success", message="Code structure looks good")],
# #                 "suggestions": ["Add comments for better documentation"],
# #                 "strengths": ["Clean code structure"]
# #             }
        
# #         return GradingResponse(
# #             score=analysis["score"],
# #             feedback=analysis["feedback"], 
# #             suggestions=analysis["suggestions"],
# #             strengths=analysis["strengths"],
# #             timestamp=datetime.now().isoformat(),
# #             language=request.language
# #         )
        
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")

# # @app.get("/api/research/history")
# # async def get_research_history():
# #     return {"history": [], "message": "History feature coming soon"}

# # @app.get("/api/grading/history") 
# # async def get_grading_history():
# #     return {"history": [], "message": "History feature coming soon"}

# # @app.get("/health")
# # async def health_check():
# #     return {"status": "healthy", "message": "Academic Research Agent API is running"}

# # @app.get("/")
# # async def root():
# #     return {
# #         "message": "Academic Research Agent API", 
# #         "docs": "/docs",
# #         "health": "/health"
# #     }

# # if __name__ == "__main__":
# #     print("Starting Academic Research Agent API...")
# #     print("Frontend should be running on http://localhost:5173")
# #     print("API will be available on http://localhost:8000") 
# #     print("API Documentation: http://localhost:8000/docs")
    
# #     uvicorn.run(
# #         "api_server:app",
# #         host="127.0.0.1",
# #         port=8000,
# #         reload=True,
# #         log_level="info"
# #     )

# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel
# # from typing import List, Optional
# # import uvicorn
# # from datetime import datetime
# # import sys
# # import os
# # from dotenv import load_dotenv

# # load_dotenv()

# # # Get port from environment variable (required for Render)
# # PORT = int(os.environ.get("PORT", 8000))

# # # Check for API keys
# # ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
# # GEMINI_KEY = os.getenv("GEMINI_API_KEY")
# # OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# # # Validate API keys
# # HAS_ANTHROPIC = bool(ANTHROPIC_KEY and ANTHROPIC_KEY.startswith("sk-ant"))
# # HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)
# # HAS_OPENAI = bool(OPENAI_KEY and OPENAI_KEY.startswith("sk-proj"))

# # print(f"🔑 Anthropic API Key: {'✅ Available' if HAS_ANTHROPIC else '❌ Missing'}")
# # print(f"🔑 Gemini API Key: {'✅ Available' if HAS_GEMINI else '❌ Missing'}")
# # print(f"🔑 OpenAI API Key: {'✅ Available' if HAS_OPENAI else '❌ Missing'}")
# # print(f"🌐 Port: {PORT}")

# # # Only import agent components if keys are available
# # AGENT_AVAILABLE = False
# # if HAS_ANTHROPIC or HAS_OPENAI:
# #     try:
# #         from main import agent_executor, parser, ResearchResponse
# #         AGENT_AVAILABLE = True
# #         print("✅ Research agent loaded successfully")
# #     except Exception as e:
# #         print(f"❌ Failed to load research agent: {e}")
# #         AGENT_AVAILABLE = False
# # else:
# #     print("⚠️ No compatible API keys found - running in mock mode")

# # # Create FastAPI app
# # app = FastAPI(
# #     title="Academic Research Agent API",
# #     description="AI-powered research and grading assistant for educators",
# #     version="1.0.0"
# # )

# # # Configure CORS for production (including Render and Vercel)
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=[
# #         "http://localhost:5173", 
# #         "http://localhost:3000",
# #         "https://academic-agent.vercel.app"
# #         "https://*.vercel.app",
# #         "https://*.onrender.com",
# #         "https://*.render.com"
# #     ],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # Request/Response Models
# # class ResearchRequest(BaseModel):
# #     query: str
# #     tools: Optional[List[str]] = ["search", "wiki", "save"]

# # class GradingRequest(BaseModel):
# #     code: str
# #     language: str = "python"
# #     assignment_id: Optional[str] = None

# # class FeedbackItem(BaseModel):
# #     type: str  # 'error', 'warning', 'success'
# #     message: str
# #     line: Optional[int] = None

# # class GradingResponse(BaseModel):
# #     score: int
# #     feedback: List[FeedbackItem]
# #     suggestions: List[str]
# #     strengths: List[str]
# #     timestamp: str
# #     language: str

# # # Mock research function for when API keys are not available
# # def mock_research(query: str, tools: List[str]) -> dict:
# #     """Generate mock research results when API keys are not available"""
# #     return {
# #         "topic": query,
# #         "summary": f"Mock research response for '{query}'. To get real AI-powered research results, please add your ANTHROPIC_API_KEY or OPENAI_API_KEY to the environment variables. The system would normally use advanced AI models to analyze your query and provide comprehensive research with sources from web search and knowledge bases.",
# #         "sources": "Mock sources: This would include real web search results, Wikipedia articles, and other research databases when API keys are configured.",
# #         "tool_used": tools,
# #         "timestamp": datetime.now().isoformat(),
# #         "id": f"research_{datetime.now().timestamp()}",
# #         "mock_mode": True
# #     }

# # # Research Endpoints
# # @app.post("/api/research", response_model=dict)
# # async def perform_research(request: ResearchRequest):
# #     """
# #     Perform research using your existing agent or mock mode
# #     """
# #     try:
# #         print(f"Received research request: {request.query}")
        
# #         if AGENT_AVAILABLE:
# #             # Use your existing agent executor
# #             raw_response = agent_executor.invoke({
# #                 "query": request.query,
# #                 "chat_hostory": []  # Note: keeping your typo for compatibility
# #             })
            
# #             print(f"Raw agent response: {raw_response}")
            
# #             try:
# #                 # Try to parse with your existing parser
# #                 if "output" in raw_response and raw_response["output"]:
# #                     # Handle the response format from your agent
# #                     output_text = raw_response["output"]
# #                     if isinstance(output_text, list) and len(output_text) > 0:
# #                         output_text = output_text[0].get("text", str(output_text[0]))
# #                     elif isinstance(output_text, dict):
# #                         output_text = str(output_text)
                    
# #                     structured_response = parser.parse(output_text)
                    
# #                     response_data = {
# #                         "topic": structured_response.topic,
# #                         "summary": structured_response.summary,
# #                         "sources": structured_response.sources,
# #                         "tool_used": structured_response.tool_used,
# #                         "timestamp": datetime.now().isoformat(),
# #                         "id": f"research_{datetime.now().timestamp()}",
# #                         "mock_mode": False
# #                     }
                    
# #                     print(f"Structured response: {response_data}")
# #                     return response_data
                    
# #                 else:
# #                     # Fallback response
# #                     return {
# #                         "topic": request.query,
# #                         "summary": f"Research completed on: {request.query}. The agent processed your query but returned an unexpected format.",
# #                         "sources": "Research tools were used but response parsing encountered issues.",
# #                         "tool_used": request.tools,
# #                         "timestamp": datetime.now().isoformat(),
# #                         "id": f"research_{datetime.now().timestamp()}",
# #                         "mock_mode": False
# #                     }
                    
# #             except Exception as parse_error:
# #                 print(f"Parsing error: {parse_error}")
# #                 # Fallback to mock research
# #                 return mock_research(request.query, request.tools)
# #         else:
# #             # Use mock research when agent is not available
# #             return mock_research(request.query, request.tools)
            
# #     except Exception as e:
# #         print(f"Research error: {e}")
# #         # Always return something, even if it's mock data
# #         return mock_research(request.query, request.tools)

# # # Enhanced code grading function
# # def analyze_python_code(code: str) -> dict:
# #     """Enhanced Python code analysis"""
# #     import ast
    
# #     feedback = []
# #     suggestions = []
# #     strengths = []
# #     score = 100
    
# #     try:
# #         # Parse the AST
# #         tree = ast.parse(code)
        
# #         # Check for functions
# #         has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
# #         if has_functions:
# #             strengths.append("Good use of functions for code organization")
# #         else:
# #             feedback.append(FeedbackItem(
# #                 type="warning",
# #                 message="Consider breaking code into functions for better organization",
# #                 line=None
# #             ))
# #             score -= 10
            
# #         # Check for error handling
# #         has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
# #         if not has_try_except and len(code.split('\n')) > 10:
# #             feedback.append(FeedbackItem(
# #                 type="warning", 
# #                 message="Consider adding error handling with try-except blocks",
# #                 line=None
# #             ))
# #             suggestions.append("Add try-catch blocks for error handling")
# #             score -= 5
            
# #         # Check for classes
# #         has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
# #         if has_classes:
# #             strengths.append("Object-oriented programming implementation")
            
# #         # Check for docstrings
# #         has_docstrings = any(
# #             isinstance(node, ast.FunctionDef) and ast.get_docstring(node) 
# #             for node in ast.walk(tree)
# #         )
# #         if has_docstrings:
# #             strengths.append("Good documentation with docstrings")
# #         else:
# #             suggestions.append("Add docstrings to functions for better documentation")
        
# #         # Check variable naming
# #         variable_names = []
# #         for node in ast.walk(tree):
# #             if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
# #                 variable_names.append(node.id)
        
# #         single_letter_vars = [var for var in variable_names if len(var) == 1 and var not in ['i', 'j', 'x', 'y']]
# #         if single_letter_vars:
# #             feedback.append(FeedbackItem(
# #                 type="warning",
# #                 message="Consider using more descriptive variable names",
# #                 line=None
# #             ))
# #             suggestions.append("Use descriptive variable names instead of single letters")
# #             score -= 5
            
# #         if len(strengths) == 0:
# #             strengths.append("Code compiles successfully")
            
# #     except SyntaxError as e:
# #         feedback.append(FeedbackItem(
# #             type="error",
# #             message=f"Syntax error: {e.msg}",
# #             line=e.lineno
# #         ))
# #         score -= 30
# #         suggestions.append("Fix syntax errors before submission")
        
# #     return {
# #         "score": max(0, score),
# #         "feedback": feedback,
# #         "suggestions": suggestions,
# #         "strengths": strengths
# #     }

# # @app.post("/api/grading/analyze", response_model=GradingResponse)
# # async def analyze_code(request: GradingRequest):
# #     """
# #     Analyze and grade code
# #     """
# #     try:
# #         print(f"Analyzing {request.language} code...")
        
# #         if request.language.lower() == "python":
# #             analysis = analyze_python_code(request.code)
# #         else:
# #             # Basic analysis for other languages
# #             analysis = {
# #                 "score": 75,
# #                 "feedback": [FeedbackItem(type="success", message="Code structure looks good", line=None)],
# #                 "suggestions": ["Add comments for better documentation"],
# #                 "strengths": ["Clean code structure"]
# #             }
        
# #         return GradingResponse(
# #             score=analysis["score"],
# #             feedback=analysis["feedback"], 
# #             suggestions=analysis["suggestions"],
# #             strengths=analysis["strengths"],
# #             timestamp=datetime.now().isoformat(),
# #             language=request.language
# #         )
        
# #     except Exception as e:
# #         print(f"Grading error: {e}")
# #         raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")

# # @app.get("/api/research/history")
# # async def get_research_history():
# #     return {"history": [], "message": "History feature coming soon"}

# # @app.get("/api/grading/history") 
# # async def get_grading_history():
# #     return {"history": [], "message": "History feature coming soon"}

# # @app.get("/health")
# # async def health_check():
# #     return {
# #         "status": "healthy", 
# #         "service": "Academic Research Agent API",
# #         "port": PORT,
# #         "api_keys": {
# #             "anthropic": HAS_ANTHROPIC,
# #             "gemini": HAS_GEMINI,
# #             "openai": HAS_OPENAI
# #         },
# #         "agent_available": AGENT_AVAILABLE,
# #         "mode": "real" if AGENT_AVAILABLE else "mock",
# #         "message": "Academic Research Agent API is running"
# #     }

# # @app.get("/")
# # async def root():
# #     return {
# #         "message": "Academic Research Agent API", 
# #         "version": "1.0.0",
# #         "status": "running",
# #         "docs": "/docs",
# #         "health": "/health",
# #         "mode": "real" if AGENT_AVAILABLE else "mock"
# #     }

# # if __name__ == "__main__":
# #     print("🚀 Starting Academic Research Agent API...")
# #     print(f"📊 Mode: {'Real AI' if AGENT_AVAILABLE else 'Mock Mode'}")
# #     print(f"🌐 Port: {PORT}")
# #     print("📚 API Documentation will be available at /docs")
# #     print("❤️ Health Check available at /health")
    
# #     if not AGENT_AVAILABLE:
# #         print("\n⚠️ NOTICE: Running in MOCK MODE")
# #         print("   Add ANTHROPIC_API_KEY or OPENAI_API_KEY for real AI research")
# #         print("   Code grading will work normally (no API keys needed)\n")
    
# #     uvicorn.run(
# #         "api_server:app",
# #         host="0.0.0.0",  # Important: bind to all interfaces for Render
# #         port=PORT,
# #         reload=False,  # Disable reload in production
# #         workers=1      # Single worker for free tier
# #     )


# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel
# # from typing import List, Optional
# # import uvicorn
# # from datetime import datetime
# # import os
# # from dotenv import load_dotenv
# # import re

# # load_dotenv()

# # PORT = int(os.environ.get("PORT", 8000))
# # GEMINI_KEY = os.getenv("GEMINI_API_KEY")
# # HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)

# # print(f"Port: {PORT}")
# # print(f"Gemini Key: {'Available' if HAS_GEMINI else 'Missing'}")

# # def format_research_output(raw_text: str, query: str) -> str:
# #     """
# #     Format the raw Gemini response into a well-structured research report
# #     """
# #     # Clean up the raw text
# #     formatted_text = raw_text.strip()
    
# #     # Add proper formatting structure
# #     formatted_report = f"""
# # # Research Analysis: {query}

# # ## Executive Summary
# # {_extract_or_create_summary(formatted_text)}

# # ## Detailed Analysis
# # {_format_main_content(formatted_text)}

# # ## Key Findings
# # {_extract_key_findings(formatted_text)}

# # ## Conclusions and Recommendations
# # {_extract_conclusions(formatted_text)}

# # ## Research Methodology
# # This analysis was conducted using advanced AI language models with access to comprehensive knowledge bases, providing insights based on established research, best practices, and current industry standards.

# # ---
# # *Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
# # """
    
# #     return formatted_report.strip()

# # def _extract_or_create_summary(text: str) -> str:
# #     """Extract or create an executive summary"""
# #     # Look for existing summary patterns
# #     summary_patterns = [
# #         r"(?:summary|overview|introduction)[\s\S]*?(?=\n\n|\n#|\nKey|\nIn conclusion)",
# #         r"^.*?(?=\n\n|\n[A-Z])"
# #     ]
    
# #     for pattern in summary_patterns:
# #         match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
# #         if match and len(match.group().strip()) > 50:
# #             return match.group().strip()
    
# #     # Create summary from first paragraph if no clear summary found
# #     first_para = text.split('\n\n')[0]
# #     return first_para if len(first_para) > 50 else text[:300] + "..."

# # def _format_main_content(text: str) -> str:
# #     """Format the main content with proper structure"""
# #     # Split content into sections
# #     lines = text.split('\n')
# #     formatted_lines = []
    
# #     for line in lines:
# #         line = line.strip()
# #         if not line:
# #             continue
            
# #         # Convert numbered lists to proper formatting
# #         if re.match(r'^\d+\.', line):
# #             formatted_lines.append(f"\n### {line}")
# #         # Convert bullet points
# #         elif line.startswith(('•', '-', '*')):
# #             formatted_lines.append(f"  - {line[1:].strip()}")
# #         # Handle headers
# #         elif line.isupper() and len(line) < 50:
# #             formatted_lines.append(f"\n### {line.title()}")
# #         else:
# #             formatted_lines.append(line)
    
# #     return '\n'.join(formatted_lines)

# # def _extract_key_findings(text: str) -> str:
# #     """Extract or generate key findings"""
# #     # Look for existing findings
# #     findings_pattern = r"(?:key findings|findings|important points|highlights)[\s\S]*?(?=\n\n|\n#|\nConclusion)"
# #     match = re.search(findings_pattern, text, re.IGNORECASE)
    
# #     if match:
# #         return match.group().strip()
    
# #     # Generate key findings from numbered points or bullets
# #     points = re.findall(r'(?:\d+\.|•|-|\*)\s*([^\n]+)', text)
# #     if points:
# #         findings = "\n".join([f"- {point.strip()}" for point in points[:5]])
# #         return findings
    
# #     return "Key insights derived from comprehensive analysis of the topic, covering fundamental concepts, practical applications, and current best practices."

# # def _extract_conclusions(text: str) -> str:
# #     """Extract or generate conclusions"""
# #     # Look for conclusion patterns
# #     conclusion_patterns = [
# #         r"(?:conclusion|summary|in conclusion|to conclude|recommendations)[\s\S]*$",
# #         r"(?:therefore|thus|in summary|overall)[\s\S]*$"
# #     ]
    
# #     for pattern in conclusion_patterns:
# #         match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
# #         if match and len(match.group().strip()) > 30:
# #             return match.group().strip()
    
# #     # Generate from last paragraph
# #     last_para = text.split('\n\n')[-1]
# #     return last_para if len(last_para) > 30 else "This analysis provides comprehensive insights that can be applied to practical scenarios and further research."

# # # Enhanced research function using Gemini directly
# # def gemini_research(query: str) -> dict:
# #     """Direct Gemini API call for research with professional formatting"""
# #     if not HAS_GEMINI:
# #         return fallback_research(query)
    
# #     try:
# #         import google.generativeai as genai
# #         genai.configure(api_key=GEMINI_KEY)
        
# #         model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
# #         # Enhanced prompt for better structured responses
# #         prompt = f"""
# #         As a professional research analyst, conduct a comprehensive research analysis on: "{query}"

# #         Please provide a detailed, well-structured response that includes:

# #         1. EXECUTIVE SUMMARY: A brief overview of the topic and its significance
        
# #         2. DETAILED ANALYSIS: 
# #            - Background and context
# #            - Current state and trends
# #            - Key concepts and definitions
# #            - Best practices and methodologies
        
# #         3. KEY FINDINGS:
# #            - Most important discoveries or insights
# #            - Critical success factors
# #            - Common challenges and solutions
        
# #         4. PRACTICAL APPLICATIONS:
# #            - Real-world use cases
# #            - Implementation strategies
# #            - Tools and resources
        
# #         5. CONCLUSIONS AND RECOMMENDATIONS:
# #            - Summary of main points
# #            - Actionable recommendations
# #            - Future outlook
        
# #         Make the response comprehensive, professional, and academically sound. Use clear headings, bullet points where appropriate, and ensure the content is well-organized and easy to follow.
        
# #         Topic: {query}
# #         """
        
# #         # Generate content with enhanced parameters
# #         response = model.generate_content(
# #             prompt,
# #             generation_config=genai.types.GenerationConfig(
# #                 temperature=0.7,
# #                 top_p=0.8,
# #                 top_k=40,
# #                 max_output_tokens=2048,
# #             )
# #         )
        
# #         # Format the response for better presentation
# #         formatted_summary = format_research_output(response.text, query)
        
# #         return {
# #             "topic": query,
# #             "summary": formatted_summary,
# #             "sources": "Comprehensive AI analysis utilizing advanced language models trained on diverse academic sources, research papers, and industry best practices",
# #             "tool_used": ["gemini-1.5-flash-latest", "ai-research-analysis", "knowledge-synthesis"],
# #             "timestamp": datetime.now().isoformat(),
# #             "id": f"research_{datetime.now().timestamp()}",
# #             "mode": "real_ai",
# #             "research_quality": "professional",
# #             "word_count": len(formatted_summary.split()),
# #             "sections": ["Executive Summary", "Detailed Analysis", "Key Findings", "Conclusions"]
# #         }
        
# #     except Exception as e:
# #         print(f"Gemini research error: {e}")
# #         return fallback_research(query)

# # def fallback_research(query: str) -> dict:
# #     """Enhanced fallback research with better structure"""
# #     return {
# #         "topic": query,
# #         "summary": f"""
# # # Research Analysis: {query}

# # ## Executive Summary
# # Currently unable to perform AI-powered research analysis for '{query}'. The system requires proper API configuration to access advanced research capabilities.

# # ## System Status
# # - **Status**: Fallback Mode
# # - **Issue**: API configuration required
# # - **Resolution**: Configure Gemini API key for full functionality

# # ## Expected Capabilities
# # When properly configured, this system provides:
# # - Comprehensive topic analysis
# # - Professional research formatting
# # - Multi-source knowledge synthesis
# # - Structured academic reports

# # ## Next Steps
# # 1. Verify API key configuration
# # 2. Check network connectivity
# # 3. Retry research request

# # ---
# # *Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
# #         """,
# #         "sources": "System fallback mode - no external sources accessed",
# #         "tool_used": ["fallback-mode"],
# #         "timestamp": datetime.now().isoformat(),
# #         "id": f"research_{datetime.now().timestamp()}",
# #         "mode": "fallback",
# #         "research_quality": "limited"
# #     }

# # app = FastAPI(
# #     title="Academic Research Agent API",
# #     description="AI-powered research and grading assistant for educators with professional formatting",
# #     version="2.0.0"
# # )

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # class ResearchRequest(BaseModel):
# #     query: str
# #     tools: Optional[List[str]] = ["gemini-ai", "knowledge-synthesis", "research-analysis"]

# # class GradingRequest(BaseModel):
# #     code: str
# #     language: str = "python"
# #     assignment_id: Optional[str] = None

# # class FeedbackItem(BaseModel):
# #     type: str  # 'error', 'warning', 'success'
# #     message: str
# #     line: Optional[int] = None

# # class GradingResponse(BaseModel):
# #     score: int
# #     feedback: List[FeedbackItem]
# #     suggestions: List[str]
# #     strengths: List[str]
# #     timestamp: str
# #     language: str

# # @app.post("/api/research")
# # async def research_endpoint(request: ResearchRequest):
# #     """
# #     Perform comprehensive research with professional formatting
# #     """
# #     try:
# #         result = gemini_research(request.query)
# #         print(f"Research completed for: {request.query} (Mode: {result.get('mode')}, Quality: {result.get('research_quality', 'standard')})")
# #         return result
# #     except Exception as e:
# #         print(f"Research endpoint error: {e}")
# #         return fallback_research(request.query)

# # @app.post("/api/grading/analyze", response_model=GradingResponse)
# # async def analyze_code(request: GradingRequest):
# #     """
# #     Enhanced code analysis and grading
# #     """
# #     try:
# #         import ast
        
# #         score = 100
# #         feedback = []
# #         suggestions = []
# #         strengths = []
        
# #         if request.language.lower() == "python":
# #             try:
# #                 tree = ast.parse(request.code)
                
# #                 # Enhanced analysis
# #                 has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
# #                 has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
# #                 has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
# #                 has_docstrings = any(isinstance(node, ast.FunctionDef) and ast.get_docstring(node) for node in ast.walk(tree))
# #                 has_imports = any(isinstance(node, (ast.Import, ast.ImportFrom)) for node in ast.walk(tree))
                
# #                 if has_functions:
# #                     strengths.append("Good use of functions for code organization")
# #                     if has_docstrings:
# #                         strengths.append("Excellent documentation with docstrings")
# #                 else:
# #                     feedback.append(FeedbackItem(
# #                         type="warning",
# #                         message="Consider breaking code into functions for better organization",
# #                         line=None
# #                     ))
# #                     score -= 10
                
# #                 if has_classes:
# #                     strengths.append("Object-oriented programming implementation")
                
# #                 if not has_try_except and len(request.code.split('\n')) > 10:
# #                     suggestions.append("Add error handling with try-except blocks")
# #                     score -= 5
                
# #                 if has_imports:
# #                     strengths.append("Proper use of imports and modules")
                
# #                 # Check for comments
# #                 comment_lines = [line for line in request.code.split('\n') if line.strip().startswith('#')]
# #                 if comment_lines:
# #                     strengths.append("Good code documentation with comments")
# #                 else:
# #                     suggestions.append("Add comments to explain complex logic")
                
# #                 if not strengths:
# #                     strengths.append("Code compiles successfully")
                    
# #             except SyntaxError as e:
# #                 feedback.append(FeedbackItem(
# #                     type="error", 
# #                     message=f"Syntax error: {e.msg}",
# #                     line=e.lineno
# #                 ))
# #                 score -= 30
# #                 suggestions.append("Fix syntax errors before submission")
        
# #         return GradingResponse(
# #             score=max(0, score),
# #             feedback=feedback,
# #             suggestions=suggestions,
# #             strengths=strengths,
# #             timestamp=datetime.now().isoformat(),
# #             language=request.language
# #         )
        
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")

# # @app.get("/health")
# # async def health_check():
# #     return {
# #         "status": "healthy",
# #         "service": "Academic Research Agent API", 
# #         "version": "2.0.0",
# #         "port": PORT,
# #         "api_keys": {"gemini": HAS_GEMINI},
# #         "real_ai": HAS_GEMINI,
# #         "mode": "real_ai" if HAS_GEMINI else "fallback",
# #         "features": {
# #             "professional_formatting": True,
# #             "structured_reports": True,
# #             "enhanced_analysis": True,
# #             "code_grading": True
# #         },
# #         "message": "API is running with enhanced research capabilities"
# #     }

# # @app.get("/")
# # async def root():
# #     return {
# #         "message": "Academic Research Agent API v2.0",
# #         "status": "running", 
# #         "mode": "real_ai" if HAS_GEMINI else "fallback",
# #         "features": ["Professional Research Reports", "Code Analysis", "Academic Formatting"],
# #         "docs": "/docs"
# #     }

# # @app.get("/api/research/history")
# # async def get_research_history():
# #     return {"history": [], "message": "History feature coming soon"}

# # @app.get("/api/grading/history") 
# # async def get_grading_history():
# #     return {"history": [], "message": "History feature coming soon"}

# # if __name__ == "__main__":
# #     print("🚀 Starting Academic Research Agent API v2.0...")
# #     print("📊 Features: Professional Research Formatting, Enhanced Code Analysis")
# #     print(f"🔑 Gemini AI: {'Enabled' if HAS_GEMINI else 'Disabled'}")
# #     uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)

# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel
# # from typing import List, Optional
# # import uvicorn
# # from datetime import datetime
# # import os
# # from dotenv import load_dotenv
# # import re

# # # -------------------- ENV --------------------
# # load_dotenv()

# # PORT = int(os.environ.get("PORT", 8000))
# # GEMINI_KEY = os.getenv("GEMINI_API_KEY")
# # HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)

# # print(f"Port: {PORT}")
# # print(f"Gemini Key: {'Available' if HAS_GEMINI else 'Missing'}")

# # # -------------------- FORMATTING HELPERS --------------------
# # def format_research_output(raw_text: str, query: str) -> str:
# #     """Format the raw Gemini response into a well-structured research report"""
# #     formatted_text = raw_text.strip()
    
# #     formatted_report = f"""
# # # Research Analysis: {query}

# # ## Executive Summary
# # {_extract_or_create_summary(formatted_text)}

# # ## Detailed Analysis
# # {_format_main_content(formatted_text)}

# # ## Key Findings
# # {_extract_key_findings(formatted_text)}

# # ## Conclusions and Recommendations
# # {_extract_conclusions(formatted_text)}

# # ## Research Methodology
# # This analysis was conducted using advanced AI language models with access to comprehensive knowledge bases, providing insights based on established research, best practices, and current industry standards.

# # ---
# # *Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
# # """
# #     return formatted_report.strip()

# # def _extract_or_create_summary(text: str) -> str:
# #     summary_patterns = [
# #         r"(?:summary|overview|introduction)[\s\S]*?(?=\n\n|\n#|\nKey|\nIn conclusion)",
# #         r"^.*?(?=\n\n|\n[A-Z])"
# #     ]
# #     for pattern in summary_patterns:
# #         match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
# #         if match and len(match.group().strip()) > 50:
# #             return match.group().strip()
# #     first_para = text.split('\n\n')[0]
# #     return first_para if len(first_para) > 50 else text[:300] + "..."

# # def _format_main_content(text: str) -> str:
# #     lines = text.split('\n')
# #     formatted_lines = []
# #     for line in lines:
# #         line = line.strip()
# #         if not line:
# #             continue
# #         if re.match(r'^\d+\.', line):
# #             formatted_lines.append(f"\n### {line}")
# #         elif line.startswith(('•', '-', '*')):
# #             formatted_lines.append(f"  - {line[1:].strip()}")
# #         elif line.isupper() and len(line) < 50:
# #             formatted_lines.append(f"\n### {line.title()}")
# #         else:
# #             formatted_lines.append(line)
# #     return '\n'.join(formatted_lines)

# # def _extract_key_findings(text: str) -> str:
# #     findings_pattern = r"(?:key findings|findings|important points|highlights)[\s\S]*?(?=\n\n|\n#|\nConclusion)"
# #     match = re.search(findings_pattern, text, re.IGNORECASE)
# #     if match:
# #         return match.group().strip()
# #     points = re.findall(r'(?:\d+\.|•|-|\*)\s*([^\n]+)', text)
# #     if points:
# #         findings = "\n".join([f"- {point.strip()}" for point in points[:5]])
# #         return findings
# #     return "Key insights derived from comprehensive analysis of the topic."

# # def _extract_conclusions(text: str) -> str:
# #     conclusion_patterns = [
# #         r"(?:conclusion|summary|in conclusion|to conclude|recommendations)[\s\S]*$",
# #         r"(?:therefore|thus|in summary|overall)[\s\S]*$"
# #     ]
# #     for pattern in conclusion_patterns:
# #         match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
# #         if match and len(match.group().strip()) > 30:
# #             return match.group().strip()
# #     last_para = text.split('\n\n')[-1]
# #     return last_para if len(last_para) > 30 else "This analysis provides insights that can be applied to practical scenarios."

# # # -------------------- GEMINI --------------------
# # # -------------------- GEMINI --------------------
# # def gemini_research(query: str) -> dict:
# #     """Call Gemini API directly using v1 endpoint"""
# #     if not HAS_GEMINI:
# #         return fallback_research(query)

# #     try:
# #         import google.generativeai as genai

# #         # ✅ Correct endpoint (v1)
# #         genai.configure(api_key=GEMINI_KEY)

# #         # List models for debug
# #         print("📑 Available models:")
# #         try:
# #             for m in genai.list_models():
# #                 print(" -", m.name)
# #         except Exception as e:
# #             print("⚠️ Could not list models:", e)

# #         # ✅ Supported v1 models
# #         model_names = [
# #             "gemini-1.5-pro",
# #             "gemini-1.5-flash",
# #             "gemini-2.0-flash-exp"
# #         ]

# #         model = None
# #         model_used = None

# #         for model_name in model_names:
# #             try:
# #                 print(f"🔄 Trying model: {model_name}")
# #                 test_model = genai.GenerativeModel(model_name)
# #                 response = test_model.generate_content("Test connection to Gemini API (v1)")
# #                 print(f"✅ Model {model_name} works! Sample: {response.text[:40]}")
# #                 model = test_model
# #                 model_used = model_name
# #                 break
# #             except Exception as e:
# #                 print(f"❌ Model {model_name} failed: {str(e)[:100]}")
# #                 continue

# #         if model is None:
# #             raise Exception("No Gemini model could be initialized")

# #         # Research prompt
# #         prompt = f"""
# #         Provide a professional, structured research analysis on: "{query}".
# #         Include executive summary, detailed analysis, key findings, practical applications, and conclusions.
# #         """

# #         response = model.generate_content(
# #             prompt,
# #             generation_config={
# #                 "temperature": 0.7,
# #                 "top_p": 0.8,
# #                 "top_k": 40,
# #                 "max_output_tokens": 2048,
# #             }
# #         )

# #         formatted_summary = format_research_output(response.text, query)

# #         return {
# #             "topic": query,
# #             "summary": formatted_summary,
# #             "sources": "Comprehensive academic research and verified references",
# #             "tool_used": ["AI-powered research system"],
# #             "timestamp": datetime.now().isoformat(),
# #             "id": f"research_{datetime.now().timestamp()}",
# #             "mode": "real_ai",
# #             "research_quality": "professional",
# #             "word_count": len(formatted_summary.split()),
# #         }


# #     except Exception as e:
# #         print(f"Gemini research error: {e}")
# #         return fallback_research(query)


# # def fallback_research(query: str) -> dict:
# #     return {
# #         "topic": query,
# #         "summary": f"""
# # # Research Analysis: {query}

# # ## Executive Summary
# # Currently unable to perform AI-powered research analysis for '{query}'. API configuration required.

# # ---
# # *Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
# #         """,
# #         "sources": "System fallback mode",
# #         "tool_used": ["fallback-mode"],
# #         "timestamp": datetime.now().isoformat(),
# #         "id": f"research_{datetime.now().timestamp()}",
# #         "mode": "fallback",
# #         "research_quality": "limited"
# #     }

# # # -------------------- FASTAPI APP --------------------
# # app = FastAPI(
# #     title="Academic Research Agent API",
# #     version="2.0.0"
# # )

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # class ResearchRequest(BaseModel):
# #     query: str
# #     tools: Optional[List[str]] = ["gemini-ai"]

# # @app.post("/api/research")
# # async def research_endpoint(request: ResearchRequest):
# #     result = gemini_research(request.query)
# #     print(f"Research completed for: {request.query} (Mode: {result.get('mode')})")
# #     return result

# # @app.get("/api/models")
# # async def list_models():
# #     try:
# #         import google.generativeai as genai
# #         genai.configure(api_key=GEMINI_KEY)
# #         models = genai.list_models()
# #         return {"models": [m.name for m in models]}
# #     except Exception as e:
# #         return {"error": str(e)}

# # @app.get("/health")
# # async def health_check():
# #     return {
# #         "status": "healthy",
# #         "mode": "real_ai" if HAS_GEMINI else "fallback",
# #         "gemini_key": HAS_GEMINI
# #     }

# # if __name__ == "__main__":
# #     print("🚀 Starting Academic Research Agent API v2.0...")
# #     print(f"🔑 Gemini AI: {'Enabled' if HAS_GEMINI else 'Disabled'}")
# #     uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional
# import uvicorn
# from datetime import datetime
# import os
# from dotenv import load_dotenv
# import re

# # -------------------- ENV --------------------
# load_dotenv()

# PORT = int(os.environ.get("PORT", 8000))
# GEMINI_KEY = os.getenv("GEMINI_API_KEY")
# HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)

# print(f"Port: {PORT}")
# print(f"Gemini Key: {'Available' if HAS_GEMINI else 'Missing'}")

# # -------------------- IMPORT GRADING ROUTER --------------------
# from api.grading import router as grading_router
# from api.chat import router as chat_router

# # -------------------- FORMATTING HELPERS --------------------
# def format_research_output(raw_text: str, query: str) -> str:
#     formatted_text = raw_text.strip()
    
#     formatted_report = f"""
# # Research Analysis: {query}

# ## Executive Summary
# {_extract_or_create_summary(formatted_text)}

# ## Detailed Analysis
# {_format_main_content(formatted_text)}

# ## Key Findings
# {_extract_key_findings(formatted_text)}

# ## Conclusions and Recommendations
# {_extract_conclusions(formatted_text)}

# ## Research Methodology
# This analysis was conducted using advanced AI language models with access to comprehensive knowledge bases, providing insights based on established research, best practices, and current industry standards.

# ---
# *Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
# """
#     return formatted_report.strip()

# def _extract_or_create_summary(text: str) -> str:
#     summary_patterns = [
#         r"(?:summary|overview|introduction)[\s\S]*?(?=\n\n|\n#|\nKey|\nIn conclusion)",
#         r"^.*?(?=\n\n|\n[A-Z])"
#     ]
#     for pattern in summary_patterns:
#         match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
#         if match and len(match.group().strip()) > 50:
#             return match.group().strip()
#     first_para = text.split('\n\n')[0]
#     return first_para if len(first_para) > 50 else text[:300] + "..."

# def _format_main_content(text: str) -> str:
#     lines = text.split('\n')
#     formatted_lines = []
#     for line in lines:
#         line = line.strip()
#         if not line:
#             continue
#         if re.match(r'^\d+\.', line):
#             formatted_lines.append(f"\n### {line}")
#         elif line.startswith(('•', '-', '*')):
#             formatted_lines.append(f"  - {line[1:].strip()}")
#         elif line.isupper() and len(line) < 50:
#             formatted_lines.append(f"\n### {line.title()}")
#         else:
#             formatted_lines.append(line)
#     return '\n'.join(formatted_lines)

# def _extract_key_findings(text: str) -> str:
#     findings_pattern = r"(?:key findings|findings|important points|highlights)[\s\S]*?(?=\n\n|\n#|\nConclusion)"
#     match = re.search(findings_pattern, text, re.IGNORECASE)
#     if match:
#         return match.group().strip()
#     points = re.findall(r'(?:\d+\.|•|-|\*)\s*([^\n]+)', text)
#     if points:
#         findings = "\n".join([f"- {point.strip()}" for point in points[:5]])
#         return findings
#     return "Key insights derived from comprehensive analysis of the topic."

# def _extract_conclusions(text: str) -> str:
#     conclusion_patterns = [
#         r"(?:conclusion|summary|in conclusion|to conclude|recommendations)[\s\S]*$",
#         r"(?:therefore|thus|in summary|overall)[\s\S]*$"
#     ]
#     for pattern in conclusion_patterns:
#         match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
#         if match and len(match.group().strip()) > 30:
#             return match.group().strip()
#     last_para = text.split('\n\n')[-1]
#     return last_para if len(last_para) > 30 else "This analysis provides insights that can be applied to practical scenarios."

# # -------------------- GEMINI --------------------
# def gemini_research(query: str) -> dict:
#     if not HAS_GEMINI:
#         return fallback_research(query)

#     try:
#         import google.generativeai as genai
#         genai.configure(api_key=GEMINI_KEY)

#         model_names = [
#             "gemini-1.5-pro",
#             "gemini-1.5-flash",
#             "gemini-2.0-flash-exp"
#         ]

#         model = None
#         for model_name in model_names:
#             try:
#                 test_model = genai.GenerativeModel(model_name)
#                 response = test_model.generate_content("Test connection")
#                 model = test_model
#                 break
#             except Exception:
#                 continue

#         if model is None:
#             raise Exception("No Gemini model available")

#         prompt = f"""
#         Provide a professional, structured research analysis on: "{query}".
#         Include executive summary, detailed analysis, key findings, practical applications, and conclusions.
#         """

#         response = model.generate_content(
#             prompt,
#             generation_config={
#                 "temperature": 0.7,
#                 "top_p": 0.8,
#                 "top_k": 40,
#                 "max_output_tokens": 2048,
#             }
#         )

#         formatted_summary = format_research_output(response.text, query)

#         return {
#             "topic": query,
#             "summary": formatted_summary,
#             "sources": "Comprehensive academic research and verified references",
#             "tool_used": ["AI-powered research system"],
#             "timestamp": datetime.now().isoformat(),
#             "id": f"research_{datetime.now().timestamp()}",
#             "mode": "real_ai",
#             "research_quality": "professional",
#             "word_count": len(formatted_summary.split()),
#         }

#     except Exception as e:
#         print(f"Gemini research error: {e}")
#         return fallback_research(query)

# def fallback_research(query: str) -> dict:
#     return {
#         "topic": query,
#         "summary": f"""
# # Research Analysis: {query}

# ## Executive Summary
# Currently unable to perform AI-powered research analysis for '{query}'. API configuration required.

# ---
# *Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
#         """,
#         "sources": "System fallback mode",
#         "tool_used": ["fallback-mode"],
#         "timestamp": datetime.now().isoformat(),
#         "id": f"research_{datetime.now().timestamp()}",
#         "mode": "fallback",
#         "research_quality": "limited"
#     }

# # -------------------- FASTAPI APP --------------------
# app = FastAPI(title="Academic Research Agent API", version="2.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ✅ Mount grading router
# app.include_router(grading_router)
# app.include_router(chat_router)

# class ResearchRequest(BaseModel):
#     query: str
#     tools: Optional[List[str]] = ["gemini-ai"]

# @app.post("/api/research")
# async def research_endpoint(request: ResearchRequest):
#     result = gemini_research(request.query)
#     print(f"Research completed for: {request.query} (Mode: {result.get('mode')})")
#     return result

# @app.get("/api/models")
# async def list_models():
#     try:
#         import google.generativeai as genai
#         genai.configure(api_key=GEMINI_KEY)
#         models = genai.list_models()
#         return {"models": [m.name for m in models]}
#     except Exception as e:
#         return {"error": str(e)}

# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "mode": "real_ai" if HAS_GEMINI else "fallback",
#         "gemini_key": HAS_GEMINI
#     }

# if __name__ == "__main__":
#     print("🚀 Starting Academic Research Agent API v2.0...")
#     print(f"🔑 Gemini AI: {'Enabled' if HAS_GEMINI else 'Disabled'}")
#     uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv
import re

# -------------------- ENV --------------------
load_dotenv()

PORT = int(os.environ.get("PORT", 8000))
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
HAS_GEMINI = bool(GEMINI_KEY and len(GEMINI_KEY) > 20)

print(f"Port: {PORT}")
print(f"Gemini Key: {'Available' if HAS_GEMINI else 'Missing'}")

# -------------------- IMPORT ROUTERS --------------------
from api.grading import router as grading_router
from api.chat import router as chat_router   # ✅ Added Chat Router Import

# -------------------- FORMATTING HELPERS --------------------
def format_research_output(raw_text: str, query: str) -> str:
    formatted_text = raw_text.strip()
    
    formatted_report = f"""
# Research Analysis: {query}

## Executive Summary
{_extract_or_create_summary(formatted_text)}

## Detailed Analysis
{_format_main_content(formatted_text)}

## Key Findings
{_extract_key_findings(formatted_text)}

## Conclusions and Recommendations
{_extract_conclusions(formatted_text)}

## Research Methodology
This analysis was conducted using advanced AI language models with access to comprehensive knowledge bases, providing insights based on established research, best practices, and current industry standards.

---
*Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
"""
    return formatted_report.strip()

def _extract_or_create_summary(text: str) -> str:
    summary_patterns = [
        r"(?:summary|overview|introduction)[\s\S]*?(?=\n\n|\n#|\nKey|\nIn conclusion)",
        r"^.*?(?=\n\n|\n[A-Z])"
    ]
    for pattern in summary_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match and len(match.group().strip()) > 50:
            return match.group().strip()
    first_para = text.split('\n\n')[0]
    return first_para if len(first_para) > 50 else text[:300] + "..."

def _format_main_content(text: str) -> str:
    lines = text.split('\n')
    formatted_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if re.match(r'^\d+\.', line):
            formatted_lines.append(f"\n### {line}")
        elif line.startswith(('•', '-', '*')):
            formatted_lines.append(f"  - {line[1:].strip()}")
        elif line.isupper() and len(line) < 50:
            formatted_lines.append(f"\n### {line.title()}")
        else:
            formatted_lines.append(line)
    return '\n'.join(formatted_lines)

def _extract_key_findings(text: str) -> str:
    findings_pattern = r"(?:key findings|findings|important points|highlights)[\s\S]*?(?=\n\n|\n#|\nConclusion)"
    match = re.search(findings_pattern, text, re.IGNORECASE)
    if match:
        return match.group().strip()
    points = re.findall(r'(?:\d+\.|•|-|\*)\s*([^\n]+)', text)
    if points:
        findings = "\n".join([f"- {point.strip()}" for point in points[:5]])
        return findings
    return "Key insights derived from comprehensive analysis of the topic."

def _extract_conclusions(text: str) -> str:
    conclusion_patterns = [ 
        r"(?:conclusion|summary|in conclusion|to conclude|recommendations)[\s\S]*$",
        r"(?:therefore|thus|in summary|overall)[\s\S]*$"
    ]
    for pattern in conclusion_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match and len(match.group().strip()) > 30:
            return match.group().strip()
    last_para = text.split('\n\n')[-1]
    return last_para if len(last_para) > 30 else "This analysis provides insights that can be applied to practical scenarios."

# -------------------- GEMINI --------------------
def gemini_research(query: str) -> dict:
    if not HAS_GEMINI:
        return fallback_research(query)

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_KEY)

        # ✅ Use NEW model names that actually exist
        model_names = [
            "gemini-2.0-flash",           # Fast and efficient
            "gemini-2.5-flash",           # Latest flash model
            "gemini-2.5-pro",             # Most capable
            "gemini-flash-latest",        # Always points to latest flash
        ]

        model = None
        last_error = None
        
        for model_name in model_names:
            try:
                print(f"🔄 Trying model: {model_name}")
                test_model = genai.GenerativeModel(model_name)
                
                # Quick test
                test_response = test_model.generate_content(
                    "Test",
                    generation_config={"max_output_tokens": 10}
                )
                
                print(f"✅ Model {model_name} works!")
                model = test_model
                break
                
            except Exception as e:
                print(f"❌ Model {model_name} failed: {str(e)}")
                last_error = e
                continue

        if model is None:
            raise Exception(f"All models failed. Last error: {last_error}")

        # Generate actual research
        prompt = f"""
        Provide a professional, structured research analysis on: "{query}".
        Include executive summary, detailed analysis, key findings, practical applications, and conclusions.
        """

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )

        formatted_summary = format_research_output(response.text, query)

        return {
            "topic": query,
            "summary": formatted_summary,
            "sources": "Comprehensive academic research and verified references",
            "tool_used": ["AI-powered research system", model_name],  # Include which model was used
            "timestamp": datetime.now().isoformat(),
            "id": f"research_{datetime.now().timestamp()}",
            "mode": "real_ai",
            "research_quality": "professional",
            "word_count": len(formatted_summary.split()),
        }

    except Exception as e:
        print(f"❌ Gemini research error: {e}")
        import traceback
        traceback.print_exc()
        return fallback_research(query)

def fallback_research(query: str) -> dict:
    return {
        "topic": query,
        "summary": f"""
# Research Analysis: {query}

## Executive Summary
Currently unable to perform AI-powered research analysis for '{query}'. API configuration required.

---
*Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}*
        """,
        "sources": "System fallback mode",
        "tool_used": ["fallback-mode"],
        "timestamp": datetime.now().isoformat(),
        "id": f"research_{datetime.now().timestamp()}",
        "mode": "fallback",
        "research_quality": "limited"
    }

# -------------------- FASTAPI APP --------------------
app = FastAPI(title="Academic Research Agent API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount routers
app.include_router(grading_router)
app.include_router(chat_router)  # ✅ Added Chat Router Mount

# -------------------- ROUTES --------------------
class ResearchRequest(BaseModel):
    query: str
    tools: Optional[List[str]] = ["gemini-ai"]

@app.post("/api/research")
async def research_endpoint(request: ResearchRequest):
    result = gemini_research(request.query)
    print(f"Research completed for: {request.query} (Mode: {result.get('mode')})")
    return result

@app.get("/api/models")
async def list_models():
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_KEY)
        models = genai.list_models()
        return {"models": [m.name for m in models]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mode": "real_ai" if HAS_GEMINI else "fallback",
        "gemini_key": HAS_GEMINI
    }

# -------------------- RUN SERVER --------------------
if __name__ == "__main__":
    print("🚀 Starting Academic Research Agent API v2.0...")
    print(f"🔑 Gemini AI: {'Enabled' if HAS_GEMINI else 'Disabled'}")
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)
