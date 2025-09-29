from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from . import models

# ---- UserChat ----
def create_user_chat(
    db: Session,
    *,
    usercode: Optional[str],
    user_message: str,
    ai_response: str,
    model_id: Optional[str],
    endpoint: Optional[str],
    tokens_in: int,
    tokens_out: int,
    latency_ms: int,
    session_no: int
) -> models.UserChat:
    rec = models.UserChat(
        usercode=usercode,
        user_message=user_message,
        ai_response=ai_response,
        model_id=model_id or models.UserChat.model_id.default.arg,
        endpoint=endpoint or models.UserChat.endpoint.default.arg,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        latency_ms=latency_ms,
        session_no=session_no,
        created_time=datetime.utcnow(),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

def list_user_chats(db: Session, usercode: str, *, session_no: Optional[int] = None, limit: int = 200) -> List[models.UserChat]:
    q = db.query(models.UserChat).filter(models.UserChat.usercode == usercode)
    if session_no is not None:
        q = q.filter(models.UserChat.session_no == session_no)
    return q.order_by(models.UserChat.created_time.desc()).limit(limit).all()

# ---- UserFeedback ----
def create_user_feedback(
    db: Session,
    *,
    usercode: str,
    question_id: int,
    feedback_text: str,
    feedback_type: str = "general",
    session_no: int
) -> models.UserFeedback:
    rec = models.UserFeedback(
        usercode=usercode,
        question_id=question_id,
        feedback_text=feedback_text,
        feedback_type=feedback_type,
        session_no=session_no,
        created_time=datetime.utcnow(),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

def list_user_feedback(db: Session, usercode: str, *, session_no: Optional[int] = None, limit: int = 200) -> List[models.UserFeedback]:
    q = db.query(models.UserFeedback).filter(models.UserFeedback.usercode == usercode)
    if session_no is not None:
        q = q.filter(models.UserFeedback.session_no == session_no)
    return q.order_by(models.UserFeedback.created_time.desc()).limit(limit).all()
