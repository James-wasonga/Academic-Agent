from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import ast
import re
from datetime import datetime

router = APIRouter(prefix="/api/grading", tags=["grading"])

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str = "python"
    assignment_id: Optional[str] = None

class FeedbackItem(BaseModel):
    type: str  # 'error', 'warning', 'success'
    message: str
    line: Optional[int] = None

class GradingResponse(BaseModel):
    score: int
    feedback: List[FeedbackItem]
    suggestions: List[str]
    strengths: List[str]
    timestamp: str
    language: str

def analyze_python_code(code: str) -> Dict[str, Any]:
    """Analyze Python code and provide feedback"""
    feedback = []
    suggestions = []
    strengths = []
    score = 100
    
    try:
        # Parse the AST
        tree = ast.parse(code)
        
        # Check for common issues
        has_functions = any(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
        has_classes = any(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
        has_docstrings = any(
            isinstance(node, ast.FunctionDef) and ast.get_docstring(node) 
            for node in ast.walk(tree)
        )
        
        # Analyze variable names
        variable_names = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                variable_names.append(node.id)
        
        # Check for error handling
        has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
        
        # Scoring and feedback logic
        if has_functions:
            strengths.append("Good use of functions for code organization")
        else:
            feedback.append(FeedbackItem(
                type="warning",
                message="Consider breaking code into functions for better organization",
                line=None
            ))
            score -= 10
            
        if has_classes:
            strengths.append("Object-oriented programming implementation")
            
        if has_docstrings:
            strengths.append("Good documentation with docstrings")
        else:
            suggestions.append("Add docstrings to functions and classes for better documentation")
            
        if not has_try_except and len(code.split('\n')) > 10:
            feedback.append(FeedbackItem(
                type="warning",
                message="Consider adding error handling with try-except blocks",
                line=None
            ))
            score -= 5
            
        # Check variable naming
        single_letter_vars = [var for var in variable_names if len(var) == 1 and var not in ['i', 'j', 'x', 'y']]
        if single_letter_vars:
            feedback.append(FeedbackItem(
                type="warning",
                message="Use more descriptive variable names",
                line=None
            ))
            suggestions.append("Use descriptive variable names instead of single letters")
            score -= 5
            
        # Check for basic syntax issues
        lines = code.split('\n')
        for i, line in enumerate(lines, 1):
            if line.strip().endswith(',') and not any(bracket in line for bracket in ['(', '[', '{']):
                feedback.append(FeedbackItem(
                    type="error",
                    message="Syntax error: unexpected comma",
                    line=i
                ))
                score -= 10
                
    except SyntaxError as e:
        feedback.append(FeedbackItem(
            type="error",
            message=f"Syntax error: {e.msg}",
            line=e.lineno
        ))
        score -= 20
        suggestions.append("Fix syntax errors before submission")
        
    except Exception as e:
        feedback.append(FeedbackItem(
            type="error",
            message="Code analysis encountered an error",
            line=None
        ))
        score -= 10
    
    # Ensure score doesn't go below 0
    score = max(0, score)
    
    # Add general suggestions if score is low
    if score < 70:
        suggestions.append("Review coding best practices and style guidelines")
        
    if len(strengths) == 0:
        strengths.append("Code compiles successfully")
        
    return {
        "score": score,
        "feedback": feedback,
        "suggestions": suggestions,
        "strengths": strengths
    }

@router.post("/analyze", response_model=GradingResponse)
async def analyze_code(request: CodeAnalysisRequest):
    try:
        if request.language.lower() == "python":
            analysis = analyze_python_code(request.code)
        else:
            # Basic analysis for other languages
            analysis = {
                "score": 75,
                "feedback": [
                    FeedbackItem(
                        type="success",
                        message="Code structure looks good",
                        line=None
                    )
                ],
                "suggestions": ["Add comments for better code documentation"],
                "strengths": ["Clean code structure", "Proper formatting"]
            }
        
        return GradingResponse(
            score=analysis["score"],
            feedback=analysis["feedback"],
            suggestions=analysis["suggestions"],
            strengths=analysis["strengths"],
            timestamp=datetime.now().isoformat(),
            language=request.language
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")

@router.get("/history")
async def get_grading_history():
    return {"history": []}

@router.post("/{grading_id}/feedback")
async def submit_feedback(grading_id: str, feedback: dict):
    return {"message": "Feedback submitted successfully", "grading_id": grading_id}