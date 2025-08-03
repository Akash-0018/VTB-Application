from flask import jsonify, request, g
from extensions import app, db, mail
from models import User, Booking, TurfConfig
from flask_mail import Message
from twilio.rest import Client
from datetime import datetime
from auth import token_required, admin_required, create_token

# Default turf config as a fallback
TURF_CONFIG = {
    'name': 'SportZone Arena',
    'details': '''State-of-the-art turf facility featuring:
    - FIFA-approved artificial grass
    - Professional floodlights for night matches
    - Clean changing rooms and showers
    - Parking space for 50 vehicles
    - Refreshment counter
    - First aid facility''',
    'location': 'https://maps.google.com/?q=12.9716,77.5946',
    'email': 'admin@sportzone.com',  # changed to email for consistency
    'phone': '+1234567890',
    'price_details': {
        'weekday': {
            'morning': '1000 INR/hour',
            'afternoon': '800 INR/hour',
            'evening': '1200 INR/hour'
        },
        'weekend': {
            'morning': '1200 INR/hour',
            'afternoon': '1000 INR/hour',
            'evening': '1500 INR/hour'
        }
    },
    'sports_available': ['Football', 'Cricket'],
    'images': [],
    'special_offers': []
}

def get_turf_config_from_db():
    """Helper function to get turf configuration from database"""
    config = TurfConfig.query.first()
    if not config:
        # Initialize with sample data if no config exists
        from init_sample_data import init_sample_data
        init_sample_data()
        db.session.commit()
        config = TurfConfig.query.first()
    return {
        'id': config.id,
        'name': config.name,
        'details': config.details,
        'location': config.location,
        'phone': config.phone,
        'email': config.email,
        'sports_available': config.sports_available,
        'price_details': config.price_details,
        'images': config.images,
        'special_offers': config.special_offers,
        'last_updated': config.last_updated.isoformat() if config.last_updated else None,
        'price_details': config.price_details,
        'images': config.images,
        'special_offers': config.special_offers
    }

# Initialize admin user
def init_admin():
    admin = User.query.filter_by(username='Akash').first()
    if not admin:
        admin = User(
            username='Akash',
            email='admin@sportzone.com',
            name='Akash',
            phone='+1234567890',
            team_name='Admin',
            is_admin=True
        )
        admin.set_password('VTB@123!')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully!")

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        name=data['name'],
        phone=data['phone'],
        team_name=data.get('team_name', '')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    token = create_token(user.id)
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'team_name': user.team_name,
            'is_admin': user.is_admin
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid username or password'}), 401

    token = create_token(user.id)
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'team_name': user.team_name,
            'is_admin': user.is_admin
        }
    })

# Helper functions
def send_whatsapp_message(to_number, message):
    try:
        client = Client(app.config['TWILIO_ACCOUNT_SID'], app.config['TWILIO_AUTH_TOKEN'])
        msg = client.messages.create(
            from_=f"whatsapp:{app.config['TWILIO_WHATSAPP_NUMBER']}",
            body=message,
            to=f"whatsapp:{to_number}"
        )
        return True
    except Exception as e:
        print(f"WhatsApp Error: {str(e)}")
        return False

def send_email(subject, body):
    try:
        msg = Message(
            subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=[TURF_CONFIG['email']]
        )
        msg.body = body
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email Error: {str(e)}")
        return False

# Routes
@app.route('/api/turf', methods=['GET'])
def get_turf_info():
    """Get turf information including pricing and available sports"""
    turf = TurfConfig.query.first()
    if not turf:
        return jsonify(TURF_CONFIG)  # Return default config if no custom config exists

    return jsonify({
        'name': turf.name,
        'details': turf.details,
        'location': turf.location,
        'phone': turf.phone,
        'email': turf.email,
        'sports_available': turf.sports_available,
        'price_details': turf.price_details,
        'images': turf.images,
        'special_offers': turf.special_offers
    })

