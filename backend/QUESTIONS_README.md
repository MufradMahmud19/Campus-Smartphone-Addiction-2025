# Question Management System

This system automatically manages your survey questions from a configuration file, eliminating the need to run scripts every time you start the server.

## 🎯 **How It Works**

1. **Questions are stored in `questions_config.json`**
2. **Automatically synced to database on server startup**
3. **No need to run scripts every time**
4. **Easy to modify questions by editing the config file**

## 🚀 **Getting Started**

### **First Time Setup:**
1. **Run the database setup script once:**
   ```bash
   python recreate_tables.py
   ```

2. **Start your server:**
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Questions are automatically loaded!** ✅

## 📝 **Managing Questions**

### **Option 1: Use the Management Script (Recommended)**
```bash
python manage_questions.py
```

This gives you an interactive menu to:
- View all questions
- Add new questions
- Edit existing questions
- Delete questions
- Reorder questions
- Save changes

### **Option 2: Edit Config File Directly**
Edit `questions_config.json` manually:
```json
{
  "questions": [
    {
      "id": 1,
      "text": "Your question text here",
      "category": "productivity",
      "active": true
    }
  ]
}
```

### **Option 3: Use API Endpoints**
- **View config:** `GET /questions/config`
- **Reload config:** `POST /questions/reload`

## 🔄 **Workflow for Changes**

1. **Modify questions** using `python manage_questions.py`
2. **Save changes** to the config file
3. **Restart your server** to apply changes
4. **Questions are automatically synced** to the database

## 📊 **Question Categories**

Available categories for organizing questions:
- `productivity` - Work/study impact
- `academic` - Educational performance
- `physical` - Physical symptoms
- `dependency` - Addiction indicators
- `emotional` - Emotional responses
- `psychological` - Mental state
- `addiction` - Severe addiction signs
- `social` - Social media usage
- `time_management` - Time control
- `social_feedback` - External observations

## 🎨 **Config File Structure**

```json
{
  "questions": [
    {
      "id": 1,
      "text": "Question text here",
      "category": "category_name",
      "active": true
    }
  ],
  "metadata": {
    "version": "1.0",
    "last_updated": "2025-01-27",
    "description": "Description of your question set",
    "total_questions": 10,
    "scale": "1-6 Likert Scale"
  }
}
```

## ✅ **Benefits of This System**

1. **Persistent Storage** - Questions stay in database
2. **Easy Management** - Simple script to modify questions
3. **Version Control** - Config file can be tracked in git
4. **Automatic Sync** - No manual database operations
5. **Development Friendly** - Easy to test different question sets
6. **Production Ready** - Stable question management

## 🚨 **Important Notes**

- **Always restart your server** after modifying questions
- **Backup your config file** before major changes
- **Test changes** in development before production
- **Questions are synced on startup** - no manual intervention needed

## 🔧 **Troubleshooting**

### **Questions not showing up?**
1. Check if server is running
2. Verify config file exists and is valid JSON
3. Check server console for sync messages
4. Restart server to trigger sync

### **Changes not applying?**
1. Make sure you saved the config file
2. Restart the server
3. Check server console for sync status

### **Database errors?**
1. Run `python recreate_tables.py` to reset database
2. Check MySQL connection
3. Verify table structure

## 📱 **API Integration**

Your frontend will automatically get the updated questions when you:
1. Modify the config file
2. Restart the server
3. Questions are synced to database
4. Frontend fetches from `/questions` endpoint

## 🎉 **You're All Set!**

Now you can:
- ✅ **Start server once** - questions load automatically
- ✅ **Modify questions easily** - use the management script
- ✅ **No repeated setup** - questions persist in database
- ✅ **Easy maintenance** - simple config file management

Your survey system is now fully automated and easy to maintain! 🚀
