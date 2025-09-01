"""
CORS configuration for Flask application
"""
from functools import wraps
from flask import request, make_response
from flask_cors import cross_origin

def cors_preflight():
    response = make_response()
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '3600'
    })
    return response

def cors_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return cors_preflight()
        
        response = f(*args, **kwargs)
        if isinstance(response, tuple):
            response_obj, status_code = response
        else:
            response_obj, status_code = response, 200

        if not isinstance(response_obj, str):
            response = make_response(response_obj, status_code)
        
        response.headers.update({
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true'
        })
        return response
    
    return decorated_function
