#!/usr/bin/env python3
"""
Quick script to add all SAS questions to the database
Run this to add all questions at once without prompts
"""

import requests

def add_all_questions():
    """Add all SAS questions to the database"""
    
    questions = [
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
    
    print("📝 Adding all SAS questions to database...")
    print("=" * 50)
    
    success_count = 0
    failed_count = 0
    
    for i, question in enumerate(questions, 1):
        try:
            response = requests.post(
                "http://127.0.0.1:8000/questions",
                json={"text": question},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ {i:2d}. Added: {question[:60]}...")
                success_count += 1
            else:
                print(f"❌ {i:2d}. Failed: {response.status_code} - {response.text}")
                failed_count += 1
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {i:2d}. Connection failed - make sure server is running")
            failed_count += 1
        except Exception as e:
            print(f"❌ {i:2d}. Error: {e}")
            failed_count += 1
    
    print("=" * 50)
    print(f"🎉 Results: {success_count} successful, {failed_count} failed")
    
    if success_count == len(questions):
        print("✅ All questions added successfully!")
        print("📱 Your survey is now ready with proper SAS questions!")
    elif success_count > 0:
        print(f"⚠️  {success_count}/{len(questions)} questions added. Check errors above.")
    else:
        print("❌ No questions were added. Please check your server and database.")

if __name__ == "__main__":
    add_all_questions()
