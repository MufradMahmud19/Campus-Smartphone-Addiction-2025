from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str
    text: str

class UserResponse(BaseModel):
    question_id: int
    answer: int

class Conversation(BaseModel):
    messages: List[ChatMessage]

class UserResponseCreate(BaseModel):
    question_id: int
    answer: int

class UserResponseOut(BaseModel):
    id: int
    question_id: int
    answer: int
    timestamp: datetime

    class Config:
        orm_mode = True

class QuestionCreate(BaseModel):
    text: str

class QuestionOut(BaseModel):
    id: int
    text: str

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    age: str
    gender: str
    country: str
    education: str
    field: str
    yearsOfStudy: str

class UserOut(BaseModel):
    id: int
    usercode: str
    age: str
    gender: str
    country: str
    education: str
    field: str
    yearsOfStudy: str

    class Config:
        orm_mode = True

class UserRegister(BaseModel):
    age: str
    gender: str
    country: str
    education: str
    field: str
    yearsOfStudy: str

class UserCodeOut(BaseModel):
    usercode: str

class UserCodeValidate(BaseModel):
    usercode: str

class UserCodeValidOut(BaseModel):
    valid: bool