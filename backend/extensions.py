from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS
from config import Config

# Create the Flask application
app = Flask(__name__)
app.config.from_object(Config)
app.config['SECRET_KEY'] = 'VTB-secret-key-2025'  # Change this in production

# Create extensions instances
db = SQLAlchemy()
mail = Mail()

# Initialize extensions without app context
db.init_app(app)
mail.init_app(app)
CORS(app)
