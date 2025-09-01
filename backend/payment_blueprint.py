from flask import Blueprint, request
from payment_routes import calculate_price, initiate_payment, verify_payment
from auth import token_required
from functools import wraps

payment_routes = Blueprint('payment_routes', __name__)

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or 'Bearer' not in auth_header:
            return {'message': 'No token provided'}, 401
        return f(*args, **kwargs)
    return decorated

payment_routes.before_request(auth_required)

payment_routes.add_url_rule('/calculate-price', view_func=calculate_price, methods=['POST'])
payment_routes.add_url_rule('/initiate-payment', view_func=initiate_payment, methods=['POST'])
payment_routes.add_url_rule('/verify-payment', view_func=verify_payment, methods=['POST'])
