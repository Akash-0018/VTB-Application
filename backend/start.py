from app import app, db
from init_db import init_db
import os

def start_server():
    # Check if database exists and initialize if needed
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'turf.db')
    if not os.path.exists(db_path):
        print("Initializing database...")
        init_db()
    
    # Start the Flask server
    print("Starting server on http://localhost:5000")
    app.run(debug=True, host='localhost', port=5000)

if __name__ == '__main__':
    start_server()
