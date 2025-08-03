from app import db
from models import TurfConfig
from datetime import datetime

def init_sample_data():
    # Clear existing turf config
    TurfConfig.query.delete()
    
    # Sample turf images (using publicly available sports turf images)
    dummy_images = [
        "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",  # Soccer field
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",  # Football turf
        "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800",  # Indoor arena
        "https://images.unsplash.com/photo-1542652184-04fe4ec9d5bb?w=800",  # Basketball court
        "https://images.unsplash.com/photo-1577223625816-7546b31a2995?w=800",  # Tennis court
        "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800",  # Night view
        "https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800",  # Training area
        "https://images.unsplash.com/photo-1550881111-7cfde14d0e17?w=800",     # Sports complex
        "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800",  # Indoor sports
        "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800"   # Modern facility
    ]

    # Sample sports available
    sports = [
        "Football",
        "Cricket",
        "Basketball",
        "Tennis",
        "Badminton",
        "Volleyball"
    ]

    # Time slots available (6 AM to midnight, with lunch break)
    time_slots = [
        {"start": "06:00", "end": "08:00"},
        {"start": "08:00", "end": "10:00"},
        {"start": "10:00", "end": "12:00"},
        {"start": "14:00", "end": "16:00"},  # After 2-hour lunch break
        {"start": "16:00", "end": "18:00"},
        {"start": "18:00", "end": "20:00"},
        {"start": "20:00", "end": "22:00"},
        {"start": "22:00", "end": "00:00"}
    ]

    # Sample special offers
    special_offers = [
        {
            "title": "Early Bird Discount",
            "description": "20% off on morning slots (6 AM - 10 AM)",
            "discount": 20,
            "validUntil": "2025-12-31",
            "applicableSlots": ["06:00-08:00", "08:00-10:00"],
            "terms": ["Valid on all sports", "Must be booked at least 24 hours in advance"]
        },
        {
            "title": "Weekend Package",
            "description": "Book any 3 weekend slots and get 15% off",
            "discount": 15,
            "validUntil": "2025-12-31",
            "applicableSlots": "all-weekend",
            "terms": ["Valid on weekends only", "Must book all 3 slots in the same transaction"]
        },
        {
            "title": "Midnight Madness",
            "description": "30% off on late night slots (10 PM - 12 AM)",
            "discount": 30,
            "validUntil": "2025-12-31",
            "applicableSlots": ["22:00-00:00"],
            "terms": ["Valid all days", "Subject to availability"]
        },
        {
            "title": "Group Booking Offer",
            "description": "Book for a team of 10+ and get 25% off",
            "discount": 25,
            "validUntil": "2025-12-31",
            "applicableSlots": "all",
            "terms": ["Minimum 10 players", "Valid on all slots", "Must show valid ID at entry"]
        }
    ]

    # Sample price details
    price_details = {
        "Football": {
            "weekday": 1000,
            "weekend": 1500,
            "hourly": True,
            "available_slots": time_slots
        },
        "Cricket": {
            "weekday": 1500,
            "weekend": 2000,
            "hourly": True,
            "available_slots": time_slots
        },
        "Basketball": {
            "weekday": 800,
            "weekend": 1200,
            "hourly": True,
            "available_slots": time_slots
        },
        "Tennis": {
            "weekday": 600,
            "weekend": 800,
            "hourly": True
        },
        "Badminton": {
            "weekday": 400,
            "weekend": 600,
            "hourly": True
        },
        "Volleyball": {
            "weekday": 800,
            "weekend": 1000,
            "hourly": True
        }
    }

    # Sample special offers
    special_offers = [
        {
            "title": "Early Bird Discount",
            "description": "20% off on all morning slots (6 AM - 9 AM)",
            "discount": 20,
            "valid_until": "2025-12-31"
        },
        {
            "title": "Weekend Package",
            "description": "Book for 4 hours and get 1 hour free on weekends",
            "discount": "1_hour_free",
            "valid_until": "2025-12-31"
        },
        {
            "title": "Group Booking Offer",
            "description": "15% discount for group bookings (min. 10 people)",
            "discount": 15,
            "valid_until": "2025-12-31"
        }
    ]

    # Create new turf config
    turf_config = TurfConfig(
        name="SportZone Premium Turf",
        details="State-of-the-art sports facility with multiple courts and advanced amenities. "
                "Features include floodlights, changing rooms, parking, and cafeteria.",
        location="123 Sports Complex, Stadium Road, City Center",
        phone="+91 98765 43210",
        email="info@sportzoneturf.com",
        sports_available=sports,
        price_details=price_details,
        images=dummy_images,
        special_offers=special_offers,
        last_updated=datetime.utcnow()
    )

    # Add to database
    db.session.add(turf_config)
    db.session.commit()
    
    print("Sample data initialized successfully!")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        init_sample_data()
