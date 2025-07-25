import random
import string
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models, schemas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

def generate_usercode(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smartphone Usage Wizard API"}

@app.post("/answers", response_model=schemas.UserResponseOut)
def create_user_response(response: schemas.UserResponseCreate, db: Session = Depends(get_db)):
    db_response = models.UserResponse(
        question=str(response.question_id),  # or use actual question text if available
        answer=response.answer,
        chat_history=""  # You can update this if you want to store chat
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response

@app.get("/answers", response_model=list[schemas.UserResponseOut])
def read_answers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.UserResponse).offset(skip).limit(limit).all()

@app.post("/questions", response_model=schemas.QuestionOut)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_question = models.Question(text=question.text)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@app.get("/questions", response_model=list[schemas.QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    return db.query(models.Question).all()

@app.post("/register_user", response_model=schemas.UserCodeOut)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    usercode = generate_usercode()
    db_user = models.User(
        usercode=usercode,
        age=user.age,
        gender=user.gender,
        country=user.country,
        education=user.education,
        field=user.field,
        yearsOfStudy=user.yearsOfStudy
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"usercode": usercode}

@app.post("/validate_usercode", response_model=schemas.UserCodeValidOut)
def validate_usercode(data: schemas.UserCodeValidate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.usercode == data.usercode).first()
    return {"valid": user is not None}