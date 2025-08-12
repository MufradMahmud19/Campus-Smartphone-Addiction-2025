#!/usr/bin/env python3
"""
Database Setup Script for Campus Smartphone Addiction Project
This script helps you set up the MySQL database and tables.
"""

import os
import sys
from dotenv import load_dotenv
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Load environment variables
load_dotenv()

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "user"),
            password=os.getenv("DB_PASSWORD", "password"),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database if it doesn't exist
        db_name = os.getenv("DB_NAME", "campus_smartphone_addiction")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Database '{db_name}' created/verified successfully!")
        
        cursor.close()
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def test_connection():
    """Test the database connection"""
    try:
        # Test connection to the specific database
        engine = create_engine(
            f"mysql+pymysql://{os.getenv('DB_USER', 'user')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', '127.0.0.1')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'campus_smartphone_addiction')}",
            pool_pre_ping=True,
            echo=False
        )
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection test successful!")
            return True
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def main():
    print("🚀 Setting up Campus Smartphone Addiction Database...")
    print("=" * 50)
    
    # Check if required environment variables are set
    required_vars = ["DB_USER", "DB_PASSWORD"]
    missing_vars = [var for var in required_vars if not os.getenv(var) or os.getenv(var) == "your_mysql_password_here"]
    
    if missing_vars:
        print("❌ Missing or invalid environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n📝 Please update your .env file with correct database credentials.")
        print("   You can copy database_config.env to .env and modify it.")
        return False
    
    # Create database
    if not create_database():
        return False
    
    # Test connection
    if not test_connection():
        return False
    
    print("\n🎉 Database setup completed successfully!")
    print("📋 Next steps:")
    print("   1. Start your FastAPI server: uvicorn app.main:app --reload")
    print("   2. The server will automatically create the required tables")
    print("   3. Check the console output for any warnings or errors")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
