# backend/api/ratings.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import json
import os
from pathlib import Path

router = APIRouter(prefix="/api/ratings", tags=["ratings"])

# Create data directory if it doesn't exist
DATA_DIR = Path("data/ratings")
DATA_DIR.mkdir(parents=True, exist_ok=True)
RATINGS_FILE = DATA_DIR / "ratings.json"

class RatingSubmission(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    category: Optional[str] = Field(None, description="Category selected by user")
    feedback: Optional[str] = Field(None, description="User feedback text")
    timestamp: str = Field(..., description="ISO format timestamp")
    user_agent: Optional[str] = Field(None, description="Browser user agent")
    device_type: Optional[str] = Field(None, description="mobile or desktop")

class RatingResponse(BaseModel):
    id: str
    rating: int
    category: Optional[str]
    feedback: Optional[str]
    timestamp: str
    user_agent: Optional[str]
    device_type: Optional[str]

class RatingStats(BaseModel):
    total_ratings: int
    average_rating: float
    distribution: dict
    recent_ratings: List[RatingResponse]

# Helper function to load ratings
def load_ratings() -> List[dict]:
    if RATINGS_FILE.exists():
        try:
            with open(RATINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading ratings: {e}")
            return []
    return []

# Helper function to save ratings
def save_ratings(ratings: List[dict]) -> bool:
    try:
        with open(RATINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(ratings, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving ratings: {e}")
        return False

# Send notification (console log for now)
def send_notification(rating_data: dict):
    """Log new rating notification"""
    try:
        print(f"""
        ╔══════════════════════════════════════════╗
        ║       📧 NEW RATING RECEIVED!           ║
        ╠══════════════════════════════════════════╣
        ║ ⭐ Stars: {rating_data['rating']}/5
        ║ 📝 Category: {rating_data.get('category', 'N/A')}
        ║ 💬 Feedback: {rating_data.get('feedback', 'No feedback')[:50]}
        ║ 🕒 Time: {rating_data['timestamp']}
        ║ 📱 Device: {rating_data.get('device_type', 'Unknown')}
        ╚══════════════════════════════════════════╝
        """)
    except Exception as e:
        print(f"Error sending notification: {e}")

@router.post("/submit", response_model=RatingResponse)
async def submit_rating(
    rating_data: RatingSubmission,
    background_tasks: BackgroundTasks
):
    """Submit a new rating from the frontend"""
    try:
        # Load existing ratings
        ratings = load_ratings()
        
        # Create new rating with ID
        new_rating = {
            "id": f"rating_{int(datetime.now().timestamp() * 1000)}",
            "rating": rating_data.rating,
            "category": rating_data.category,
            "feedback": rating_data.feedback,
            "timestamp": rating_data.timestamp,
            "user_agent": rating_data.user_agent,
            "device_type": rating_data.device_type,
            "received_at": datetime.now().isoformat()
        }
        
        # Add to ratings list
        ratings.append(new_rating)
        
        # Save to file
        if not save_ratings(ratings):
            raise HTTPException(status_code=500, detail="Failed to save rating")
        
        # Send notification in background
        background_tasks.add_task(send_notification, new_rating)
        
        print(f"✅ New rating saved: {new_rating['id']}")
        
        return RatingResponse(**new_rating)
        
    except Exception as e:
        print(f"❌ Error submitting rating: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=List[RatingResponse])
async def get_all_ratings():
    """Get all ratings (for admin view)"""
    try:
        ratings = load_ratings()
        return [RatingResponse(**r) for r in ratings]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=RatingStats)
async def get_rating_stats():
    """Get rating statistics"""
    try:
        ratings = load_ratings()
        
        if not ratings:
            return RatingStats(
                total_ratings=0,
                average_rating=0.0,
                distribution={1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
                recent_ratings=[]
            )
        
        # Calculate statistics
        total = len(ratings)
        total_stars = sum(r['rating'] for r in ratings)
        average = round(total_stars / total, 2) if total > 0 else 0.0
        
        # Distribution
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            distribution[r['rating']] += 1
        
        # Recent ratings (last 10)
        recent = sorted(ratings, key=lambda x: x['timestamp'], reverse=True)[:10]
        
        return RatingStats(
            total_ratings=total,
            average_rating=average,
            distribution=distribution,
            recent_ratings=[RatingResponse(**r) for r in recent]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clear")
async def clear_all_ratings():
    """Clear all ratings (admin only - add authentication in production!)"""
    try:
        if RATINGS_FILE.exists():
            RATINGS_FILE.unlink()
        return {"message": "All ratings cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
async def export_ratings_csv():
    """Export ratings as CSV for analysis"""
    try:
        ratings = load_ratings()
        
        if not ratings:
            return {"message": "No ratings to export"}
        
        # Create CSV content
        csv_content = "ID,Rating,Category,Feedback,Timestamp,Device\n"
        for r in ratings:
            feedback = r.get('feedback', '').replace(',', ';').replace('\n', ' ')
            csv_content += f"{r['id']},{r['rating']},{r.get('category', '')},{feedback},{r['timestamp']},{r.get('device_type', '')}\n"
        
        return {
            "csv": csv_content,
            "filename": f"ratings_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))