# Deployment Guide: KrishiSetu (Render & PythonAnywhere)

> **Stretch Goal**: Deploy KrishiSetu online for remote judge access and cloud demonstration.

---

## 1. Deploy on Render (Recommended - Free Tier)

Render can automatically detect `render.yaml` or you can configure a Manual Web Service:

### Method A: One-Click / Blueprint Deploy
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your `krishisetu` GitHub repo. Render will automatically read `render.yaml`.
5. Click **Apply**. Render will install requirements, run `python db.py` to seed SQLite, and start `gunicorn wsgi:app`.

### Method B: Manual Web Service Setup
1. On Render, click **New +** $\rightarrow$ **Web Service**.
2. Connect your repo and configure:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python db.py`
   - **Start Command**: `gunicorn wsgi:app`
3. Under **Advanced**, add Environment Variables:
   - `SECRET_KEY`: `<your-random-secret-key>`
   - `PYTHON_VERSION`: `3.11.0`
4. Click **Create Web Service**. Your app will be live at `https://krishisetu.onrender.com`.

---

## 2. Deploy on PythonAnywhere

1. Create a free account at [PythonAnywhere](https://www.pythonanywhere.com).
2. Open a **Bash Console** and clone your repo:
   ```bash
   git clone https://github.com/your-username/krishisetu.git
   cd krishisetu
   ```
3. Set up a virtual environment and install dependencies:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 krishi-env
   pip install -r requirements.txt
   python db.py
   ```
4. Go to the **Web** tab in PythonAnywhere:
   - Click **Add a new web app**.
   - Choose **Manual configuration** $\rightarrow$ **Python 3.10**.
   - Under **Virtualenv**, enter the path: `/home/<username>/.virtualenvs/krishi-env`.
   - Under **Code**, set source directory: `/home/<username>/krishisetu`.
5. Edit the **WSGI configuration file** (click the link in the Web tab):
   ```python
   import sys
   import os

   path = '/home/<your-username>/krishisetu'
   if path not in sys.path:
       sys.path.append(path)

   from app import app as application
   ```
6. Click **Reload** to launch your live site.

