"""
Question Manager for Campus Smartphone Addiction Project
Automatically loads questions from config file and syncs with database
"""

import json
import os
from pathlib import Path
from sqlalchemy.orm import Session
from . import models

class QuestionManager:
    def __init__(self, config_path: str = "questions_config.json"):
        self.config_path = config_path
        self.questions_data = self.load_config()
    
    def load_config(self) -> dict:
        """Load questions from config file"""
        try:
            config_file = Path(__file__).parent.parent / self.config_path
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️  Config file {self.config_path} not found. Using default questions.")
            return self.get_default_questions()
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing config file: {e}. Using default questions.")
            return self.get_default_questions()
    
    def get_default_questions(self) -> dict:
        """Fallback default questions if config file is missing"""
        return {
            "questions": [
                {"id": 1, "text": "Missing planned work due to smartphone use", "category": "productivity", "active": True},
                {"id": 2, "text": "Having a hard time concentrating in class, while doing assignments, or while working due to smartphone use", "category": "academic", "active": True},
                {"id": 3, "text": "Feeling pain in the wrists or at the back of the neck while using a smartphone", "category": "physical", "active": True},
                {"id": 4, "text": "Won't be able to stand not having a smartphone", "category": "dependency", "active": True},
                {"id": 5, "text": "Feeling impatient and fretful (ill-tempered) when I am not holding my smartphone", "category": "emotional", "active": True},
                {"id": 6, "text": "Having my smartphone in my mind even when I am not using it", "category": "psychological", "active": True},
                {"id": 7, "text": "I will never give up using my smartphone even when my daily life is already greatly affected by it", "category": "addiction", "active": True},
                {"id": 8, "text": "Constantly checking my smartphone so as not to miss conversations between other people on Twitter or Facebook", "category": "social", "active": True},
                {"id": 9, "text": "Using my smartphone longer than I had intended", "category": "time_management", "active": True},
                {"id": 10, "text": "The people around me tell me that I use my smartphone too much", "category": "social_feedback", "active": True}
            ],
            "metadata": {
                "version": "1.0",
                "last_updated": "2025-01-27",
                "description": "Default SAS Questions",
                "total_questions": 10,
                "scale": "1-6 Likert Scale"
            }
        }
    
    def sync_questions_to_db(self, db: Session) -> dict:
        """Sync questions from config file to database"""
        try:
            print("🔄 Syncing questions from config file to database...")
            
            # Get existing questions from database
            existing_questions = {q.text: q for q in db.query(models.Question).all()}
            
            added_count = 0
            updated_count = 0
            skipped_count = 0
            
            for question_data in self.questions_data["questions"]:
                question_text = question_data["text"]
                question_id = question_data.get("id")
                category = question_data.get("category", "general")
                
                if question_text in existing_questions:
                    # Question exists, check if needs update
                    existing = existing_questions[question_text]
                    if existing.id != question_id:
                        existing.id = question_id
                        updated_count += 1
                        print(f"   🔄 Updated question {question_id}: {question_text[:50]}...")
                    else:
                        skipped_count += 1
                else:
                    # New question, add it
                    new_question = models.Question(
                        id=question_id,
                        text=question_text
                    )
                    db.add(new_question)
                    added_count += 1
                    print(f"   ✅ Added question {question_id}: {question_text[:50]}...")
            
            # Commit changes
            db.commit()
            
            print(f"✅ Sync completed: {added_count} added, {updated_count} updated, {skipped_count} skipped")
            
            return {
                "added": added_count,
                "updated": updated_count,
                "skipped": skipped_count,
                "total": len(self.questions_data["questions"])
            }
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error syncing questions: {e}")
            return {"error": str(e)}
    
    def get_questions_summary(self) -> dict:
        """Get summary of questions from config"""
        return {
            "total_questions": len(self.questions_data["questions"]),
            "categories": list(set(q.get("category", "general") for q in self.questions_data["questions"])),
            "version": self.questions_data.get("metadata", {}).get("version", "unknown"),
            "last_updated": self.questions_data.get("metadata", {}).get("last_updated", "unknown")
        }
    
    def reload_config(self) -> bool:
        """Reload config file (useful for development)"""
        try:
            self.questions_data = self.load_config()
            print("✅ Config file reloaded successfully")
            return True
        except Exception as e:
            print(f"❌ Error reloading config: {e}")
            return False

# Global instance
question_manager = QuestionManager()
