from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
app.config['SECRET_KEY'] = 'VTB-secret-key-2025'  # Change this in production

db = SQLAlchemy(app)
mail = Mail(app)
CORS(app)

from routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Initialize admin user
        from routes import init_admin
        init_admin()
    app.run(debug=True)
