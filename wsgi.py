"""
KrishiSetu - WSGI Entry Point
For production deployment on Render, PythonAnywhere, or Gunicorn.
"""

from app import app

if __name__ == "__main__":
    app.run()

