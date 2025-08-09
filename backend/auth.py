from functools import wraps
from flask import jsonify, request, g
import jwt
from datetime import datetime, timedelta
from extensions import app, db
from models import User

def create_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print("🔒 Checking authentication token...")
        token = request.headers.get('Authorization')
        if not token:
            print("❌ No token found in Authorization header")
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            print(f"🔑 Processing token: {token[:15]}...")
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            print(f"👤 Decoded user_id: {data.get('user_id')}")
            user = User.query.get(data['user_id'])
            if not user:
                print(f"❌ User {data.get('user_id')} not found in database")
                return jsonify({'message': 'User not found'}), 401
            print(f"✅ User authenticated: {user.username} (admin: {user.is_admin})")
            # Set both g.user and g.current_user for compatibility
            g.user = user
            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': str(e)}), 401
        
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if not g.user.is_admin:
            return jsonify({'message': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated
