# Timestamp Migration for User Responses

## Overview
This update modifies the user response system to allow multiple responses from the same user by adding timestamps to track when each response was given. Previously, if a user took the survey multiple times, their previous responses would be replaced. Now, each survey submission creates new response records with timestamps.

## Changes Made

### 1. Database Model Changes
- Added `timestamp` column to `UserResponse` model
- Timestamp is automatically set to current UTC time when a response is created
- Column type: `DateTime` with default value `datetime.utcnow`

### 2. API Logic Changes
- Modified `/submit_survey` endpoint to always create new responses instead of updating existing ones
- Removed the "upsert" logic that was replacing previous responses

### 3. New API Endpoints
- `/user_responses/{usercode}` - Get all responses for a user with timestamps
- `/user_latest_responses/{usercode}` - Get the latest response for each question for a user

## Migration Steps

### Step 1: Run the Migration Script
```bash
cd backend
python add_timestamp_column.py
```

This script will:
- Add the `timestamp` column to the existing `user_responses` table
- Set current timestamp for all existing records
- Handle the migration safely (won't run if column already exists)

### Step 2: Restart the Backend Server
After running the migration, restart your FastAPI server to pick up the model changes.

## New Functionality

### Multiple Survey Submissions
Users can now take the survey multiple times:
- Each submission creates new response records
- Previous responses are preserved with their original timestamps
- You can track how a user's answers change over time

### Response History
Use the new endpoints to view response history:

```bash
# Get all responses for a user (ordered by timestamp, newest first)
GET /user_responses/ABC12345

# Get latest response for each question
GET /user_latest_responses/ABC12345
```

### Example Response Format
```json
{
  "usercode": "ABC12345",
  "total_responses": 15,
  "responses": [
    {
      "id": 123,
      "question_id": 1,
      "answer": 4,
      "timestamp": "2024-01-15T10:30:00.123456",
      "chat_history": ""
    },
    {
      "id": 122,
      "question_id": 1,
      "answer": 3,
      "timestamp": "2024-01-10T14:20:00.654321",
      "chat_history": ""
    }
  ]
}
```

## Benefits

1. **Data Preservation**: No more lost survey responses
2. **Trend Analysis**: Track how user responses change over time
3. **Research Value**: Better data for longitudinal studies
4. **User Experience**: Users can retake surveys without losing previous data

## Backward Compatibility
- Existing data is preserved during migration
- All existing endpoints continue to work
- New endpoints are additive and don't break existing functionality

## Testing
After migration, test the following scenarios:
1. User takes survey for the first time
2. Same user takes survey again
3. Verify both responses are stored with different timestamps
4. Use new endpoints to retrieve response history

## Troubleshooting

### Migration Fails
If the migration script fails:
1. Check database connection
2. Ensure you have write permissions to the database
3. Check if the `user_responses` table exists

### Timestamp Issues
If timestamps are not being set:
1. Verify the model changes are applied
2. Check that the server was restarted after model changes
3. Ensure the database column was added successfully

### Performance Considerations
- Large response histories may impact query performance
- Consider adding database indexes on `timestamp` column for better performance
- The `latest_responses` endpoint uses subqueries which may be slower with large datasets
