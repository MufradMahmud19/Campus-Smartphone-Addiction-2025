from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- basic survey shapes ---

class UserResponse(BaseModel):
    question_id: int
    answer: int

class UserResponseCreate(BaseModel):
    question_id: int
    answer: int

class UserResponseOut(BaseModel):
    id: int
    question_id: int
    answer: int
    created_time: datetime
    session_no: int

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
    session_count: int
    session_start_time: Optional[datetime] = None
    created_time: datetime
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

# --- LLM / Survey schemas ---

class LLMChatMessage(BaseModel):
    role: str
    content: str

class LLMChatRequest(BaseModel):
    messages: List[LLMChatMessage]
    max_new_tokens: Optional[int] = 256
    temperature: Optional[float] = 0.2
    top_p: Optional[float] = 0.9
    usercode: Optional[str] = None

class AnswerFeedbackIn(BaseModel):
    usercode: str
    survey_id: Optional[str] = "sas-sv-10"
    question_id: int
    question_text: Optional[str] = None
    answer: int
    max_new_tokens: Optional[int] = 220
    temperature: Optional[float] = 0.2

class FinalFeedbackIn(BaseModel):
    usercode: str
    survey_id: Optional[str] = "sas-sv-10"
    all_answers: List[dict]
    summary_of_user: Optional[str] = None
    max_new_tokens: Optional[int] = 380
    temperature: Optional[float] = 0.2

# --- Outputs for convenience ---

class UserChatOut(BaseModel):
    id: int
    usercode: Optional[str]
    user_message: str
    ai_response: str
    created_time: datetime
    session_no: int
    model_id: Optional[str]
    tokens_in: Optional[int]
    tokens_out: Optional[int]
    latency_ms: Optional[int]
    class Config:
        orm_mode = True

class UserFeedbackOut(BaseModel):
    id: int
    usercode: str
    question_id: int
    feedback_text: str
    feedback_type: str
    created_time: datetime
    session_no: int
    class Config:
        orm_mode = True
