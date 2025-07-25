# SMARTPHONE WIZARD APP BACKEND README

# Smartphone Wizard App - Backend

This is the backend for the Smartphone Wizard App, built using FastAPI (or Flask). It captures user inputs about smartphone usage behaviors and integrates with a chat feature powered by a language model.

## Project Structure

- `app/`: Contains the main application code.
  - `main.py`: Entry point of the application, initializes the app and sets up routes.
  - `models.py`: Defines the database models using an ORM (like SQLAlchemy).
  - `schemas.py`: Defines Pydantic schemas for data validation and serialization.
  - `crud.py`: Contains functions for database operations (create, read, update, delete).
  - `database.py`: Sets up the database connection and session management.

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd smartphone-wizard-app/backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```
   uvicorn app.main:app --reload
   ```

## API Usage

- **Endpoint to submit user answers:**
  - `POST /answers`
  - Request body should match the schema defined in `schemas.py`.

- **Endpoint to retrieve chat responses:**
  - `POST /chat`
  - Request body should include the user's message.

## Database Configuration

Ensure that your database is set up and configured in `database.py`. Update the connection string as necessary.

## License

This project is licensed under the MIT License. See the LICENSE file for details.