#!/usr/bin/env python3
"""
Test script to verify database setup and user registration
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test if we can connect to the database"""
    try:
        from app.database import test_connection
        if test_connection():
            print("✅ Database connection successful!")
            return True
        else:
            print("❌ Database connection failed!")
            return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def test_tables_exist():
    """Test if required tables exist"""
    try:
        from app.database import SessionLocal
        from app import models
        
        db = SessionLocal()
        
        # Test questions table
        try:
            questions = db.query(models.Question).first()
            print(f"✅ Questions table exists with {db.query(models.Question).count()} questions")
        except Exception as e:
            print(f"❌ Questions table error: {e}")
            return False
        
        # Test users table
        try:
            users = db.query(models.User).first()
            print(f"✅ Users table exists with {db.query(models.User).count()} users")
        except Exception as e:
            print(f"❌ Users table error: {e}")
            return False
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Table test error: {e}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    try:
        import requests
        
        # Test data
        test_user = {
            "age": "25",
            "gender": "Female",
            "country": "Finland",
            "education": "Masters",
            "field": "Computer Science",
            "yearsOfStudy": "2"
        }
        
        # Try to register user
        response = requests.post(
            "http://127.0.0.1:8000/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ User registration successful! Usercode: {user_data['usercode']}")
            return True
        else:
            print(f"❌ User registration failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Start with: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Registration test error: {e}")
        return False

def main():
    print("🧪 Testing Database Setup and User Registration")
    print("=" * 60)
    
    # Test 1: Database connection
    print("\n1️⃣ Testing database connection...")
    if not test_database_connection():
        print("💡 Make sure MySQL is running and credentials are correct")
        return False
    
    # Test 2: Tables exist
    print("\n2️⃣ Testing database tables...")
    if not test_tables_exist():
        print("💡 Run 'python recreate_tables.py' to create tables")
        return False
    
    # Test 3: User registration
    print("\n3️⃣ Testing user registration...")
    if not test_user_registration():
        print("💡 Make sure server is running: uvicorn app.main:app --reload")
        return False
    
    print("\n🎉 All tests passed! Your system is working correctly!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
