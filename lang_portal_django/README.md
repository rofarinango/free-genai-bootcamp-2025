# Language Learning Portal

## Overview

This is a backend for the language portal build in the Free GenAI Bootcamp using Django framework.
Model used: gpt-4o-mini

## Images


## Technologies Used

- **Backend**: Django (Python)
- **Database**: SQLite3
- **API**: Django REST Framework

## Installation

### Prerequisites

- Python 3.10 or higher
- Django 5.1.6
- Django REST Framework

### Setup

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd lang_portal_django
   ```

2. **Create a Virtual Environment**:

   ```bash
   pyenv virtualenv 3.10.0 backend
   pyenv activate backend
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations**:

   ```bash
   python manage.py migrate
   ```

5. **Seed the Database** (optional):

   ```bash
   python manage.py seed_data
   ```

6. **Create a Superuser**:

   ```bash
   python manage.py createsuperuser
   ```

7. **Run the Development Server**:

   ```bash
   python manage.py runserver
   ```

8. **Access the Admin Interface**:

   Open your web browser and navigate to `http://127.0.0.1:8000/admin/` to manage your models.

## API Endpoints

- **GET /api/words/**: List all words.
- **GET /api/groups/**: List all groups.
- **GET /api/study_sessions/**: List all study sessions.
- **POST /api/study_activities/**: Create a new study activity session.
