import random
import string
import asyncio
import httpx
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import engine, get_db, test_connection
from .question_manager import question_manager
from . import models, schemas, crud
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from .llm_client import LLMClient

LLM_ENDPOINT_DISPLAY = os.getenv("LLM_API_BASE", "http://127.0.0.1:8003")
_llm = LLMClient()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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

# Startup: DB ping + sync questions
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
        try:
            db.query(models.Question).first()
            print(" Questions table exists, syncing questions...")
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

    # --- Gate readiness on LLM health ---
    llm_health_retries = int(os.getenv("LLM_HEALTH_RETRIES", "24"))  # ~2 minutes at 5s intervals
    llm_health_interval = float(os.getenv("LLM_HEALTH_INTERVAL", "5.0"))

    print("🔎 Probing LLM health…")
    healthy = False
    for attempt in range(1, llm_health_retries + 1):
        try:
            out = await _llm.healthz()
            print(f" ✅ LLM healthy on attempt {attempt}: {out}")
            healthy = True
            break
        except Exception as e:
            print(f" ⏳ LLM not ready yet (attempt {attempt}/{llm_health_retries}): {e}")
            await asyncio.sleep(llm_health_interval)

    if not healthy:
        raise RuntimeError("LLM backend not healthy after startup retries. Aborting startup.")

def generate_usercode(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# --- Session utilities following your finalized logic ---

def get_current_session_no(db: Session, usercode: str) -> int:
    """
    Latest completed session number for the user.
    If user not found or has not completed any session, returns 0.
    """
    user = db.query(models.User).filter(models.User.usercode == usercode).first()
    return user.session_count if user and user.session_count is not None else 0

def increment_session(db: Session, usercode: str) -> int:
    """
    Increments session_count (at survey finish) and returns the new session number.
    """
    user = db.query(models.User).filter(models.User.usercode == usercode).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.session_count = (user.session_count or 0) + 1
    db.commit()
    db.refresh(user)
    return user.session_count

@app.post("/users/{usercode}/session/start")
def start_session(usercode: str, db: Session = Depends(get_db)):
    """
    Mark (or re-mark) the start time of the current in-progress session.
    Does NOT increment session_count.
    Called when the participant clicks 'Continue' on the instructions page.
    """
    user = db.query(models.User).filter(models.User.usercode == usercode).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.session_start_time = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return {"usercode": usercode, "session_start_time": user.session_start_time.isoformat()}

# --- Users / Questions ---

@app.post("/register", response_model=schemas.UserOut)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        usercode = generate_usercode()
        while db.query(models.User).filter(models.User.usercode == usercode).first():
            usercode = generate_usercode()

        new_user = models.User(
            usercode=usercode,
            age=user_data.age,
            gender=user_data.gender,
            country=user_data.country,
            education=user_data.education,
            field=user_data.field,
            yearsOfStudy=user_data.yearsOfStudy,
            session_count=0,               # explicit for clarity
            session_start_time=None
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

@app.get("/users", response_model=List[schemas.UserOut])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.User).offset(skip).limit(limit).all()

@app.get("/users/{usercode}", response_model=schemas.UserOut)
def get_user(usercode: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.usercode == usercode).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/questions", response_model=List[schemas.QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    return db.query(models.Question).order_by(models.Question.id.asc()).all()

@app.post("/questions", response_model=schemas.QuestionOut)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
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
    return {
        "config_summary": question_manager.get_questions_summary(),
        "questions": question_manager.questions_data["questions"]
    }

@app.post("/questions/reload")
def reload_questions_config():
    success = question_manager.reload_config()
    if success:
        return {"message": "Questions config reloaded successfully", "status": "success"}
    else:
        raise HTTPException(status_code=500, detail="Failed to reload questions config")

# --- Submit (Finish) Survey: increment + save + retro-tag ---

@app.post("/submit_survey")
def submit_survey(payload: dict, db: Session = Depends(get_db)):
    """
    Finishes a survey run.
    Expected payload: { "usercode": str, "answers": {question_id: int}, "completed_at": str? }
    Steps:
      1) increment users.session_count -> new_session_no
      2) save user_responses with session_no = new_session_no
      3) retro-tag user_chats and user_feedback where session_no=0 AND created_time >= users.session_start_time
    """
    try:
        usercode = payload.get("usercode")
        answers = payload.get("answers", {})

        if not usercode or not isinstance(answers, dict):
            raise HTTPException(status_code=400, detail="Missing usercode or answers")

        user = db.query(models.User).filter(models.User.usercode == usercode).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 1) increment session_count
        new_session_no = increment_session(db, usercode)  # commits user; refresh done inside
        user = db.query(models.User).filter(models.User.usercode == usercode).first()

        # 2) save responses with this session_no
        for qid_str, answer in answers.items():
            try:
                qid = int(qid_str)
            except (ValueError, TypeError):
                qid = qid_str
            new_response = models.UserResponse(
                question_id=qid,
                answer=int(answer),
                usercode=usercode,
                # chat_history="",
                session_no=new_session_no
                # created_time auto
            )
            db.add(new_response)
        db.commit()

        # 3) retro-tag chats & feedback from this in-progress window
        # Only if we have a session_start_time to anchor on
        if user.session_start_time:
            # retag chats
            db.query(models.UserChat).filter(
                models.UserChat.usercode == usercode,
                models.UserChat.session_no == 0,
                models.UserChat.created_time >= user.session_start_time
            ).update({models.UserChat.session_no: new_session_no}, synchronize_session=False)

            # retag feedback
            db.query(models.UserFeedback).filter(
                models.UserFeedback.usercode == usercode,
                models.UserFeedback.session_no == 0,
                models.UserFeedback.created_time >= user.session_start_time
            ).update({models.UserFeedback.session_no: new_session_no}, synchronize_session=False)

            db.commit()

        print(f" Survey submitted successfully for user: {usercode} (session {new_session_no})")
        return {"status": "success", "message": "Survey submitted successfully", "session_no": new_session_no}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f" Error submitting survey: {e}")
        raise HTTPException(status_code=500, detail=f"Error submitting survey: {str(e)}")

