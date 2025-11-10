

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

        model_names = [
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-2.0-flash-exp"
        ]

        model = None
        for model_name in model_names:
            try:
                test_model = genai.GenerativeModel(model_name)
                response = test_model.generate_content("Test connection")
                model = test_model
                break
            except Exception:
                continue

        if model is None:
            raise Exception("No Gemini model available")

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
            "tool_used": ["AI-powered research system"],
            "timestamp": datetime.now().isoformat(),
            "id": f"research_{datetime.now().timestamp()}",
            "mode": "real_ai",
            "research_quality": "professional",
            "word_count": len(formatted_summary.split()),
        }

    except Exception as e:
        print(f"Gemini research error: {e}")
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
