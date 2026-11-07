import os
import sqlite3
from flask import g, current_app
import config

def get_db():
    """Returns the current SQLite database connection for the application context."""
    if "db" not in g:
        db_path = current_app.config.get("DATABASE", config.DATABASE) if current_app else config.DATABASE
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON;")
    return g.db

def close_db(e=None):
    """Closes the active database connection when request context tears down."""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    """Executes a SELECT query and returns list of dictionaries or single dictionary."""
    cur = get_db().execute(query, args)
    rv = [dict(row) for row in cur.fetchall()]
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """Executes an INSERT, UPDATE, or DELETE query and commits transaction."""
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    last_id = cur.lastrowid
    row_count = cur.rowcount
    cur.close()
    return last_id, row_count

def init_db(db_path=None):
    """Initializes tables using schema.sql and loads Kerala sample seed data from seed.sql."""
    target_path = db_path or config.DATABASE
    conn = sqlite3.connect(target_path)
    conn.execute("PRAGMA foreign_keys = ON;")

    schema_file = os.path.join(config.BASE_DIR, "schema.sql")
    seed_file = os.path.join(config.BASE_DIR, "seed.sql")

    if os.path.exists(schema_file):
        with open(schema_file, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        print(f"[DB] Applied schema: {schema_file}")

    if os.path.exists(seed_file):
        with open(seed_file, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        print(f"[DB] Loaded seed data: {seed_file}")

    conn.commit()
    conn.close()
    print(f"[DB] SQLite database initialized successfully at: {target_path}")

if __name__ == "__main__":
    init_db()

