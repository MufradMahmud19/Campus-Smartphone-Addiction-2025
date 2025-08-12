# Database Setup Guide for MySQL Workbench

This guide will help you connect your Campus Smartphone Addiction project to MySQL Workbench.

## Prerequisites

1. **MySQL Server** installed and running
2. **MySQL Workbench** installed
3. **Python 3.7+** with pip

## Step 1: Install Required Python Packages

```bash
cd backend
pip install -r requirements.txt
```

## Step 2: Configure Database Connection

1. **Copy the configuration template:**
   ```bash
   cp database_config.env .env
   ```

2. **Edit the `.env` file** with your MySQL credentials:
   ```env
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=campus_smartphone_addiction
   ```

## Step 3: Create Database and Test Connection

Run the setup script:
```bash
python setup_database.py
```

This script will:
- Create the database if it doesn't exist
- Test the connection
- Provide feedback on any issues

## Step 4: Start the Application

```bash
uvicorn app.main:app --reload
```

Check the console output for:
- ✅ Database connection established successfully!
- 📋 Database tables created/verified successfully!

## Troubleshooting Common Issues

### 1. "Access denied for user 'root'@'localhost'"
- **Solution**: Check your MySQL root password
- **Alternative**: Create a new MySQL user with proper privileges

### 2. "Can't connect to MySQL server on '127.0.0.1'"
- **Solution**: Ensure MySQL service is running
- **Check**: `sudo service mysql status` (Linux) or `brew services list` (macOS)

### 3. "Unknown database 'campus_smartphone_addiction'"
- **Solution**: Run `python setup_database.py` first
- **Manual**: Create database in MySQL Workbench

### 4. "ModuleNotFoundError: No module named 'pymysql'"
- **Solution**: Run `pip install -r requirements.txt`

## Manual Database Creation (Alternative)

If the setup script fails, create the database manually in MySQL Workbench:

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run this SQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS campus_smartphone_addiction 
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## Database Schema

The application will automatically create these tables:
- `users` - User demographic information
- `questions` - Survey questions
- `user_responses` - User answers to questions
- `user_chats` - Chat history

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `password` | MySQL password |
| `DB_HOST` | `127.0.0.1` | MySQL host address |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `campus_smartphone_addiction` | Database name |

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for production databases
- Consider using environment-specific configurations
- Enable SSL for production MySQL connections

## Testing the Connection

After setup, test your API endpoints:
```bash
curl http://localhost:8000/
curl http://localhost:8000/questions
```

You should see proper responses without database errors.
