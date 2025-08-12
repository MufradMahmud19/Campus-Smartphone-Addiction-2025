#!/usr/bin/env python3
"""
Quick fix for the MySQL database issues
Run this script to fix the autoincrement problem
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    print("Fixing MySQL Database Issues...")
    print("=" * 40)
    
    print("The issue is with MySQL table structure.")
    print("   SQLAlchemy's auto-create doesn't work well with MySQL.")
    print("   We need to recreate the tables manually.")
    
    print("\nRunning table recreation script...")
    
    try:
        # Import and run the recreate_tables function
        from recreate_tables import main as recreate_main
        success = recreate_main()
        
        if success:
            print("\nDatabase fixed successfully!")
            print("Now restart your server and try registering a user again.")
            print("Command: uvicorn app.main:app --reload")
        else:
            print("\nDatabase fix failed. Check the errors above.")
            
    except ImportError:
        print("Could not import recreate_tables.py")
        print("   Make sure the file exists in the same directory.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
