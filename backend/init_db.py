from app import app, db
from models import User, Booking, TurfConfig, Testimonial, ActivityLog
from datetime import datetime, timedelta
import json

def init_db():
    with app.app_context():
        # Drop all tables and recreate them
        db.drop_all()
        db.create_all()

        # Create admin user
        admin = User(
            username='Akash',
            email='admin@sportzone.com',
            name='Akash',
            phone='+91 9843464180',
            team_name='Admin',
            is_admin=True
        )
        admin.set_password('VTB@123!')
        db.session.add(admin)
        db.session.commit()

        # Create regular users for sample data
        users_data = [
            {
                'username': 'john',
                'email': 'john@example.com',
                'name': 'John Smith',
                'phone': '+1234567890',
                'team_name': 'Victory FC'
            },
            {
                'username': 'priya',
                'email': 'priya@example.com',
                'name': 'Priya Sharma',
                'phone': '+9876543210',
                'team_name': 'Mumbai Warriors'
            },
            {
                'username': 'rahul',
                'email': 'rahul@example.com',
                'name': 'Rahul Kumar',
                'phone': '+9123456789',
                'team_name': 'Delhi Dynamos'
            },
            {
                'username': 'anisha',
                'email': 'anisha@example.com',
                'name': 'Anisha Reddy',
                'phone': '+9988776655',
                'team_name': 'Chennai Eagles'
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            user.set_password('password123')
            db.session.add(user)
            users.append(user)
        
        db.session.commit()
        
        # Add sample bookings with price details
        tomorrow = datetime.now() + timedelta(days=1)
        day_after = datetime.now() + timedelta(days=2)
        
        sample_bookings = [
            Booking(
                user_id=users[0].id,
                sport="Football",
                booking_date=tomorrow.date(),
                start_time=datetime.strptime("18:00", "%H:%M").time(),
                end_time=datetime.strptime("19:00", "%H:%M").time(),
                status="confirmed",
                price_details={"amount": 1500, "currency": "INR", "discount": 0},
                notes="Regular weekly booking"
            ),
            Booking(
                user_id=users[1].id,
                sport="Cricket",
                booking_date=day_after.date(),
                start_time=datetime.strptime("16:00", "%H:%M").time(),
                end_time=datetime.strptime("18:00", "%H:%M").time(),
                status="confirmed",
                price_details={"amount": 2000, "currency": "INR", "discount": 300},
                notes="Weekend practice session"
            ),
            Booking(
                user_id=users[2].id,
                sport="Basketball",
                booking_date=tomorrow.date(),
                start_time=datetime.strptime("20:00", "%H:%M").time(),
                end_time=datetime.strptime("21:00", "%H:%M").time(),
                status="pending",
                price_details={"amount": 1200, "currency": "INR", "discount": 0},
                notes="Team practice"
            )
        ]
        
        for booking in sample_bookings:
            db.session.add(booking)
        
        db.session.commit()
        
        # Add sample testimonials
        testimonials_data = [
            {
                'user_id': users[0].id,
                'rating': 5,
                'comment': 'Amazing facility! The turf quality is top-notch and booking is super easy.',
                'sport': 'Football',
                'is_featured': True
            },
            {
                'user_id': users[1].id,
                'rating': 5,
                'comment': 'Best cricket ground in the city. Professional management and great atmosphere!',
                'sport': 'Cricket',
                'is_featured': True
            },
            {
                'user_id': users[2].id,
                'rating': 4,
                'comment': 'Good basketball court with proper lighting. Could use better seating arrangements.',
                'sport': 'Basketball',
                'is_featured': False
            },
            {
                'user_id': users[3].id,
                'rating': 5,
                'comment': 'Excellent tennis courts with well-maintained surfaces. Highly recommended!',
                'sport': 'Tennis',
                'is_featured': True
            }
        ]
        
        for testimonial_data in testimonials_data:
            testimonial = Testimonial(**testimonial_data)
            db.session.add(testimonial)
        
        # Add sample activity logs
        activities_data = [
            {
                'user_id': users[0].id,
                'action_type': 'booking_created',
                'action_description': 'booked Football Turf for 6:00 PM',
                'sport': 'Football',
                'created_at': datetime.utcnow() - timedelta(minutes=2)
            },
            {
                'user_id': users[1].id,
                'action_type': 'booking_confirmed',
                'action_description': 'confirmed Cricket Ground booking for weekend',
                'sport': 'Cricket',
                'created_at': datetime.utcnow() - timedelta(minutes=5)
            },
            {
                'user_id': users[2].id,
                'action_type': 'booking_created',
                'action_description': 'booked Basketball court for practice',
                'sport': 'Basketball',
                'created_at': datetime.utcnow() - timedelta(minutes=12)
            },
            {
                'user_id': users[3].id,
                'action_type': 'user_registered',
                'action_description': 'joined TurfZone platform',
                'sport': None,
                'created_at': datetime.utcnow() - timedelta(minutes=18)
            },
            {
                'user_id': users[0].id,
                'action_type': 'testimonial_created',
                'action_description': 'submitted a 5-star review for Football',
                'sport': 'Football',
                'created_at': datetime.utcnow() - timedelta(hours=2)
            }
        ]
        
        for activity_data in activities_data:
            activity = ActivityLog(**activity_data)
            db.session.add(activity)

        # Add initial turf configuration (keeping your existing code)
        turf_config = TurfConfig(
            name="Sport Zone",
            details="A premium turf facility with floodlights and modern amenities",
            location="https://maps.google.com/?q=12.9716,77.5946",
            phone="+91 9876543210",
            email="contact@sportzone.com",
            sports_available=["Football", "Cricket", "Basketball", "Tennis"],
            price_details={
                "weekday": {
                    "morning": "1000",
                    "afternoon": "1200",
                    "evening": "1500"
                },
                "weekend": {
                    "morning": "1200",
                    "afternoon": "1500",
                    "evening": "1800"
                }
            },
            images=[
                "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                "https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80"
            ],
            special_offers=[
                {
                    "title": "Early Bird Offer",
                    "description": "20% off on morning slots",
                    "discount": "20%",
                    "valid_from": "2025-07-01",
                    "valid_until": "2025-08-31"
                }
            ]
        )
        db.session.add(turf_config)
        
        try:
            db.session.commit()
            print("Database initialized successfully with sample data!")
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    init_db()
