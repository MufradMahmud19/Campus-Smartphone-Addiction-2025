#!/usr/bin/env python3
"""
Script to add questions to the database
Run this to add new survey questions easily
"""

import os
import sys
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def add_question(question_text):
    """Add a single question to the database"""
    try:
        response = requests.post(
            "http://127.0.0.1:8000/questions",
            json={"text": question_text},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print(f"✅ Added question: {question_text[:50]}...")
            return True
        else:
            print(f"❌ Failed to add question: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on http://127.0.0.1:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def add_multiple_questions():
    """Add multiple questions at once"""
    questions = [
        "Missing planned work due to smartphone use",
        "Having a hard time concentrating in class, while doing assignments, or while working due to smartphone use",
        "Feeling pain in the wrists or at the back of the neck while using a smartphone",
        "Won’t be able to stand not having a smartphone",
        "Feeling impatient and fretful (ill-tempered) when I am not holding my smartphone",
        "Having my smartphone in my mind even when I am not using it",
        "I will never give up using my smartphone even when my daily life is already greatly affected by it",
        "Constantly checking my smartphone so as not to miss conversations between other people on Twitter or Facebook",
        "Using my smartphone longer than I had intended",
        "The people around me tell me that I use my smartphone too much"
    ]
    
    print("📝 Adding multiple questions...")
    success_count = 0
    
    for question in questions:
        if add_question(question):
            success_count += 1
    
    print(f"\n🎉 Added {success_count}/{len(questions)} questions successfully!")

def main():
    print("📝 Question Management Tool")
    print("=" * 40)
    
    while True:
        print("\nOptions:")
        print("1. Add single question")
        print("2. Add multiple sample questions")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            question_text = input("Enter question text: ").strip()
            if question_text:
                add_question(question_text)
            else:
                print("❌ Question text cannot be empty")
                
        elif choice == "2":
            add_multiple_questions()
            
        elif choice == "3":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
