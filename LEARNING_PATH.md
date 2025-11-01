# Learning Path System

## Overview
The learning path system provides personalized week-based learning progress for users. Each week unlocks automatically when the previous week is completed.

## Database Structure

### Tables
1. **learning_weeks** - Configuration for each learning week
   - `week_number` - Sequential week identifier (1-6)
   - `title` - Week title (e.g., "Week 1: Kennismaken & oefenen")
   - `description` - Week description
   - `duration` - Estimated time (e.g., "8 min")
   - `level` - Difficulty: Beginner, Intermediate, or Advanced
   - `color` - Tailwind gradient classes for UI
   - `prerequisites` - Array of week numbers that must be completed first

2. **user_learning_progress** - User's progress per week
   - `user_id` - Reference to users table
   - `week_id` - Reference to learning_weeks table
   - `week_number` - Denormalized week number for easy querying
   - `status` - locked | unlocked | in_progress | completed
   - `started_at` - When user started the week
   - `completed_at` - When user completed the week
   - `score` - Quiz score (if applicable)
   - `time_spent` - Minutes spent on the week

3. **quiz_attempts** - History of quiz attempts
   - `user_id` - Reference to users table
   - `week_id` - Reference to learning_weeks table
   - `score` - Points earned
   - `total_questions` - Number of questions in quiz
   - `answers` - JSONB with user's answers
   - `duration` - Time taken in seconds
   - `completed` - Whether quiz was finished

## Automatic Features

### New User Initialization
When a new user is created:
- A trigger automatically creates progress records for all weeks
- Week 1 is unlocked by default
- All other weeks are locked

### Week Unlocking
When a user completes a week:
- A trigger checks if all prerequisites for the next week are met
- If yes, the next week is automatically unlocked
- This allows for both linear (1→2→3) and complex prerequisites

### API Fallback
If a user somehow doesn't have progress records:
- The API endpoint `/api/learning/progress/:userId` detects this
- It automatically initializes progress for that user
- Returns the newly created progress

## API Endpoints

### GET `/api/learning/progress/:userId`
Returns user's complete learning progress:
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "week_id": "uuid",
        "week_number": 1,
        "status": "unlocked",
        "week": {
          "id": "uuid",
          "week_number": 1,
          "title": "Week 1: Kennismaken & oefenen",
          "description": "...",
          "duration": "8 min",
          "level": "Beginner",
          "color": "from-blue-500 to-indigo-600"
        }
      }
    ],
    "attempts": [],
    "statistics": {
      "completedCount": 0,
      "availableCount": 1,
      "totalMinutes": 0
    }
  }
}
```

### GET `/api/learning/weeks`
Returns all available learning weeks

### PUT `/api/learning/progress/:userId/:weekId`
Update progress for a specific week:
```json
{
  "status": "completed",
  "score": 85,
  "timeSpent": 10
}
```

### POST `/api/learning/quiz-attempt`
Record a quiz attempt:
```json
{
  "userId": "uuid",
  "weekId": "uuid",
  "weekNumber": 1,
  "score": 8,
  "totalQuestions": 10,
  "answers": { ... },
  "duration": 480
}
```

### GET `/api/learning/statistics/:userId`
Get user's learning statistics only

## Frontend Usage

The `LearningPath.tsx` page:
1. Loads user progress on mount
2. Displays weeks with proper locked/unlocked states
3. Shows personalized statistics
4. Handles empty states gracefully
5. Logs extensively for debugging

### Console Debugging
When viewing the Learning Path page, check console for:
- "Loading progress for user: [uuid]"
- "API Response: ..."
- "Progress data: ..."
- "Mapped quizzes: ..."

This helps diagnose any data loading issues.

## Troubleshooting

### New users see 0 weeks
1. Check console logs for errors
2. Verify learning_weeks table has 6 rows
3. Check if user_learning_progress table has rows for that user
4. API should auto-initialize if missing

### Weeks not unlocking after completion
1. Check trigger `trigger_unlock_next_week` exists
2. Verify prerequisites are correctly set in learning_weeks
3. Check user_learning_progress status is actually 'completed'

### Statistics show 0 for everything
1. Verify user has progress records
2. Check status values are correct ('unlocked', 'completed', etc.)
3. Ensure time_spent is being recorded

## Adding New Weeks

To add a new week:
```sql
INSERT INTO public.learning_weeks (
  week_number, title, description, duration, level, color, prerequisites
) VALUES (
  7, 
  'Week 7: Advanced Topics', 
  'Master advanced concepts', 
  '10 min', 
  'Advanced', 
  'from-red-500 to-orange-600', 
  ARRAY[1, 2, 3, 4, 5, 6]
);
```

Then initialize for existing users:
```sql
INSERT INTO public.user_learning_progress (user_id, week_id, week_number, status)
SELECT 
  u.id, 
  lw.id, 
  lw.week_number, 
  'locked'
FROM public.users u
CROSS JOIN public.learning_weeks lw
WHERE lw.week_number = 7
ON CONFLICT (user_id, week_id) DO NOTHING;
```