@app.route('/api/turf', methods=['PUT'])
@admin_required
def update_turf_info():
    """Update turf information (admin only)"""
    try:
        data = request.json
        required_fields = ['name', 'details', 'location', 'phone', 'email', 'price_details']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400

        price_details = data.get('price_details', {})
        if not isinstance(price_details, dict) or not all(k in price_details for k in ['weekday', 'weekend']):
            return jsonify({'message': 'Invalid price_details structure'}), 400

        turf = TurfConfig.query.first()
        if not turf:
            turf = TurfConfig(
                name=data['name'],
                details=data['details'],
                location=data['location'],
                phone=data['phone'],
                email=data['email'],
                sports_available=data.get('sports_available', []),
                price_details=data['price_details'],
                images=data.get('images', []),
                special_offers=data.get('special_offers', [])
            )
            db.session.add(turf)
        else:
            for field in ['name', 'details', 'location', 'phone', 'email',
                          'sports_available', 'price_details', 'images', 'special_offers']:
                if field in data:
                    setattr(turf, field, data[field])

        db.session.commit()
        return jsonify({
            'message': 'Turf configuration updated successfully',
            'data': {
                'name': turf.name,
                'details': turf.details,
                'location': turf.location,
                'phone': turf.phone,
                'email': turf.email,
                'sports_available': turf.sports_available,
                'price_details': turf.price_details,
                'images': turf.images,
                'special_offers': turf.special_offers
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating turf configuration: {str(e)}'}), 500

@app.route('/api/turf/images', methods=['POST'])
@admin_required
def add_turf_image():
    """Add a new image URL to the turf configuration"""
    try:
        data = request.json
        if not data.get('image_url'):
            return jsonify({'message': 'Image URL is required'}), 400

        turf = TurfConfig.query.first()
        if not turf:
            return jsonify({'message': 'Turf configuration not found'}), 404

        images = turf.images or []
        if data['image_url'] in images:
            return jsonify({'message': 'Image URL already exists'}), 400

        images.append(data['image_url'])
        turf.images = images
        db.session.commit()

        return jsonify({
            'message': 'Image added successfully',
            'data': turf.images
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error adding image: {str(e)}'}), 500

@app.route('/api/turf/images/<int:index>', methods=['DELETE'])
@admin_required
def remove_turf_image(index):
    """Remove an image from the turf configuration"""
    try:
        turf = TurfConfig.query.first()
        if not turf or not turf.images:
            return jsonify({'message': 'Image not found'}), 404

        images = turf.images
        try:
            removed_image = images.pop(index)
            turf.images = images
            db.session.commit()
            return jsonify({
                'message': 'Image removed successfully',
                'data': {
                    'removed': removed_image,
                    'remaining': turf.images
                }
            })
        except IndexError:
            return jsonify({'message': 'Image index out of range'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error removing image: {str(e)}'}), 500

@app.route('/api/bookings/user', methods=['GET'])
@token_required
def get_user_bookings():
    """Get user's bookings"""
    try:
        user = g.user
        bookings = Booking.query.filter_by(user_id=user.id).order_by(Booking.booking_date.desc()).all()
        return jsonify([{
            'id': booking.id,
            'sport': booking.sport,
            'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
            'start_time': booking.start_time.strftime('%H:%M'),
            'end_time': booking.end_time.strftime('%H:%M'),
            'status': booking.status,
            'admin_notes': booking.admin_notes
        } for booking in bookings])
    except Exception as e:
        return jsonify({'message': f'Error fetching bookings: {str(e)}'}), 500

@app.route('/api/turf/offers', methods=['POST'])
@admin_required
def add_special_offer():
    """Add a new special offer"""
    try:
        data = request.json
        required_fields = ['title', 'description', 'discount', 'valid_from', 'valid_until']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400

        try:
            valid_from = datetime.strptime(data['valid_from'], '%Y-%m-%d')
            valid_until = datetime.strptime(data['valid_until'], '%Y-%m-%d')
            if valid_until < valid_from:
                return jsonify({'message': 'Valid until date must be after valid from date'}), 400
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

        turf = TurfConfig.query.first()
        if not turf:
            return jsonify({'message': 'Turf configuration not found'}), 404

        offers = turf.special_offers or []
        new_offer = {
            'title': data['title'],
            'description': data['description'],
            'discount': data['discount'],
            'valid_from': data['valid_from'],
            'valid_until': data['valid_until']
        }
        offers.append(new_offer)
        turf.special_offers = offers
        db.session.commit()

        return jsonify({
            'message': 'Special offer added successfully',
            'data': turf.special_offers
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error adding special offer: {str(e)}'}), 500

@app.route('/api/turf/offers/<int:index>', methods=['DELETE'])
@admin_required
def remove_special_offer(index):
    """Remove a special offer"""
    try:
        turf = TurfConfig.query.first()
        if not turf or not turf.special_offers:
            return jsonify({'message': 'Offer not found'}), 404

        offers = turf.special_offers
        try:
            removed_offer = offers.pop(index)
            turf.special_offers = offers
            db.session.commit()
            return jsonify({
                'message': 'Special offer removed successfully',
                'data': {
                    'removed': removed_offer,
                    'remaining': turf.special_offers
                }
            })
        except IndexError:
            return jsonify({'message': 'Offer index out of range'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error removing special offer: {str(e)}'}), 500

@app.route('/api/bookings', methods=['POST'])
@token_required
def create_booking():
    """Create a new booking"""
    try:
        data = request.json
        current_user = g.user  # Set by token_required

        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Update user's team_name if provided
        if 'team_name' in data and data['team_name']:
            user.team_name = data['team_name']
            db.session.add(user)

        booking = Booking(
            user_id=current_user.id,
            sport=data['sport'],
            booking_date=datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
            status='pending'
        )

        db.session.add(booking)
        db.session.commit()

        # Notifications AFTER commit
        email_subject = "New Turf Booking Request"
        email_body = f"""
        New booking request received:

        Name: {user.name}
        Email: {user.email}
        Phone: {user.phone}
        Team: {user.team_name}
        Sport: {booking.sport}
        Date: {booking.booking_date}
        Time: {booking.start_time} - {booking.end_time}
        """
        send_email(email_subject, email_body)

        whatsapp_message = f"""
        Your booking request at {TURF_CONFIG['name']} has been received!

        Details:
        Date: {booking.booking_date}
        Time: {booking.start_time} - {booking.end_time}
        Sport: {booking.sport}
        Status: Pending confirmation

        We will notify you once your booking is confirmed.
        """
        send_whatsapp_message(user.phone, whatsapp_message)

        return jsonify({
            'message': 'Booking created successfully',
            'booking': {
                'id': booking.id,
                'sport': booking.sport,
                'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
                'start_time': booking.start_time.strftime('%H:%M'),
                'end_time': booking.end_time.strftime('%H:%M'),
                'status': booking.status
            }
        }), 201

    except ValueError:
        return jsonify({'message': 'Invalid date or time format'}), 400
    except KeyError as e:
        return jsonify({'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating booking: {str(e)}'}), 500

@app.route('/api/bookings/<int:booking_id>/status', methods=['PUT'])
@admin_required
def update_booking_status(booking_id):
    """Update booking status"""
    try:
        data = request.json
        booking = Booking.query.get_or_404(booking_id)
        booking.status = data['status']
        booking.admin_notes = data.get('admin_notes', '')
        db.session.commit()

        # Get user info for notification
        user = User.query.get(booking.user_id)
        if user:
            whatsapp_message = f"""
            Your booking at {TURF_CONFIG['name']} has been {booking.status}!

            Details:
            Date: {booking.booking_date}
            Time: {booking.start_time} - {booking.end_time}
            Sport: {booking.sport}

            {f"Note: {booking.admin_notes}" if booking.admin_notes else ""}
            """
            send_whatsapp_message(user.phone, whatsapp_message)

        return jsonify({"message": "Booking status updated successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating booking status: {str(e)}'}), 500

@app.route('/api/bookings', methods=['GET'])
@admin_required
def get_all_bookings():
    """Get all bookings (admin only)"""
    try:
        bookings = Booking.query.join(User).order_by(Booking.booking_date.desc()).all()
        return jsonify([{
            'id': booking.id,
            'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
            'start_time': booking.start_time.strftime('%H:%M'),
            'end_time': booking.end_time.strftime('%H:%M'),
            'sport': booking.sport,
            'status': booking.status,
            'admin_notes': booking.admin_notes,
            'team_name': booking.user.team_name,
            'user_name': booking.user.name,
            'user_email': booking.user.email,
            'user_phone': booking.user.phone
        } for booking in bookings])
    except Exception as e:
        return jsonify({'message': f'Error fetching bookings: {str(e)}'}), 500

@app.route('/api/bookings/date/<date>', methods=['GET'])
def get_bookings_by_date(date):
    """Get all bookings for a specific date"""
    try:
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        bookings = Booking.query.filter_by(booking_date=date_obj).all()
        return jsonify([{
            'id': b.id,
            'name': b.name if hasattr(b, 'name') else 'Unknown',
            'team_name': b.team_name,
            'sport': b.sport,
            'start_time': b.start_time.strftime('%H:%M'),
            'end_time': b.end_time.strftime('%H:%M'),
            'status': b.status
        } for b in bookings])
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

@app.route('/api/bookings/upcoming', methods=['GET'])
def get_upcoming_bookings():
    """Get all upcoming bookings"""
    today = datetime.now().date()
    bookings = Booking.query.filter(
        Booking.booking_date >= today
    ).order_by(Booking.booking_date, Booking.start_time).all()

    result = []
    for b in bookings:
        user = User.query.get(b.user_id)
        result.append({
            'id': b.id,
            'name': user.name if user else 'Unknown',
            'team_name': b.team_name,
            'sport': b.sport,
            'booking_date': b.booking_date.strftime('%Y-%m-%d'),
            'start_time': b.start_time.strftime('%H:%M'),
            'end_time': b.end_time.strftime('%H:%M'),
            'status': b.status,
            'admin_notes': b.admin_notes
        })

    return jsonify(result)
