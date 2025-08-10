from flask import jsonify, request, g
from extensions import app, db, mail
from models import User, Booking, TurfConfig, Testimonial, ActivityLog, SiteStats, TimeSlot
from flask_mail import Message
from twilio.rest import Client
from datetime import datetime, date, timedelta
from auth import token_required, admin_required, create_token
from sqlalchemy import func

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
    'email': 'admin@sportzone.com',
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

# Activity logging helper function
def log_activity(user_id, action_type, description, sport=None, booking_id=None, meta_data=None):
    """Helper function to log user activities"""
    try:
        activity = ActivityLog(
            user_id=user_id,
            action_type=action_type,
            action_description=description,
            sport=sport,
            booking_id=booking_id,
            meta_data=meta_data
        )
        db.session.add(activity)
        db.session.commit()
    except Exception as e:
        print(f"Error logging activity: {str(e)}")

def get_turf_config_from_db():
    """Helper function to get turf configuration from database"""
    config = TurfConfig.query.first()
    if not config:
        return TURF_CONFIG
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
        'last_updated': config.last_updated.isoformat() if config.last_updated else None
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

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    try:
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

        # Log registration activity
        log_activity(
            user_id=user.id,
            action_type='user_registered',
            description=f"registered as new user",
            meta_data={'registration_method': 'web'}
        )

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
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration error: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(username=data['username']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid username or password'}), 401

        # Log login activity
        log_activity(
            user_id=user.id,
            action_type='user_login',
            description=f"logged into the system",
            meta_data={'login_method': 'web'}
        )

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
    except Exception as e:
        return jsonify({'message': f'Login error: {str(e)}'}), 500

# ============================================================================
# FRONTEND API ENDPOINTS (Main endpoints your frontend needs)
# ============================================================================

@app.route('/api/turf-config', methods=['GET'])
def get_turf_config():
    """Get turf configuration for frontend"""
    try:
        turf = TurfConfig.query.first()
        if not turf:
            # Return default config if no custom config exists
            return jsonify({
                "name": "TurfZone Sports Complex",
                "location": "123 Sports Avenue, Mumbai, Maharashtra - 400001",
                "phone": "+91 9843464180",
                "email": "contact@turfzone.com",
                "sports_available": ["Football", "Cricket", "Basketball", "Tennis"],
                "images": [
                    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
                    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
                    "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800",
                    "https://images.unsplash.com/photo-1542652184-04fe4ec9d5bb?w=800",
                    "https://images.unsplash.com/photo-1577223625816-7546b31a2995?w=800"
                ],
                "special_offers": [
                    {
                        "title": "Weekend Special",
                        "description": "20% off on weekend bookings"
                    },
                    {
                        "title": "Early Bird",
                        "description": "15% off on morning slots (6-10 AM)"
                    },
                    {
                        "title": "Group Booking",
                        "description": "25% off for teams of 10+ players"
                    }
                ]
            }), 200
        
        return jsonify({
            'name': turf.name,
            'location': turf.location,
            'phone': turf.phone,
            'email': turf.email,
            'sports_available': turf.sports_available,
            'images': turf.images or [],
            'special_offers': turf.special_offers or []
        }), 200
    except Exception as e:
        print(f"Error in get_turf_config: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# TURF MANAGEMENT ROUTES
# ============================================================================

@app.route('/api/turf', methods=['GET'])
def get_turf_info():
    """Get turf information including pricing and available sports"""
    try:
        turf = TurfConfig.query.first()
        if not turf:
            return jsonify(TURF_CONFIG)

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
    except Exception as e:
        return jsonify({'message': f'Error fetching turf info: {str(e)}'}), 500

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
            'data': get_turf_config_from_db()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating turf configuration: {str(e)}'}), 500

# ============================================================================
# BOOKING MANAGEMENT ROUTES (FIXED)
# ============================================================================

@app.route('/api/bookings', methods=['GET'])
@admin_required
def get_all_bookings():
    """Get all bookings (admin only) - COMPLETELY FIXED VERSION"""
    try:
        # Use proper join to avoid issues
        bookings = db.session.query(Booking).join(User, Booking.user_id == User.id).order_by(Booking.booking_date.desc()).all()
        
        booking_data = []
        for booking in bookings:
            try:
                booking_dict = {
                    'id': booking.id,
                    'user_id': booking.user_id,
                    'sport': booking.sport,
                    'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
                    'start_time': booking.start_time.strftime('%H:%M') if booking.start_time else None,
                    'end_time': booking.end_time.strftime('%H:%M') if booking.end_time else None,
                    'status': booking.status,
                    'notes': booking.notes,
                    'admin_notes': booking.admin_notes,
                    'created_at': booking.created_at.isoformat() if booking.created_at else None,
                    'updated_at': booking.updated_at.isoformat() if booking.updated_at else None,
                    'user_name': booking.user.name if booking.user else 'Unknown',
                    'user_email': booking.user.email if booking.user else 'Unknown',
                    'user_phone': booking.user.phone if booking.user else 'Unknown',
                    'team_name': booking.user.team_name if booking.user else 'Unknown'
                }
                booking_data.append(booking_dict)
            except Exception as booking_error:
                print(f"Error processing booking {booking.id}: {str(booking_error)}")
                continue
        
        return jsonify({
            "success": True,
            "data": booking_data
        }), 200
    except Exception as e:
        print(f"Error in get_all_bookings: {str(e)}")
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Error fetching bookings",
            "error": str(e)
        }), 500

@app.route('/api/available-slots', methods=['GET'])
def get_available_slots():
    """Get available time slots for a specific date"""
    try:
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({'message': 'Date is required'}), 400
            
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        current_time = datetime.now().time()
        
        # Get sports configuration
        turf_config = TurfConfig.query.first()
        if not turf_config:
            return jsonify({'message': 'Turf configuration not found'}), 500

        # Prepare time slots
        time_slots = [
            {'start': '06:00', 'end': '08:00'},
            {'start': '08:00', 'end': '10:00'},
            {'start': '10:00', 'end': '12:00'},
            {'start': '14:00', 'end': '16:00'},
            {'start': '16:00', 'end': '18:00'},
            {'start': '18:00', 'end': '20:00'},
            {'start': '20:00', 'end': '22:00'}
        ]

        # Get existing bookings for the date
        bookings = Booking.query.filter_by(booking_date=date).all()
        booked_slots = {(booking.start_time.strftime('%H:%M'), booking.end_time.strftime('%H:%M'), booking.sport): True 
                       for booking in bookings if booking.status != 'cancelled'}

        # Format response
        formatted_slots = []
        for slot in time_slots:
            # Skip past slots if date is today
            if date == datetime.now().date():
                slot_start = datetime.strptime(slot['start'], '%H:%M').time()
                if slot_start <= current_time:
                    continue
            
            # Check availability for each sport
            available_sports = []
            for sport in turf_config.sports_available:
                if not booked_slots.get((slot['start'], slot['end'], sport), False):
                    available_sports.append(sport)
            
            if available_sports:  # Only include slot if at least one sport is available
                formatted_slots.append({
                    'start_time': slot['start'],
                    'end_time': slot['end'],
                    'sports': available_sports
                })

        return jsonify(formatted_slots)
    except Exception as e:
        print(f"Error in get_available_slots: {str(e)}")
        return jsonify({'message': f'Error fetching slots: {str(e)}'}), 500

@app.route('/api/bookings', methods=['POST'])
@token_required
def create_booking():
    """Create a new booking with slot validation and email notification"""
    try:
        data = request.json
        current_user = g.user

        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Update user's team_name if provided
        if 'team_name' in data and data['team_name']:
            user.team_name = data['team_name']
            db.session.add(user)

        # Check if slot is available
        slot = TimeSlot.query.filter_by(
            sport=data['sport'],
            date=datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
            is_available=True
        ).first()

        if not slot:
            return jsonify({'message': 'Selected time slot is not available'}), 400

        booking = Booking(
            user_id=current_user.id,
            sport=data['sport'],
            booking_date=datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
            status='pending',
            notes=data.get('notes', '')
        )

        # Mark slot as unavailable
        slot.is_available = False
        slot.booking_id = booking.id

        db.session.add(booking)
        db.session.add(slot)
        db.session.commit()

        # Send email notification to admin
        email_subject = "New Booking Request"
        email_body = f"""
New booking request received from {user.name}

Details:
- Sport: {booking.sport}
- Date: {booking.booking_date.strftime('%Y-%m-%d')}
- Time: {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}
- Team: {user.team_name}
- Contact: {user.phone}
- Email: {user.email}
- Notes: {booking.notes}

Please review and confirm this booking in the admin dashboard.
"""
        send_email(email_subject, email_body)

        # Log the activity
        log_activity(
            user_id=current_user.id,
            action_type='booking_created',
            description=f"booked {data['sport']} turf for {data['start_time']}",
            sport=data['sport'],
            booking_id=booking.id
        )

        # Notifications
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
            'booking': booking.to_dict()
        }), 201

    except ValueError:
        return jsonify({'message': 'Invalid date or time format'}), 400
    except KeyError as e:
        return jsonify({'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating booking: {str(e)}")
        return jsonify({'message': f'Error creating booking: {str(e)}'}), 500

@app.route('/api/bookings/user', methods=['GET'])
@token_required
def get_user_bookings():
    """Get user's bookings"""
    try:
        user = g.user
        bookings = Booking.query.filter_by(user_id=user.id).order_by(Booking.booking_date.desc()).all()
        return jsonify([booking.to_dict() for booking in bookings])
    except Exception as e:
        return jsonify({'message': f'Error fetching bookings: {str(e)}'}), 500

@app.route('/api/bookings/<int:booking_id>/status', methods=['PUT'])
@admin_required
def update_booking_status(booking_id):
    """Update booking status and handle slot availability"""
    try:
        data = request.json
        booking = Booking.query.get_or_404(booking_id)
        old_status = booking.status
        new_status = data['status']
        booking.status = new_status
        booking.admin_notes = data.get('admin_notes', '')

        # Get associated time slot
        slot = TimeSlot.query.filter_by(
            sport=booking.sport,
            date=booking.booking_date,
            start_time=booking.start_time,
            end_time=booking.end_time
        ).first()

        if slot:
            # Update slot availability based on booking status
            if new_status == 'cancelled' or new_status == 'rejected':
                slot.is_available = True
                slot.booking_id = None
            elif new_status == 'confirmed':
                slot.is_available = False
                slot.booking_id = booking.id

        db.session.commit()

        # Send email notification to user
        user = User.query.get(booking.user_id)
        if user:
            email_subject = f"Booking {booking.status.title()}"
            email_body = f"""
Dear {user.name},

Your booking request has been {booking.status}:

Details:
- Sport: {booking.sport}
- Date: {booking.booking_date.strftime('%Y-%m-%d')}
- Time: {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}
- Team: {user.team_name}

{f"Admin Notes: {booking.admin_notes}" if booking.admin_notes else ""}

Thank you for using our service!
"""
            send_email(email_subject, email_body, recipients=[user.email])

        # Log the status change
        log_activity(
            user_id=booking.user_id,
            action_type='booking_status_updated',
            description=f"booking status changed from {old_status} to {booking.status}",
            sport=booking.sport,
            booking_id=booking.id,
            meta_data={'old_status': old_status, 'new_status': booking.status}
        )

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

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def send_whatsapp_message(to_number, message):
    try:
        if not hasattr(app.config, 'TWILIO_ACCOUNT_SID'):
            print("WhatsApp functionality not configured")
            return False
            
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

def send_email(subject, body, recipients=None):
    try:
        if recipients is None:
            recipients = ['akashgunasekar585@gmail.com']
            
        print(f"Sending email to {recipients}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        
        msg = Message(
            subject,
            sender='akashgunasekar585@gmail.com',
            recipients=recipients
        )
        msg.body = body
        mail.send(msg)
        print("Email sent successfully!")
        return True
    except Exception as e:
        print(f"Email Error: {str(e)}")
        print(f"Mail settings: {app.config.get_namespace('MAIL_')}")
        return False
