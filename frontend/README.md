# SMARTPHONE WIZARD APP

This project is a wizard-style web application designed to capture user inputs about smartphone usage behaviors. It features a chat interface powered by a language model, allowing users to interact and receive feedback on their responses.

## Frontend

The frontend is built using React and provides a user-friendly interface for navigating through questions related to smartphone usage. It includes the following components:

- **App.js**: The main component that manages the state and flow of the wizard interface.
- **WizardStep.js**: Displays the current question and allows users to input their answers using a slider.
- **LLMChatBox.js**: Handles the chat interface with the language model, displaying the conversation and allowing users to send messages.
- **API Integration**: The frontend communicates with the backend through API calls defined in `src/api/index.js`.

### Setup Instructions

1. **Install Dependencies**: Navigate to the `frontend` directory and run:
   ```
   npm install
   ```

2. **Run the Application**: Start the development server with:
   ```
   npm start
   ```

3. **Access the Application**: Open your browser and go to `http://localhost:3000` to view the application.

## Backend

The backend is built using FastAPI (or Flask) and is responsible for handling data storage and retrieval. It includes the following files:

- **main.py**: Entry point of the application, setting up routes and middleware.
- **models.py**: Defines the database models using an ORM.
- **schemas.py**: Contains Pydantic schemas for data validation and serialization.
- **crud.py**: Functions for creating, reading, updating, and deleting records in the database.
- **database.py**: Sets up the database connection and session management.

### Setup Instructions

1. **Install Dependencies**: Navigate to the `backend` directory and run:
   ```
   pip install -r requirements.txt
   ```

2. **Run the Application**: Start the backend server with:
   ```
   uvicorn app.main:app --reload
   ```

3. **Access the API**: The API will be available at `http://localhost:8000`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.