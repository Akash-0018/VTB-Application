from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
import traceback

# Import extensions first
from extensions import app, db

# Enable CORS for React frontend
CORS(app, supports_credentials=True)

# Configure CORS parameters
app.config['CORS_HEADERS'] = 'Content-Type'

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin and origin == 'http://localhost:3000':
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Import and register blueprints
from admin_routes import admin_routes
from activity_routes import activity_routes
from payment_blueprint import payment_routes

app.register_blueprint(admin_routes, url_prefix='/api/admin')
app.register_blueprint(activity_routes, url_prefix='/api')
app.register_blueprint(payment_routes, url_prefix='/api')

# Import routes after blueprint registration
try:
    from routes import *
    print("Routes imported successfully")
except Exception as e:
    print(f"Error importing routes: {e}")
    traceback.print_exc()

# Enhanced error handlers to ensure JSON responses
@app.errorhandler(HTTPException)
def handle_http_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    return jsonify({
        "error": e.name,
        "message": e.description,
        "code": e.code
    }), e.code

@app.errorhandler(500)
def handle_internal_error(e):
    """Handle 500 errors with detailed logging."""
    db.session.rollback()
    print(f"500 Error: {str(e)}")
    print(f"Traceback: {traceback.format_exc()}")
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on the server"
    }), 500

@app.errorhandler(404)
def handle_not_found(e):
    """Handle 404 errors with JSON response."""
    return jsonify({
        "error": "Not found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(400)
def handle_bad_request(e):
    """Handle 400 errors with JSON response."""
    return jsonify({
        "error": "Bad request",
        "message": "Invalid request data"
    }), 400

@app.errorhandler(401)
def handle_unauthorized(e):
    """Handle 401 errors with JSON response."""
    return jsonify({
        "error": "Unauthorized",
        "message": "Authentication required"
    }), 401

@app.errorhandler(403)
def handle_forbidden(e):
    """Handle 403 errors with JSON response."""
    return jsonify({
        "error": "Forbidden",
        "message": "Access denied"
    }), 403

# Add a health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "TurfZone backend server is running properly",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            # Initialize admin user
            from routes import init_admin
            init_admin()
            print("✅ Database initialized successfully")
            print("✅ Admin user created/verified")
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            traceback.print_exc()
    
    print("🚀 Starting TurfZone Flask server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔄 Debug mode: ON")
    app.run(debug=True, host='0.0.0.0', port=5000)
