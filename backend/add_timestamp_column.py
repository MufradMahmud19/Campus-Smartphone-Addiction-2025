#!/usr/bin/env python3
"""
Script to add timestamp column to existing user_responses table
Run this script to migrate existing data to include timestamps
"""

import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import DATABASE_URL

def add_timestamp_column():
    """Add timestamp column to user_responses table"""
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Check if timestamp column already exists
            result = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'user_responses' 
                AND column_name = 'timestamp'
            """))
            
            if result.fetchone():
                print(" Timestamp column already exists in user_responses table")
                return True
            
            # Add timestamp column
            print("🔧 Adding timestamp column to user_responses table...")
            connection.execute(text("""
                ALTER TABLE user_responses 
                ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """))
            
            # Update existing records with current timestamp
            print(" Updating existing records with current timestamp...")
            connection.execute(text("""
                UPDATE user_responses 
                SET timestamp = CURRENT_TIMESTAMP 
                WHERE timestamp IS NULL
            """))
            
            connection.commit()
            print(" Successfully added timestamp column to user_responses table")
            print(" Updated existing records with current timestamp")
            
    except Exception as e:
        print(f"Error adding timestamp column: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Starting timestamp column migration...")
    success = add_timestamp_column()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        sys.exit(1)
