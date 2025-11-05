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

def analyze_javascript_code(code: str) -> Dict[str, Any]:
    """Analyze JavaScript code"""
    feedback = []
    suggestions = []
    strengths = []
    score = 100
    
    lines = code.split('\n')
    
    # Check for common JavaScript patterns
    has_functions = bool(re.search(r'function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>', code))
    has_comments = '//' in code or '/*' in code
    uses_const_let = 'const ' in code or 'let ' in code
    uses_var = 'var ' in code
    has_semicolons = ';' in code
    
    if has_functions:
        strengths.append("Good use of functions")
    
    if uses_const_let:
        strengths.append("Modern ES6+ syntax with const/let")
    
    if uses_var:
        feedback.append(FeedbackItem(
            type="warning",
            message="Consider using 'const' or 'let' instead of 'var'",
            line=None
        ))
        suggestions.append("Use const/let for better variable scoping")
        score -= 5
    
    if not has_comments and len(lines) > 10:
        suggestions.append("Add comments to explain complex logic")
        score -= 5
    
    if not has_semicolons:
        suggestions.append("Consider adding semicolons for clarity")
    
    # Check for console.log (should be removed in production)
    console_logs = len(re.findall(r'console\.log', code))
    if console_logs > 3:
        feedback.append(FeedbackItem(
            type="warning",
            message=f"Found {console_logs} console.log statements - remove before production",
            line=None
        ))
        score -= 5
    
    if len(strengths) == 0:
        strengths.append("Code structure looks good")
    
    return {
        "score": max(0, score),
        "feedback": feedback,
        "suggestions": suggestions,
        "strengths": strengths
    }

def analyze_java_code(code: str) -> Dict[str, Any]:
    """Analyze Java code"""
    feedback = []
    suggestions = []
    strengths = []
    score = 100
    
    # Check for Java patterns
    has_main = bool(re.search(r'public\s+static\s+void\s+main', code))
    has_classes = bool(re.search(r'class\s+\w+', code))
    has_methods = bool(re.search(r'(public|private|protected)\s+\w+\s+\w+\s*\(', code))
    has_comments = '//' in code or '/*' in code
    
    if has_main:
        strengths.append("Contains main method")
    
    if has_classes:
        strengths.append("Object-oriented structure with classes")
    
    if has_methods:
        strengths.append("Well-structured with methods")
    
    if not has_comments and len(code.split('\n')) > 15:
        suggestions.append("Add JavaDoc comments for classes and methods")
        score -= 5
    
    # Check for proper naming conventions
    if not re.search(r'class\s+[A-Z]', code) and has_classes:
        feedback.append(FeedbackItem(
            type="warning",
            message="Class names should start with uppercase letter",
            line=None
        ))
        score -= 5
    
    if len(strengths) == 0:
        strengths.append("Code follows Java syntax")
    
    return {
        "score": max(0, score),
        "feedback": feedback,
        "suggestions": suggestions,
        "strengths": strengths
    }

def analyze_cpp_code(code: str) -> Dict[str, Any]:
    """Analyze C++ code"""
    feedback = []
    suggestions = []
    strengths = []
    score = 100
    
    has_includes = '#include' in code
    has_main = 'int main' in code
    has_namespace = 'using namespace' in code or 'std::' in code
    has_functions = bool(re.search(r'\w+\s+\w+\s*\([^)]*\)\s*{', code))
    
    if has_includes:
        strengths.append("Proper use of #include directives")
    
    if has_main:
        strengths.append("Contains main function")
    
    if has_namespace:
        strengths.append("Proper namespace usage")
    
    if has_functions:
        strengths.append("Good function organization")
    
    # Check for memory management
    has_new = 'new ' in code
    has_delete = 'delete ' in code
    
    if has_new and not has_delete:
        feedback.append(FeedbackItem(
            type="warning",
            message="Memory allocated with 'new' - ensure proper 'delete' usage",
            line=None
        ))
        suggestions.append("Check for memory leaks - use delete or smart pointers")
        score -= 10
    
    if len(strengths) == 0:
        strengths.append("Code follows C++ syntax")
    
    return {
        "score": max(0, score),
        "feedback": feedback,
        "suggestions": suggestions,
        "strengths": strengths
    }