# --- Responses (use created_time + include session_no) ---

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
    try:
        responses = db.query(models.UserResponse).filter(
            models.UserResponse.usercode == usercode
        ).order_by(models.UserResponse.created_time.desc()).all()

        response_data = []
        for r in responses:
            response_data.append({
                "id": r.id,
                "question_id": r.question_id,
                "answer": r.answer,
                "created_time": r.created_time.isoformat() if r.created_time else None,
                "session_no": r.session_no
                # "chat_history": r.chat_history
            })
        return {"usercode": usercode, "total_responses": len(response_data), "responses": response_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user responses: {str(e)}")

@app.get("/user_latest_responses/{usercode}")
def get_user_latest_responses(usercode: str, db: Session = Depends(get_db)):
    try:
        latest_timestamps = db.query(
            models.UserResponse.question_id,
            func.max(models.UserResponse.created_time).label('latest_ct')
        ).filter(
            models.UserResponse.usercode == usercode
        ).group_by(models.UserResponse.question_id).subquery()

        latest_responses = db.query(models.UserResponse).join(
            latest_timestamps,
            (models.UserResponse.question_id == latest_timestamps.c.question_id) &
            (models.UserResponse.created_time == latest_timestamps.c.latest_ct)
        ).filter(
            models.UserResponse.usercode == usercode
        ).all()

        response_data = {}
        for r in latest_responses:
            response_data[r.question_id] = {
                "id": r.id,
                "answer": r.answer,
                "created_time": r.created_time.isoformat() if r.created_time else None,
                "session_no": r.session_no
                # "chat_history": r.chat_history
            }
        return {"usercode": usercode, "latest_responses": response_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user latest responses: {str(e)}")

# ================= LLM endpoints =================

@app.get("/llm/health")
async def llm_health():
    out = await _llm.healthz()
    return {"status": "ok", "llm": out, "base_url": LLM_ENDPOINT_DISPLAY}

class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: Optional[int] = Field(default=256)
    temperature: Optional[float] = Field(default=0.2)
    top_p: Optional[float] = Field(default=0.9)
    top_k: Optional[int] = Field(default=50)
    repetition_penalty: Optional[float] = Field(default=1.1)
    do_sample: Optional[bool] = Field(default=None)

@app.post("/v1/generate")
async def v1_generate(req: GenerateRequest):
    payload = {
        "instruction": req.prompt,
        "max_new_tokens": req.max_new_tokens or 256,
        "temperature": req.temperature or 0.2,
        "top_p": req.top_p or 0.9,
        "top_k": req.top_k or 50,
        "repetition_penalty": req.repetition_penalty or 1.1,
        "do_sample": req.do_sample,
    }
    data, _latency = await _llm.generate(payload)
    return {"text": data.get("output", "")}

@app.post("/v1/chat", response_model=dict)
async def v1_chat(req: schemas.LLMChatRequest, db: Session = Depends(get_db)):
    payload = {
        "messages": [m.dict() for m in req.messages],
        "max_new_tokens": req.max_new_tokens or 256,
        "temperature": req.temperature or 0.2,
        "top_p": req.top_p or 0.9,
    }
    try:
        data, latency_ms = await _llm.chat(payload)
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="LLM backend timed out while warming up; please retry.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"LLM backend unavailable; please retry. ({str(e)})")

    ai_text = data.get("output", "")

    if req.usercode:
        user_msg = ""
        for m in reversed(req.messages):
            if m.role.lower() == "user":
                user_msg = m.content
                break
        try:
            # Save as in-progress (session 0)
            crud.create_user_chat(
                db,
                usercode=req.usercode,
                user_message=user_msg,
                ai_response=ai_text,
                model_id=data.get("model"),
                endpoint=f"{LLM_ENDPOINT_DISPLAY}/v1/chat",
                tokens_in=int(data.get("prompt_tokens", 0)),
                tokens_out=int(data.get("generated_tokens", 0)),
                latency_ms=int(latency_ms),
                session_no=0,
            )
        except Exception as e:
            db.rollback()
            print(f"[WARN] Failed to persist chat: {e}")
    return {"text": ai_text}

@app.post("/v1/survey/answer_feedback")
async def v1_answer_feedback(req: schemas.AnswerFeedbackIn, db: Session = Depends(get_db)):
    qtext = req.question_text
    if not qtext:
        q = db.query(models.Question).filter(models.Question.id == req.question_id).first()
        qtext = q.text if q else f"Question {req.question_id}"

    payload = {
        "user_id": req.usercode,
        "survey_id": req.survey_id,
        "questions_and_answers": [
            {"question_id": req.question_id, "question": qtext, "answer": str(req.answer)}
        ],
        "max_new_tokens": req.max_new_tokens or 220,
        "temperature": req.temperature or 0.2,
    }
    try:
        data, _latency = await _llm.answer_feedback(payload)
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="LLM backend timed out while warming up; please retry.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"LLM backend unavailable; please retry. ({str(e)})")

    feedback = data.get("output", "")

    try:
        rec = crud.create_user_feedback(
            db,
            usercode=req.usercode,
            question_id=req.question_id,
            feedback_text=feedback,
            feedback_type="step",
            session_no=0,   # in-progress
        )
        return {"text": feedback, "feedback_id": rec.id, "session_no": 0}
    except Exception as e:
        db.rollback()
        print(f"[WARN] Failed to persist answer feedback: {e}")
        return {"text": feedback, "feedback_id": None}

@app.post("/v1/survey/final_feedback")
async def v1_final_feedback(req: schemas.FinalFeedbackIn, db: Session = Depends(get_db)):
    payload = {
        "user_id": req.usercode,
        "survey_id": req.survey_id,
        "all_answers": req.all_answers,
        "summary_of_user": req.summary_of_user,
        "max_new_tokens": req.max_new_tokens or 380,
        "temperature": req.temperature or 0.2,
    }
    try:
        data, _latency = await _llm.final_feedback(payload)
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="LLM backend timed out while warming up; please retry.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"LLM backend unavailable; please retry. ({str(e)})")

    feedback = data.get("output", "")

    try:
        rec = crud.create_user_feedback(
            db,
            usercode=req.usercode,
            question_id=0,
            feedback_text=feedback,
            feedback_type="final",
            session_no=0,  # in-progress; will be re-tagged on submit_survey
        )
        return {"text": feedback, "feedback_id": rec.id, "session_no": 0}
    except Exception as e:
        db.rollback()
        print(f"[WARN] Failed to persist final feedback: {e}")
        return {"text": feedback, "feedback_id": None}

# --- Retrieval with session defaults/overrides ---

@app.get("/users/{usercode}/chats", response_model=List[schemas.UserChatOut])
def get_user_chats(
    usercode: str,
    session: Optional[int] = Query(default=None),
    all_sessions: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    if all_sessions:
        return crud.list_user_chats(db, usercode=usercode, session_no=None)
    session_no = session if session is not None else get_current_session_no(db, usercode)
    return crud.list_user_chats(db, usercode=usercode, session_no=session_no)

@app.get("/users/{usercode}/feedback", response_model=List[schemas.UserFeedbackOut])
def get_user_feedback(
    usercode: str,
    session: Optional[int] = Query(default=None),
    all_sessions: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    if all_sessions:
        return crud.list_user_feedback(db, usercode=usercode, session_no=None)
    session_no = session if session is not None else get_current_session_no(db, usercode)
    return crud.list_user_feedback(db, usercode=usercode, session_no=session_no)
