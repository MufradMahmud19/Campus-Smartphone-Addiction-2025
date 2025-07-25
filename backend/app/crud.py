from sqlalchemy.orm import Session
from . import models, schemas

def create_answer(db: Session, answer: schemas.AnswerCreate):
    db_answer = models.Answer(**answer.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

def get_answer(db: Session, answer_id: int):
    return db.query(models.Answer).filter(models.Answer.id == answer_id).first()

def get_answers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Answer).offset(skip).limit(limit).all()

def update_answer(db: Session, answer_id: int, answer: schemas.AnswerUpdate):
    db_answer = db.query(models.Answer).filter(models.Answer.id == answer_id).first()
    if db_answer:
        for key, value in answer.dict(exclude_unset=True).items():
            setattr(db_answer, key, value)
        db.commit()
        db.refresh(db_answer)
    return db_answer

def delete_answer(db: Session, answer_id: int):
    db_answer = db.query(models.Answer).filter(models.Answer.id == answer_id).first()
    if db_answer:
        db.delete(db_answer)
        db.commit()
    return db_answer