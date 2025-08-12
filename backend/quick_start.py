#!/usr/bin/env python3
"""
Quick Start Script for Campus Smartphone Addiction Project
This script automates the setup process for you.
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Run a command and show progress"""
    print(f"{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"{description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"{description} failed:")
        print(f"   Error: {e.stderr}")
        return False

def check_file_exists(filename):
    """Check if a file exists"""
    return os.path.exists(filename)

def main():
    print("Quick Start for Campus Smartphone Addiction Project")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not check_file_exists("requirements.txt"):
        print("Please run this script from the 'backend' directory")
        return False
    
    # Step 1: Install requirements
    if not run_command("pip install -r requirements.txt", "Installing Python packages"):
        return False
    
    # Step 2: Check for .env file
    if not check_file_exists(".env"):
        if check_file_exists("database_config.env"):
            print("Creating .env file from template...")
            try:
                with open("database_config.env", "r") as src:
                    content = src.read()
                with open(".env", "w") as dst:
                    dst.write(content)
                print(".env file created from template")
                print("IMPORTANT: Please edit .env with your actual MySQL credentials!")
                print("   Then run this script again.")
                return False
            except Exception as e:
                print(f"Error creating .env file: {e}")
                return False
        else:
            print("No .env file found. Please create one with your database credentials.")
            return False
    
    # Step 3: Run database setup
    if not run_command("python setup_database.py", "Setting up database"):
        return False
    
    # Step 4: Start the server
    print("\nSetup completed successfully!")
    print("Starting FastAPI server...")
    print("Your app will be available at: http://localhost:8000")
    print("API docs will be at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 60)
    
    # Start the server
    try:
        subprocess.run("uvicorn app.main:app --reload", shell=True, check=True)
    except KeyboardInterrupt:
        print("\nServer stopped. Goodbye!")
    except Exception as e:
        print(f"\nError starting server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\nSetup failed. Please check the errors above and try again.")
        sys.exit(1)
