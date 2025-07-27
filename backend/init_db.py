from app import app, db
from models import User, Booking, TurfConfig
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
        print("Admin user created successfully!")

        # Create regular user for sample bookings
        user = User(
            username='john',
            email='john@example.com',
            name='John Smith',
            phone='+1234567890',
            team_name='Victory FC'
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        
        # Add some sample bookings
        tomorrow = datetime.now() + timedelta(days=1)
        day_after = datetime.now() + timedelta(days=2)
        
        sample_bookings = [
            Booking(
                user_id=user.id,
                sport="Football",
                booking_date=tomorrow.date(),
                start_time=datetime.strptime("18:00", "%H:%M").time(),
                end_time=datetime.strptime("19:00", "%H:%M").time(),
                status="confirmed",
                notes="Regular weekly booking",
                admin_notes="Regular customer, premium member"
            )
        ]
        
        # Add sample bookings
        for booking in sample_bookings:
            db.session.add(booking)
        
        # Add initial turf configuration
        turf_config = TurfConfig(
            name="Sport Zone",
            details="A premium turf facility with floodlights and modern amenities",
            location="https://maps.google.com/?q=12.9716,77.5946",
            phone="+91 9876543210",
            email="contact@sportzone.com",
            sports_available=["Football", "Cricket"],
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
            print("Database initialized successfully!")
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            db.session.rollback()
            print(f"Error initializing database: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    init_db()
