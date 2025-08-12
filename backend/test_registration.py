#!/usr/bin/env python3
"""
Simple test script to verify user registration works
"""

import requests
import json

def test_registration():
    """Test the user registration endpoint"""
    
    # Test user data
    test_user = {
        "age": "25",
        "gender": "Female", 
        "country": "Finland",
        "education": "Masters",
        "field": "Computer Science",
        "yearsOfStudy": "2"
    }
    
    print(" Testing User Registration")
    print("=" * 40)
    
    try:
        # Test registration
        print(" Sending registration request...")
        response = requests.post(
            "http://127.0.0.1:8000/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        print(f" Response status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f" Registration successful!")
            print(f"   User ID: {user_data.get('id')}")
            print(f"   Usercode: {user_data.get('usercode')}")
            print(f"   Age: {user_data.get('age')}")
            print(f"   Gender: {user_data.get('gender')}")
            return True
        else:
            print(f" Registration failed!")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(" Server not running!")
        print(" Start server with: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f" Test error: {e}")
        return False

def test_questions():
    """Test if questions are available"""
    
    print("\n Testing Questions Endpoint")
    print("=" * 40)
    
    try:
        response = requests.get("http://127.0.0.1:8000/questions")
        
        if response.status_code == 200:
            questions = response.json()
            print(f" Questions loaded: {len(questions)} questions")
            for i, q in enumerate(questions[:3], 1):
                print(f"   {i}. {q['text'][:60]}...")
            if len(questions) > 3:
                print(f"   ... and {len(questions) - 3} more")
            return True
        else:
            print(f" Questions failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f" Questions test error: {e}")
        return False

if __name__ == "__main__":
    print(" Testing Campus Smartphone Addiction System")
    print("=" * 50)
    
    # Test 1: Registration
    reg_success = test_registration()
    
    # Test 2: Questions
    questions_success = test_questions()
    
    print("\n" + "=" * 50)
    if reg_success and questions_success:
        print(" All tests passed! System is working correctly!")
    else:
        print("  Some tests failed. Check the errors above.")