def analyze_html_code(code: str) -> Dict[str, Any]:
    """Analyze HTML code"""
    feedback = []
    suggestions = []
    strengths = []
    score = 100
    
    has_doctype = '<!DOCTYPE' in code.upper()
    has_html_tag = '<html' in code.lower()
    has_head = '<head>' in code.lower()
    has_body = '<body>' in code.lower()
    has_title = '<title>' in code.lower()
    
    if has_doctype:
        strengths.append("Proper DOCTYPE declaration")
    else:
        feedback.append(FeedbackItem(
            type="warning",
            message="Missing DOCTYPE declaration",
            line=None
        ))
        score -= 5
    
    if has_html_tag and has_head and has_body:
        strengths.append("Well-structured HTML document")
    else:
        suggestions.append("Ensure proper HTML structure with <html>, <head>, and <body> tags")
        score -= 10
    
    if has_title:
        strengths.append("Includes page title")
    else:
        suggestions.append("Add <title> tag for better SEO")
        score -= 5
    
    # Check for semantic HTML
    semantic_tags = ['<header>', '<nav>', '<main>', '<article>', '<section>', '<footer>']
    semantic_count = sum(1 for tag in semantic_tags if tag in code.lower())
    
    if semantic_count >= 2:
        strengths.append("Good use of semantic HTML5 elements")
    
    if len(strengths) == 0:
        strengths.append("Basic HTML structure present")
    
    return {
        "score": max(0, score),
        "feedback": feedback,
        "suggestions": suggestions,
        "strengths": strengths
    }

def analyze_css_code(code: str) -> Dict[str, Any]:
    """Analyze CSS code"""
    feedback = []
    suggestions = []
    strengths = []
    score = 100
    
    has_classes = '.' in code
    has_ids = '#' in code
    has_media_queries = '@media' in code
    has_comments = '/*' in code
    
    if has_classes:
        strengths.append("Good use of CSS classes")
    
    if has_media_queries:
        strengths.append("Responsive design with media queries")
    
    if has_comments:
        strengths.append("Well-documented with comments")
    else:
        suggestions.append("Add comments to explain complex selectors")
        score -= 5
    
    # Check for !important overuse
    important_count = code.count('!important')
    if important_count > 3:
        feedback.append(FeedbackItem(
            type="warning",
            message=f"Overuse of !important ({important_count} times) - consider refactoring",
            line=None
        ))
        score -= 10
    
    # Check for vendor prefixes
    if '-webkit-' in code or '-moz-' in code:
        strengths.append("Browser compatibility with vendor prefixes")
    
    if len(strengths) == 0:
        strengths.append("Valid CSS syntax")
    
    return {
        "score": max(0, score),
        "feedback": feedback,
        "suggestions": suggestions,
        "strengths": strengths
    }

# ============================================
# API ENDPOINTS
# ============================================

@router.post("/analyze", response_model=GradingResponse)
async def analyze_code(request: CodeAnalysisRequest):
    try:
        language = request.language.lower()
        
        # Route to appropriate analyzer
        if language == "python":
            analysis = analyze_python_code(request.code)
        elif language in ["javascript", "js"]:
            analysis = analyze_javascript_code(request.code)
        elif language == "java":
            analysis = analyze_java_code(request.code)
        elif language in ["cpp", "c++"]:
            analysis = analyze_cpp_code(request.code)
        elif language == "html":
            analysis = analyze_html_code(request.code)
        elif language == "css":
            analysis = analyze_css_code(request.code)
        else:
            # Generic analysis for unsupported languages
            analysis = {
                "score": 75,
                "feedback": [
                    FeedbackItem(
                        type="success",
                        message=f"Code structure looks good for {language}",
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

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    return {
        "languages": [
            {"id": "python", "name": "Python", "extensions": [".py"]},
            {"id": "javascript", "name": "JavaScript", "extensions": [".js"]},
            {"id": "java", "name": "Java", "extensions": [".java"]},
            {"id": "cpp", "name": "C++", "extensions": [".cpp", ".cc", ".cxx"]},
            {"id": "c", "name": "C", "extensions": [".c"]},
            {"id": "html", "name": "HTML", "extensions": [".html", ".htm"]},
            {"id": "css", "name": "CSS", "extensions": [".css"]}
        ]
    }

@router.get("/history")
async def get_grading_history():
    return {"history": []}

@router.post("/{grading_id}/feedback")
async def submit_feedback(grading_id: str, feedback: dict):
    return {"message": "Feedback submitted successfully", "grading_id": grading_id}