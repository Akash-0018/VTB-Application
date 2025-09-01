from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from extensions import db
from models import User, Booking, Testimonial, ActivityLog, TurfConfig
from auth import token_required
import random
from sqlalchemy import func
from flask_cors import cross_origin

activity_routes = Blueprint('activity', __name__)

# Mock data for fallback
mock_activities = [
    {"user": "Rajesh Kumar", "action": "booked Football Turf for 6:00 PM", "sport": "Football"},
    {"user": "Team Eagles", "action": "reserved Cricket Ground for weekend", "sport": "Cricket"},
    {"user": "Mumbai Warriors", "action": "confirmed Basketball court booking", "sport": "Basketball"},
    {"user": "Anisha Reddy", "action": "booked Tennis court for tomorrow", "sport": "Tennis"},
    {"user": "Delhi Dynamos", "action": "extended Football booking duration", "sport": "Football"},
    {"user": "Priya Sharma", "action": "booked Cricket nets for practice", "sport": "Cricket"}
]

@activity_routes.route('/live-activity')
def get_live_activity():
    """Get real recent activities from database, fallback to mock data if no real data"""
    try:
        # Try to get real data from database first
        recent_logs = ActivityLog.query.join(User, ActivityLog.user_id == User.id, isouter=True)\
                                      .order_by(ActivityLog.created_at.desc())\
                                      .limit(4).all()
        
        if recent_logs:
            # Use real data from database
            activities = []
            for log in recent_logs:
                activities.append({
                    'user': log.user.name if log.user else 'System',
                    'action': log.action_description,
                    'time': log.get_time_ago(),
                    'sport': log.sport or 'General',
                    'action_type': log.action_type
                })
            
            return jsonify(activities)
    
    except Exception as e:
        print(f"Error fetching real activity data: {e}")
    
    # Fallback to mock data
    activities = []
    for i in range(4):
        activity = random.choice(mock_activities).copy()
        minutes_ago = random.randint(1, 30)
        activity['time'] = f"{minutes_ago} minutes ago"
        activities.append(activity)
    
    return jsonify(activities)

@activity_routes.route('/stats')
def get_stats():
    """Get real statistics from database, fallback to mock data"""
    try:
        # Try to get real stats from database
        total_customers = User.query.filter_by(is_admin=False).count()
        total_bookings = Booking.query.count()
        
        # Calculate average rating from testimonials
        avg_rating = db.session.query(func.avg(Testimonial.rating)).filter_by(is_approved=True).scalar()
        
        # If we have real data, use it
        if total_customers > 0 or total_bookings > 0:
            return jsonify({
                'data_source': 'real',
                'total_customers': total_customers or 1250,
                'total_bookings': total_bookings or 3400,
                'average_rating': round(avg_rating, 1) if avg_rating else 4.8
            })
    
    except Exception as e:
        print(f"Error fetching real stats: {e}")
    
    # Fallback to mock data
    return jsonify({
        'data_source': 'mock',
        'total_customers': 1250,
        'total_bookings': 3400,
        'average_rating': 4.8
    })

@activity_routes.route('/testimonials')
def get_testimonials():
    """Get approved testimonials, prioritizing featured ones"""
    try:
        testimonials = Testimonial.query.join(User)\
                                      .filter(Testimonial.is_approved == True)\
                                      .order_by(Testimonial.is_featured.desc(), 
                                               Testimonial.created_at.desc())\
                                      .limit(6).all()
        
        if testimonials:
            return jsonify([t.to_dict() for t in testimonials])
    
    except Exception as e:
        print(f"Error fetching testimonials: {e}")
    
    # Fallback to mock testimonials
    mock_testimonials = [
        {
            'id': 1,
            'name': 'Rahul Sharma',
            'comment': 'Amazing facility! The turf quality is top-notch and booking is super easy.',
            'rating': 5,
            'sport': 'Football',
            'team_name': 'Victory FC',
            'avatar': 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=2563eb&color=fff'
        },
        {
            'id': 2,
            'name': 'Priya Patel',
            'comment': 'Best cricket ground in the city. Professional management and great atmosphere!',
            'rating': 5,
            'sport': 'Cricket',
            'team_name': 'Mumbai Warriors',
            'avatar': 'https://ui-avatars.com/api/?name=Priya+Patel&background=2563eb&color=fff'
        },
        {
            'id': 3,
            'name': 'Team Eagles',
            'comment': "We've been playing here for 2 years. Highly recommend for serious teams!",
            'rating': 5,
            'sport': 'Basketball',
            'team_name': 'Chennai Eagles',
            'avatar': 'https://ui-avatars.com/api/?name=Team+Eagles&background=2563eb&color=fff'
        }
    ]
    
    return jsonify(mock_testimonials)

@activity_routes.route('/quick-availability')
def get_quick_availability():
    """Get quick availability summary for today, tomorrow, and weekend"""
    try:
        today = datetime.utcnow().date()
        tomorrow = today + timedelta(days=1)
        
        # Get next weekend (Saturday and Sunday)
        days_until_saturday = (5 - today.weekday()) % 7
        if days_until_saturday == 0:  # If today is Saturday
            days_until_saturday = 7
        next_saturday = today + timedelta(days=days_until_saturday)
        
        def get_available_count(date):
            booked_slots = Booking.query.filter(
                Booking.booking_date == date,
                Booking.status.in_(['confirmed', 'pending'])
            ).count()
            return max(0, 8 - booked_slots)
        
        today_available = get_available_count(today)
        tomorrow_available = get_available_count(tomorrow)
        weekend_available = get_available_count(next_saturday)
        
        return jsonify({
            'data_source': 'real',
            'today': {
                'date': today.isoformat(),
                'available_slots': today_available,
                'label': 'Today'
            },
            'tomorrow': {
                'date': tomorrow.isoformat(),
                'available_slots': tomorrow_available,
                'label': 'Tomorrow'
            },
            'weekend': {
                'date': next_saturday.isoformat(),
                'available_slots': weekend_available,
                'label': 'This Weekend'
            }
        })
    
    except Exception as e:
        print(f"Error in get_quick_availability: {e}")
        # Fallback to mock data
        return jsonify({
            'data_source': 'mock',
            'today': {
                'available_slots': 8,
                'label': 'Today'
            },
            'tomorrow': {
                'available_slots': 6,
                'label': 'Tomorrow'
            },
            'weekend': {
                'available_slots': 12,
                'label': 'This Weekend'
            }
        })

@activity_routes.route('/testimonials', methods=['POST'])
@token_required
def create_testimonial(current_user):
    """Allow users to submit testimonials"""
    try:
        data = request.json
        
        # Check if user already has a testimonial for this sport
        existing = Testimonial.query.filter_by(
            user_id=current_user.id,
            sport=data.get('sport')
        ).first()
        
        if existing:
            return jsonify({'error': 'You have already submitted a testimonial for this sport'}), 400
        
        testimonial = Testimonial(
            user_id=current_user.id,
            rating=data.get('rating'),
            comment=data.get('comment'),
            sport=data.get('sport'),
            is_approved=True  # Auto-approve for now
        )
        
        db.session.add(testimonial)
        
        # Log this activity
        activity = ActivityLog(
            user_id=current_user.id,
            action_type='testimonial_created',
            action_description=f'submitted a {data.get("rating")}-star review for {data.get("sport")}',
            sport=data.get('sport')
        )
        db.session.add(activity)
        
        db.session.commit()
        
        return jsonify({'message': 'Testimonial submitted successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to submit testimonial: {str(e)}'}), 500
