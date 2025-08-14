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
    chat_history = Column(Text)
    usercode = Column(String(50), ForeignKey("users.usercode"))  # FK references User.usercode
    timestamp = Column(DateTime, default=datetime.utcnow)  # Timestamp for tracking when response was given

    # Relationship back to User:
    user = relationship("User", back_populates="responses")

class UserChat(Base):
    __tablename__ = "user_chats"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    timestamp = Column(Integer)  # Store as a Unix timestamp for simplicity

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

    # One-to-many relationship:
    responses = relationship("UserResponse", back_populates="user")
