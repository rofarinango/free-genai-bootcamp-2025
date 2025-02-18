# Backend Server Technical Specs

## Business Goal: 

A language learning school wants to build a prototype of learning portal which will act as three things:
    - Inventory of possible vocabulary that can be learned
    - Act as a  Learning record store (LRS), providing correct and wrong score on practice vocabulary
    - A unified launchpad to launch different learning apps

## Technical Requirements
    - The backend will built Python
    - The database will be SQLite3
    - The API will be built using Django
    - The API will always return JSON
    - There will be no authentication or authorization
    - Everything will be treated as a single user

## Directory Structure
```text
backend_django/
│
├── backend_django/               # Main project directory
│   ├── __init__.py               # Package marker
│   ├── settings.py               # Project settings
│   ├── urls.py                   # URL routing
│   ├── wsgi.py                   # WSGI configuration
│   └── asgi.py                   # ASGI configuration (if needed)
│
├── api/                          # API application
│   ├── __init__.py               # Package marker
│   ├── admin.py                  # Admin configuration
│   ├── apps.py                   # Application configuration
│   ├── models.py                 # Database models
│   ├── serializers.py            # Serializers for JSON responses
│   ├── urls.py                   # API URL routing
│   ├── views.py                  # API views
│   └── tests.py                  # Unit tests for the API
│
├── manage.py                     # Django management script
│
├── db.sqlite3                    # SQLite database file
│
└── requirements.txt              # Project dependencies
```

## Database Schema

Our database will be a single sqlite database called `words.db` that will be in the root of the project folder of `backend_django`

We have the following tables:
- words - stored vocabulary words
    - id integer
    - japanese string
    - romaji string
    - english string
    - parts json
- word_groups - join table for words and groups 
many-to-many
    - id integer
    - word_id integer
    - group_id integer
- groups - thematic groups of words
    - id integer
    - name string
- study_sessions - records of study sessions grouping 
word_review_items
    - id integer
    - group_id integer
    - created_at datetime
    - study_activity_id integer
- study_activities - a specific study activity, linking a study session to group
    - id integer
    - study_session_id integer
    - group_id integer
    - created_at datetime
- word_review_items - a record of word practice, determining if the word was correct or not
    - word_id integer
    - study_session_id integer
    - correct boolean
    - created_at datetime

### API Endpoints

#### GET /api/dashboard/last_study_session
Returns information about the most recent study session.

#### JSON Response
```json
{
    "id": 1,
    "group_id": 1,
    "group_name": "Basic Greetings",
    "created_at": "2024-03-20T15:30:00Z",
    "study_activity_id": 1
}
```

#### GET /api/dashboard/study_progress
Returns study progress statistics.
Please note that the frontend will determine progress bar based on total words studied and total available words.

#### JSON Response
```json
{
    "total_words_studied": 15,
    "total_available_words": 124
}
```

#### GET /api/dashboard/quick_stats
Returns quick overview statistics.

#### JSON Response
```json
{
    "success_rate": 80,
    "total_study_sessions": 4,
    "total_active_groups": 3,
    "study_streak_days": 4
}
```

#### GET /api/study_activities
Returns list of available study activities.

#### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "name": "Vocabulary Quiz",
            "thumbnail_url": "path/to/thumbnail.jpg",
            "description": "Practice your vocabulary with flashcards"
        }
    ]
}
```

#### GET /api/study_activities/:id
Returns details of a specific study activity.
```json
{
    "id": 1,
    "name": "Vocabulary Quiz",
    "thumbnail_url": "path/to/thumbnail.jpg",
    "description": "Practice your vocabulary with flashcards"
}
```

#### GET /api/study_activities/:id/study_sessions
Returns paginated list of study sessions for this activity.
```json
{
    "items": [
        {
            "id": 1,
            "activity_name": "Vocabulary Quiz",
            "group_name": "Basic Greetings",
            "start_time": "2024-03-20T15:30:00Z",
            "end_time": "2024-03-20T15:45:00Z",
            "review_items_count": 20
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_items": 100,
        "items_per_page": 20
    }
}
```

#### POST /api/study_activities
Creates a new study activity session.

#### Request Params
- group_id integer
- study_activity_id integer

#### JSON Response
```json
{
    "id": 1,
    "group_id": 1,
}
```

#### GET /api/words
 - pagination with 100 items per page
 #### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "japanese": "こんにちは",
            "romaji": "konnichiwa",
            "english": "hello",
            "correct_count": 10,
            "wrong_count": 2
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 10,
        "total_items": 1000,
        "items_per_page": 100
    }
}
```

#### GET /api/words/:id
Returns details of a specific word.
#### JSON Response
```json
{
    "id": 1,
    "japanese": "こんにちは",
    "romaji": "konnichiwa",
    "english": "hello",
    "correct_count": 10,
    "wrong_count": 2,
    "groups": [
        {
            "id": 1,
            "name": "Basic Greetings"
        }
    ]
}
```

#### GET /api/groups
Returns paginated list of groups.
#### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "name": "Basic Greetings",
            "word_count": 20
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_items": 100,
        "items_per_page": 20
    }
}
```

#### GET /api/groups/:id
Returns details of a specific group.

#### JSON Response  
```json
{
    "id": 1,
    "name": "Basic Greetings",
    "total_word_count": 20,
    "stats": {
        "total_word_count": 20
    }
}
```

#### GET /api/groups/:id/words
Returns words in a specific group.
#### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "japanese": "こんにちは",
            "romaji": "konnichiwa",
            "english": "hello",
            "correct_count": 10,
            "wrong_count": 2
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 10,
        "total_items": 1000,
        "items_per_page": 100
    }
}
```

#### GET /api/groups/:id/study_sessions
Returns study sessions for a specific group.
#### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "activity_name": "Vocabulary Quiz",
            "start_time": "2024-03-20T15:30:00Z",
            "end_time": "2024-03-20T15:45:00Z",
            "review_items_count": 20
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_items": 100,
        "items_per_page": 20
    }
}
```

#### GET /api/study_sessions
Returns paginated list of study sessions.
#### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "activity_name": "Vocabulary Quiz",
            "group_name": "Basic Greetings",
            "start_time": "2024-03-20T15:30:00Z",
            "end_time": "2024-03-20T15:45:00Z",
            "review_items_count": 20
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_items": 100,
        "items_per_page": 20
    }
}
```

#### GET /api/study_sessions/:id
Returns details of a specific study session.
#### JSON Response
```json
{
    "id": 1,
    "activity_name": "Vocabulary Quiz",
    "group_name": "Basic Greetings",
    "start_time": "2024-03-20T15:30:00Z",
    "end_time": "2024-03-20T15:45:00Z",
    "review_items_count": 20
}
```

#### GET /api/study_sessions/:id/words
Returns words reviewed in a specific study session.
#### JSON Response
```json
{
    "items": [
        {
            "id": 1,
            "japanese": "こんにちは",
            "romaji": "konnichiwa",
            "english": "hello",
            "correct": true,
            "reviewed_at": "2024-03-20T15:30:00Z"
        }
    ]
}
```

#### POST /api/reset_history
Resets study history.
#### JSON Response
```json
{
    "success": true,
    "message": "Study history has been reset successfully"
}
```

#### POST /api/full_reset
Resets everything in the database.
#### JSON Response
```json
{
    "success": true,
    "message": "System has been fully reset"
}
```

#### POST /api/study_sessions/:id/words/:word_id/review
Records a word review.

#### Request Params
- id (study_session_id) integer
- word_id integer
- correct boolean

#### JSON Request
```json
{
    "correct": true
}
```

#### JSON Response
```json
{
    "success": true,
    "word_id": 1,
    "study_session_id": 1,
    "correct": true,
    "created_at": "2024-03-20T15:30:00Z"
}
```

## Tasks

Lets list out possible tasks we need for our lang portal.

### Initialize Database
This task will initialize the sqlite database called `words.db`

### Migrate Database
This task will run a series of migrations sql files on the database.

Migrations live in the `migrations` folder.
The migration files will be run in order of their file name.
The file names should look like this:
```sql
0001_init.sql
0002_create_words_table.sql
```

### Seed Data
This task will import json files and transform them into target data for our database.

All seed files live in the `seeds` folder.
All seed files should be loaded.

In our task we should have DSL to specific each seed file and its expected group word name.

#### Example Seed File
```json
[
    {   
        "kanji": "払う",
        "romaji": "harau",
        "english": "to pay",
        "parts": [
        { "kanji": "払", "romaji": ["ha","ra"] },
        { "kanji": "う", "romaji": ["u"] }
        ]
    },
  ...
]
```