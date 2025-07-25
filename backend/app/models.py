from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

from .database import Base

Base = declarative_base()

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, unique=True, index=True)

class UserResponse(Base):
    __tablename__ = "user_responses"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, index=True)
    answer = Column(Integer)
    chat_history = Column(Text)

class UserChat(Base):
    __tablename__ = "user_chats"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    timestamp = Column(Integer)  # Store as a Unix timestamp for simplicity

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    usercode = Column(String, unique=True, index=True)
    age = Column(String)
    gender = Column(String)
    country = Column(String)
    education = Column(String)
    field = Column(String)
    yearsOfStudy = Column(String)