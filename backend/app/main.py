import random
import string
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, get_db, test_connection
from .question_manager import question_manager
from . import models, schemas

app = FastAPI()

origins = [
    "http://localhost:3000",  # React dev server / Nginx
    "http://127.0.0.1:3000",  # Alternative localhost
    # "https://your-production-domain.com",  # add when deploying to cloud
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running with CORS enabled"}

# Test database connection and sync questions on startup
@app.on_event("startup")
async def startup_event():
    print("🔌 Testing database connection...")
    if not test_connection():
        print("⚠️  Warning: Database connection failed. Some features may not work.")
        return
    
    print(" Database connection established successfully!")
    
    # Ensure tables exist before syncing questions
    try:
        print("🔧 Checking database tables...")
        from .database import SessionLocal
        db = SessionLocal()
        
        # Check if questions table exists
        try:
            db.query(models.Question).first()
            print(" Questions table exists, syncing questions...")
            
            # Sync questions from config file to database
            sync_result = question_manager.sync_questions_to_db(db)
            
            if "error" not in sync_result:
                print(f" Questions synced: {sync_result['added']} added, {sync_result['updated']} updated, {sync_result['skipped']} skipped")
            else:
                print(f"  Question sync warning: {sync_result['error']}")
                
        except Exception as e:
            print(f"  Questions table not found: {e}")
            print(" Please run 'python recreate_tables.py' first to create the database tables")
            
        db.close()
        
    except Exception as e:
        print(f"  Startup warning: {e}")

# Note: Questions are automatically synced from config file on startup
# Make sure to run 'python recreate_tables.py' first to create tables

def generate_usercode(length=8):
    """Generate a random usercode"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@app.post("/register", response_model=schemas.UserOut)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Generate unique usercode
        usercode = generate_usercode()
        
        # Check if usercode already exists (very unlikely but safe)
        while db.query(models.User).filter(models.User.usercode == usercode).first():
            usercode = generate_usercode()
        
        # Create new user
        new_user = models.User(
            usercode=usercode,
            age=user_data.age,
            gender=user_data.gender,
            country=user_data.country,
            education=user_data.education,
            field=user_data.field,
            yearsOfStudy=user_data.yearsOfStudy
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f" New user registered: {usercode}")
        return new_user
        
    except Exception as e:
        db.rollback()
        print(f" Error registering user: {e}")
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")

@app.get("/users", response_model=list[schemas.UserOut])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{usercode}", response_model=schemas.UserOut)
def get_user(usercode: str, db: Session = Depends(get_db)):
    """Get a specific user by usercode"""
    user = db.query(models.User).filter(models.User.usercode == usercode).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/questions", response_model=list[schemas.QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    """Get all questions"""
    questions = db.query(models.Question).all()
    return questions

@app.post("/questions", response_model=schemas.QuestionOut)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    """Create a new question"""
    db_question = models.Question(text=question.text)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@app.post("/validate_usercode", response_model=schemas.UserCodeValidOut)
def validate_usercode(data: schemas.UserCodeValidate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.usercode == data.usercode).first()
    return {"valid": user is not None}

@app.get("/questions/config")
def get_questions_config():
    """Get questions configuration and summary"""
    return {
        "config_summary": question_manager.get_questions_summary(),
        "questions": question_manager.questions_data["questions"]
    }

@app.post("/questions/reload")
def reload_questions_config():
    """Reload questions from config file (useful for development)"""
    success = question_manager.reload_config()
    if success:
        return {"message": "Questions config reloaded successfully", "status": "success"}
    else:
        raise HTTPException(status_code=500, detail="Failed to reload questions config")

@app.post("/submit_survey")
def submit_survey(payload: dict, db: Session = Depends(get_db)):
    """
    Submit complete survey data for a user
    Expected payload: { "usercode": str, "answers": {question_id: int}, "completed_at": str }
    """
    try:
        usercode = payload.get("usercode")
        answers = payload.get("answers", {})
        
        if not usercode or not isinstance(answers, dict):
            raise HTTPException(status_code=400, detail="Missing usercode or answers")

        # Create new responses for each question (allowing multiple responses per user)
        for qid_str, answer in answers.items():
            try:
                qid = int(qid_str)
            except (ValueError, TypeError):
                qid = qid_str  # if already int
            
            # Always create a new response (timestamp will be automatically set)
            new_response = models.UserResponse(
                question_id=qid,
                answer=int(answer),
                usercode=usercode,
                chat_history=""
            )
            db.add(new_response)
        
        db.commit()
        print(f" Survey submitted successfully for user: {usercode}")
        return {"status": "success", "message": "Survey submitted successfully"}
        
    except Exception as e:
        db.rollback()
        print(f" Error submitting survey: {e}")
        raise HTTPException(status_code=500, detail=f"Error submitting survey: {str(e)}")

@app.get("/question_answers/{question_id}")
def get_question_answers(question_id: int, db: Session = Depends(get_db)):
    """Get all answers for a specific question from user_responses table"""
    try:
        # Fetch all responses for the given question_id
        responses = db.query(models.UserResponse).filter(
            models.UserResponse.question_id == question_id
        ).all()
        
        # Extract just the answer values
        answers = [response.answer for response in responses]
        
        print(f" Fetched {len(answers)} answers for question {question_id}")
        return answers
        
    except Exception as e:
        print(f" Error fetching question answers: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching question answers: {str(e)}")

@app.get("/user_responses/{usercode}")
def get_user_responses(usercode: str, db: Session = Depends(get_db)):
    """Get all responses for a specific user with timestamps"""
    try:
        # Fetch all responses for the given usercode, ordered by timestamp
        responses = db.query(models.UserResponse).filter(
            models.UserResponse.usercode == usercode
        ).order_by(models.UserResponse.timestamp.desc()).all()
        
        # Format response data
        response_data = []
        for response in responses:
            response_data.append({
                "id": response.id,
                "question_id": response.question_id,
                "answer": response.answer,
                "timestamp": response.timestamp.isoformat() if response.timestamp else None,
                "chat_history": response.chat_history
            })
        
        print(f" Fetched {len(response_data)} responses for user {usercode}")
        return {
            "usercode": usercode,
            "total_responses": len(response_data),
            "responses": response_data
        }
        
    except Exception as e:
        print(f" Error fetching user responses: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching user responses: {str(e)}")

@app.get("/user_latest_responses/{usercode}")
def get_user_latest_responses(usercode: str, db: Session = Depends(get_db)):
    """Get the latest response for each question for a specific user"""
    try:
        # Get the latest response for each question using a subquery
        from sqlalchemy import func
        
        # Subquery to get the latest timestamp for each question
        latest_timestamps = db.query(
            models.UserResponse.question_id,
            func.max(models.UserResponse.timestamp).label('latest_timestamp')
        ).filter(
            models.UserResponse.usercode == usercode
        ).group_by(models.UserResponse.question_id).subquery()
        
        # Get the actual responses with the latest timestamps
        latest_responses = db.query(models.UserResponse).join(
            latest_timestamps,
            (models.UserResponse.question_id == latest_timestamps.c.question_id) &
            (models.UserResponse.timestamp == latest_timestamps.c.latest_timestamp)
        ).filter(
            models.UserResponse.usercode == usercode
        ).all()
        
        # Format response data
        response_data = {}
        for response in latest_responses:
            response_data[response.question_id] = {
                "id": response.id,
                "answer": response.answer,
                "timestamp": response.timestamp.isoformat() if response.timestamp else None,
                "chat_history": response.chat_history
            }
        
        print(f" Fetched latest responses for {len(response_data)} questions for user {usercode}")
        return {
            "usercode": usercode,
            "latest_responses": response_data
        }
        
    except Exception as e:
        print(f" Error fetching user latest responses: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching user latest responses: {str(e)}")

# Placeholder endpoints for future features
@app.get("/risk_radar")
def get_risk_radar():
    """Get risk radar data for visualization"""
    return {"message": "Risk radar feature coming soon!"}

@app.get("/percentiles")
def get_percentiles():
    """Get percentile data for peer comparison"""
    return {"message": "Percentile feature coming soon!"}