# Campus Smartphone Addiction Backend

This unified README provides a step-by-step guide for setting up, managing, and maintaining the backend of the Campus Smartphone Addiction project. It combines database setup, question management, and timestamp migration instructions.

---

## 1. Prerequisites

- **MySQL Server** installed and running (locally or via Docker)
- **Python 3.7+** with pip
- (Optional) **MySQL Workbench** for manual DB management

---

## 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## 3. Configure Database Connection

1. Copy the configuration template:
   ```bash
   cp database_config.env .env
   ```
2. Edit the `.env` file with your MySQL credentials:
   ```env
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_HOST=127.0.0.1  # Use 'mysql' if running backend in Docker Compose
   DB_PORT=3306
   DB_NAME=campus_smartphone_addiction
   ```

---

## 4. Create Database and Tables

1. Run the setup script to create the database (if it doesn't exist):
   ```bash
   python setup_database.py
   ```
2. Recreate all tables with the correct schema:
   ```bash
   python recreate_tables.py
   ```

---

## 5. Question Management

- **Questions are stored in `questions_config.json` and auto-synced to the database on server startup.**

### Manage Questions
- Use the management script (recommended):
  ```bash
  python manage_questions.py
  ```
- Or edit `questions_config.json` directly.
- Or use API endpoints:
  - `GET /questions/config` (view config)
  - `POST /questions/reload` (reload config)

---

## 6. Timestamp Migration (if upgrading from older version)

If your `user_responses` table does not have a `timestamp` column:
1. Run the migration script:
   ```bash
   python add_timestamp_column.py
   ```
2. Restart the backend server.

---

## 7. Start the Backend Server

```bash
uvicorn app.main:app --reload
```

---

## 8. API Endpoints for User Responses

- `POST /submit_survey` — Submit survey answers (creates new responses with timestamps)
- `GET /user_responses/{usercode}` — Get all responses for a user (with timestamps)
- `GET /user_latest_responses/{usercode}` — Get the latest response for each question for a user

---

## 9. Troubleshooting

- **Access denied for user**: Check your MySQL credentials
- **Can't connect to MySQL server**: Ensure MySQL is running and `DB_HOST` is correct
- **Unknown database**: Run `python setup_database.py` first
- **ModuleNotFoundError**: Run `pip install -r requirements.txt`

---

## 10. Manual Database Creation (Alternative)

If setup scripts fail, create the database manually in MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS campus_smartphone_addiction 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 11. Notes

- Never commit your `.env` file to version control
- Use strong passwords for production
- Enable SSL for production MySQL connections
- Questions are auto-synced from config on server start
- Each survey submission creates new response records with timestamps

---

## 12. Example Workflow

1. Install dependencies
2. Configure `.env`
3. Run `python setup_database.py`
4. Run `python recreate_tables.py`
5. Manage questions as needed
6. (If needed) Run timestamp migration
7. Start the backend server
8. Use API endpoints for survey and analytics
