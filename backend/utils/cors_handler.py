from functools import wraps
from flask import request, make_response, current_app

def handle_preflight():
    if request.method == 'OPTIONS':
        response = make_response()
        origin = request.headers.get('Origin', '')
        if origin == 'http://localhost:3000':
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Expose-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '3600'
            })
        return response
    return None

def add_cors_headers(response):
    origin = request.headers.get('Origin', '')
    if origin == 'http://localhost:3000':
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
            'Access-Control-Expose-Headers': 'Content-Type, Authorization'
        })
    return response
