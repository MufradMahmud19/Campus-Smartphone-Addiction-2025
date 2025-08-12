#!/usr/bin/env python3
"""
Question Management Script for Campus Smartphone Addiction Project
This script allows you to easily modify questions in the config file
"""

import json
import os
import sys
from pathlib import Path

CONFIG_FILE = "questions_config.json"

def load_config():
    """Load current questions config"""
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Config file {CONFIG_FILE} not found!")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing config file: {e}")
        return None

def save_config(config_data):
    """Save questions config to file"""
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        print("Config file saved successfully!")
        return True
    except Exception as e:
        print(f"Error saving config file: {e}")
        return False

def display_questions(config_data):
    """Display all current questions"""
    print("\nCurrent Questions:")
    print("=" * 80)
    
    for i, q in enumerate(config_data["questions"], 1):
        status = "ok" if q.get("active", True) else "not ok"
        category = q.get("category", "general")
        print(f"{i:2d}. {status} [{category:15}] {q['text']}")
    
    print(f"\nTotal: {len(config_data['questions'])} questions")
    print(f"Last updated: {config_data.get('metadata', {}).get('last_updated', 'unknown')}")

def add_question(config_data):
    """Add a new question"""
    print("\nAdding new question...")
    
    # Get question details
    text = input("Question text: ").strip()
    if not text:
        print("Question text cannot be empty")
        return False
    
    category = input("Category (productivity/academic/physical/dependency/emotional/psychological/addiction/social/time_management/social_feedback): ").strip()
    if not category:
        category = "general"
    
    # Find next available ID
    existing_ids = [q["id"] for q in config_data["questions"]]
    next_id = max(existing_ids) + 1 if existing_ids else 1
    
    # Create new question
    new_question = {
        "id": next_id,
        "text": text,
        "category": category,
        "active": True
    }
    
    config_data["questions"].append(new_question)
    
    # Update metadata
    config_data["metadata"]["total_questions"] = len(config_data["questions"])
    config_data["metadata"]["last_updated"] = "2025-01-27"  # You can make this dynamic
    
    print(f"Added question {next_id}: {text[:50]}...")
    return True

def edit_question(config_data):
    """Edit an existing question"""
    display_questions(config_data)
    
    try:
        question_num = int(input("\nEnter question number to edit (1-{}): ".format(len(config_data["questions"]))))
        if question_num < 1 or question_num > len(config_data["questions"]):
            print("Invalid question number")
            return False
        
        question = config_data["questions"][question_num - 1]
        print(f"\nEditing question {question_num}: {question['text']}")
        
        # Edit fields
        new_text = input(f"New text (current: {question['text']}): ").strip()
        if new_text:
            question['text'] = new_text
        
        new_category = input(f"New category (current: {question.get('category', 'general')}): ").strip()
        if new_category:
            question['category'] = new_category
        
        # Toggle active status
        toggle = input(f"Toggle active status? (current: {question.get('active', True)}) [y/N]: ").strip().lower()
        if toggle == 'y':
            question['active'] = not question.get('active', True)
        
        print(f"Question {question_num} updated successfully!")
        return True
        
    except ValueError:
        print("Please enter a valid number")
        return False

def delete_question(config_data):
    """Delete a question"""
    display_questions(config_data)
    
    try:
        question_num = int(input("\nEnter question number to delete (1-{}): ".format(len(config_data["questions"]))))
        if question_num < 1 or question_num > len(config_data["questions"]):
            print("Invalid question number")
            return False
        
        question = config_data["questions"][question_num - 1]
        confirm = input(f"Are you sure you want to delete: '{question['text']}'? [y/N]: ").strip().lower()
        
        if confirm == 'y':
            deleted = config_data["questions"].pop(question_num - 1)
            config_data["metadata"]["total_questions"] = len(config_data["questions"])
            print(f"Deleted question: {deleted['text'][:50]}...")
            return True
        else:
            print("Deletion cancelled")
            return False
            
    except ValueError:
        print("Please enter a valid number")
        return False

def reorder_questions(config_data):
    """Reorder questions by ID"""
    print("\nReordering questions...")
    
    # Sort by ID
    config_data["questions"].sort(key=lambda x: x["id"])
    
    # Reassign sequential IDs
    for i, question in enumerate(config_data["questions"], 1):
        question["id"] = i
    
    print("Questions reordered successfully!")
    return True

def main():
    print("Question Management Tool")
    print("=" * 50)
    
    # Load config
    config_data = load_config()
    if not config_data:
        print("Could not load config file. Exiting.")
        sys.exit(1)
    
    while True:
        print("\nOptions:")
        print("1. View all questions")
        print("2. Add new question")
        print("3. Edit question")
        print("4. Delete question")
        print("5. Reorder questions")
        print("6. Save and exit")
        print("7. Exit without saving")
        
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == "1":
            display_questions(config_data)
            
        elif choice == "2":
            if add_question(config_data):
                print("Question added successfully!")
            else:
                print("Failed to add question")
                
        elif choice == "3":
            if edit_question(config_data):
                print("Question updated successfully!")
            else:
                print("Failed to update question")
                
        elif choice == "4":
            if delete_question(config_data):
                print("Question deleted successfully!")
            else:
                print("Failed to delete question")
                
        elif choice == "5":
            if reorder_questions(config_data):
                print("Questions reordered successfully!")
            else:
                print("Failed to reorder questions")
                
        elif choice == "6":
            if save_config(config_data):
                print("Config saved successfully!")
                print("Restart your server to apply changes!")
                break
            else:
                print("Failed to save config")
                
        elif choice == "7":
            print("Exiting without saving changes...")
            break
            
        else:
            print("Invalid choice. Please enter 1-7.")

if __name__ == "__main__":
    main()
