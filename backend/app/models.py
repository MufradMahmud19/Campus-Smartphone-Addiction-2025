from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    text = Column(String(500), unique=True, index=True)

class UserResponse(Base):
    __tablename__ = "user_responses"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question_id = Column(Integer, index=True)
    answer = Column(Integer)
    # chat_history = Column(Text) # no need
    usercode = Column(String(50), ForeignKey("users.usercode"))
    session_no = Column(Integer, index=True, default=0)            # default 0 (in-progress)
    created_time = Column(DateTime, default=datetime.utcnow)       # replaces timestamp
    user = relationship("User", back_populates="responses")

class UserChat(Base):
    __tablename__ = "user_chats"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usercode = Column(String(50), ForeignKey("users.usercode"), index=True, nullable=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    session_no = Column(Integer, index=True, default=0)            # default 0 (in-progress)
    created_time = Column(DateTime, default=datetime.utcnow)
    model_id = Column(String(120), default="mistralai/Mistral-7B-Instruct-v0.3")
    endpoint = Column(String(200), default="http://puhti:8001/v1/generate")
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usercode = Column(String(50), ForeignKey("users.usercode"), index=True)
    question_id = Column(Integer, index=True)
    feedback_text = Column(Text)
    feedback_type = Column(String(50), default="general")          # "step" | "final" | etc.
    session_no = Column(Integer, index=True, default=0)            # default 0 (in-progress)
    created_time = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="feedback")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usercode = Column(String(50), unique=True, index=True)
    age = Column(String(10))
    gender = Column(String(20))
    country = Column(String(100))
    education = Column(String(50))
    field = Column(String(100))
    yearsOfStudy = Column(String(10))
    session_count = Column(Integer, default=0)                     # start at 0
    session_start_time = Column(DateTime, nullable=True)           # set/updated on /session/start
    created_time = Column(DateTime, default=datetime.utcnow)

    responses = relationship("UserResponse", back_populates="user")
    feedback = relationship("UserFeedback", back_populates="user")
