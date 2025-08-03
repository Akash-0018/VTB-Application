from extensions import app, db

# Import and register blueprints
from admin_routes import admin_routes
app.register_blueprint(admin_routes, url_prefix='/api/admin')

# Import routes after blueprint registration
from routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Initialize admin user
        from routes import init_admin
        init_admin()
    app.run(debug=True)
