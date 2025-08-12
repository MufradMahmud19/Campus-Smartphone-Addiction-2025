#!/usr/bin/env python3
"""
Script to recreate database tables with correct MySQL structure
This fixes the autoincrement issues and table constraints.
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Load environment variables
load_dotenv()

def recreate_tables():
    """Drop and recreate all tables with correct structure"""
    try:
        # Create engine
        engine = create_engine(
            f"mysql+pymysql://{os.getenv('DB_USER', 'user')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', '127.0.0.1')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'campus_smartphone_addiction')}",
            pool_pre_ping=True,
            echo=True  # Show SQL for debugging
        )

        with engine.begin() as connection:
            print("Dropping existing tables...")

            # Drop tables in reverse dependency order
            tables_to_drop = [
                "user_responses",
                "user_chats",
                "users",
                "questions"
            ]

            for table in tables_to_drop:
                try:
                    connection.execute(text(f"DROP TABLE IF EXISTS `{table}`"))
                    print(f"   Dropped table: {table}")
                except Exception as e:
                    print(f"   Could not drop {table}: {e}")

            print("All tables dropped successfully!")

            print("\nRecreating tables with correct structure...")

            # Create questions table
            connection.execute(text("""
                CREATE TABLE questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    text VARCHAR(500) UNIQUE NOT NULL,
                    INDEX idx_text (text)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """))
            print("   Created table: questions")

            # Create users table
            connection.execute(text("""
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usercode VARCHAR(50) UNIQUE NOT NULL,
                    age VARCHAR(10),
                    gender VARCHAR(20),
                    country VARCHAR(100),
                    education VARCHAR(50),
                    field VARCHAR(100),
                    yearsOfStudy VARCHAR(10),
                    INDEX idx_usercode (usercode)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """))
            print("  Created table: users")

            # Create user_responses table
            connection.execute(text("""
                CREATE TABLE user_responses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    question_id INT NOT NULL,
                    answer INT NOT NULL,
                    chat_history TEXT,
                    usercode VARCHAR(50) NOT NULL,
                    INDEX idx_question_id (question_id),
                    INDEX idx_usercode (usercode),
                    FOREIGN KEY (usercode) REFERENCES users(usercode) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """))
            print("  Created table: user_responses")

            # Create user_chats table
            connection.execute(text("""
                CREATE TABLE user_chats (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_message TEXT,
                    ai_response TEXT,
                    timestamp INT
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """))
            print("  Created table: user_chats")

            print("\nAll tables recreated successfully!")

            # Insert some sample questions
            print("\nInserting sample questions...")
            sample_questions = [
                "Missing planned work due to smartphone use",
                "Having a hard time concentrating in class, while doing assignments, or while working due to smartphone use",
                "Feeling pain in the wrists or at the back of the neck while using a smartphone",
                "Won't be able to stand not having a smartphone",
                "Feeling impatient and fretful (ill-tempered) when I am not holding my smartphone",
                "Having my smartphone in my mind even when I am not using it",
                "I will never give up using my smartphone even when my daily life is already greatly affected by it",
                "Constantly checking my smartphone so as not to miss conversations between other people on Twitter or Facebook",
                "Using my smartphone longer than I had intended",
                "The people around me tell me that I use my smartphone too much"
            ]

            for i, question_text in enumerate(sample_questions, 1):
                connection.execute(text("""
                    INSERT INTO questions (id, text) VALUES (:id, :text)
                """), {"id": i, "text": question_text})
                print(f"   Added question {i}: {question_text[:50]}...")

            print(f"Inserted {len(sample_questions)} sample questions!")

            return True

    except Exception as e:
        print(f"Error recreating tables: {e}")
        return False

def main():
    print("Recreating Database Tables for MySQL...")
    print("=" * 50)

    if recreate_tables():
        print("\nTable recreation completed successfully!")
        print("Next steps:")
        print("   1. Restart your FastAPI server: uvicorn app.main:app --reload")
        print("   2. Try registering a new user again")
        print("   3. The autoincrement issue should be resolved")
        return True
    else:
        print("\nTable recreation failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
