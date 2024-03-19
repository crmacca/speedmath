<img src="static/images/roundedIcon.png" width="70" align="left" style="margin-right: 20px; margin-bottom: 100px;"/>

# Speedmath
Welcome to the SpeedMath repository. This project was an assessment task, but will remain online as an example of my skills.

## 💻 Deployment Instructions

# 🔨 Development Environment

#### Requirements
- Python 3.10+ (3.12 recommended)
- Django 5.0

#### Step 1: Clone the Repository
```bash
git clone https://github.com/crmacca/speedmath.git
cd speedmath
```

#### Step 2: Database Migrations
Depending on your OS, use the appropriate command to make and apply migrations:
```bash
# For Windows
python manage.py makemigrations
python manage.py migrate

# For macOS/Linux
python3 manage.py makemigrations
python3 manage.py migrate
```

#### Step 3: Change SECRET_KEY
Navigate to `speedmath/settings.py` and update the `SECRET_KEY`:
```python
SECRET_KEY = 'your_new_secret_key'
```
Generate a new key at [Djecrety](https://djecrety.ir/).

#### Step 4: Run the Server
```bash
# For Windows
python manage.py runserver

# For macOS/Linux
python3 manage.py runserver
```
Access the app at `http://127.0.0.1:8000`.

# 🚀 Production Environment

Not supported, production site accessible at https://speedmath.cmcdev.net
