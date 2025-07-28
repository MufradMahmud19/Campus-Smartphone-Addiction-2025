# Campus-Smartphone-Addiction-2025/README.md

# Smartphone Wizard App

This project is a web application designed to capture user inputs about smartphone usage behaviors through a wizard-style interface. It incorporates a chat feature powered by a language model and utilizes a Python backend with FastAPI or Flask for data management.

## Project Structure

The project is divided into two main parts: the backend and the frontend.

### Backend

The backend is built using FastAPI or Flask and is responsible for handling API requests, managing the database, and processing user data.

- **app/**
  - `main.py`: Entry point of the application, initializes the app and sets up routes.
  - `models.py`: Defines the database models using an ORM (like SQLAlchemy).
  - `schemas.py`: Defines Pydantic schemas for data validation and serialization.
  - `crud.py`: Contains functions for CRUD operations on the database.
  - `database.py`: Sets up the database connection and session management.
- `requirements.txt`: Lists the dependencies required for the backend application.
- `README.md`: Documentation for the backend, including setup instructions and API usage.

### Frontend

The frontend is built using React and provides the user interface for the wizard and chat features.

- **public/**
  - `index.html`: Main HTML file for the React application.
- **src/**
  - `App.js`: Main component managing the state and flow of the wizard interface.
  - `WizardStep.js`: Component displaying the current question and answer input.
  - `components/LLMChatBox.js`: Component handling the chat interface with the language model.
  - `api/index.js`: Functions for making API calls to the backend.
  - `index.js`: Entry point for the React application.
- `package.json`: Configuration file for npm, listing dependencies and scripts.
- `README.md`: Documentation for the frontend, including setup instructions and usage details.

## Getting Started

### Prerequisites

- Node.js and npm for the frontend
- Python and pip for the backend
- A database (e.g., PostgreSQL, SQLite) for data storage

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd smartphone-wizard-app
   ```

2. Set up the backend:
   - Navigate to the `backend` directory.
   - Install the required packages:
     ```
     pip install -r requirements.txt
     ```

3. Set up the frontend:
   - Navigate to the `frontend` directory.
   - Install the required packages:
     ```
     npm install
     ```

### Running the Application

1. Start the backend server:
   ```
   cd backend/app
   python main.py
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

The application should now be running, and you can access it in your web browser.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
