from app import db
from models import TurfConfig, TimeSlot
from datetime import datetime, timedelta

def init_sample_data():
    # Clear existing data
    TurfConfig.query.delete()
    TimeSlot.query.delete()
    
    # Create time slots for the next 7 days
    sports = ["Football", "Cricket", "Basketball", "Tennis", "Badminton", "Volleyball"]
    time_slots = [
        ("06:00", "08:00"),
        ("08:00", "10:00"),
        ("10:00", "12:00"),
        ("14:00", "16:00"),
        ("16:00", "18:00"),
        ("18:00", "20:00"),
        ("20:00", "22:00")
    ]
    
    for i in range(7):  # Next 7 days
        date = datetime.now().date() + timedelta(days=i)
        for sport in sports:
            for start, end in time_slots:
                slot = TimeSlot(
                    sport=sport,
                    date=date,
                    start_time=datetime.strptime(start, '%H:%M').time(),
                    end_time=datetime.strptime(end, '%H:%M').time(),
                    is_available=True
                )
                db.session.add(slot)
    
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

    # Sample price details with updated structure
    price_details = {
        "Football": {
            "weekday": 1000,
            "weekend": 1500,
            "hourly": True,
            "available_slots": time_slots,
            "peak_hours": {
                "morning": "06:00-10:00",
                "evening": "16:00-22:00"
            }
        },
        "Cricket": {
            "weekday": 1500,
            "weekend": 2000,
            "hourly": True,
            "available_slots": time_slots,
            "peak_hours": {
                "morning": "06:00-10:00",
                "evening": "16:00-22:00"
            }
        },
        "Basketball": {
            "weekday": 800,
            "weekend": 1200,
            "hourly": True,
            "available_slots": time_slots,
            "peak_hours": {
                "morning": "06:00-10:00",
                "evening": "16:00-22:00"
            }
        },
        "Tennis": {
            "weekday": 600,
            "weekend": 800,
            "hourly": True,
            "available_slots": time_slots,
            "peak_hours": {
                "morning": "06:00-10:00",
                "evening": "16:00-22:00"
            }
        },
        "Badminton": {
            "weekday": 400,
            "weekend": 600,
            "hourly": True,
            "available_slots": time_slots,
            "peak_hours": {
                "morning": "06:00-10:00",
                "evening": "16:00-22:00"
            }
        },
        "Volleyball": {
            "weekday": 800,
            "weekend": 1000,
            "hourly": True,
            "available_slots": time_slots,
            "peak_hours": {
                "morning": "06:00-10:00",
                "evening": "16:00-22:00"
            }
        }
    }

    # Sample special offers with updated structure
    special_offers = [
        {
            "title": "Early Bird Special",
            "description": "20% off on morning slots (6 AM - 10 AM)",
            "discount": 20,
            "valid_until": "2025-12-31",
            "applicable_slots": ["06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00"],
            "applicable_sports": ["Football", "Cricket", "Basketball", "Tennis", "Badminton", "Volleyball"],
            "active": True
        },
        {
            "title": "Weekend Team Package",
            "description": "15% extra discount for team bookings on weekends",
            "discount": 15,
            "valid_until": "2025-12-31",
            "applicable_slots": "all",
            "applicable_sports": ["Football", "Cricket", "Basketball", "Volleyball"],
            "requires_team": True,
            "active": True
        },
        {
            "title": "Night Owl Special",
            "description": "30% off on late night slots (10 PM - 12 AM)",
            "discount": 30,
            "valid_until": "2025-12-31",
            "applicable_slots": ["22:00-23:00", "23:00-00:00"],
            "applicable_sports": ["Football", "Cricket", "Basketball", "Tennis", "Badminton", "Volleyball"],
            "active": True
        },
        {
            "title": "Large Group Discount",
            "description": "25% off for team bookings with 10+ players",
            "discount": 25,
            "valid_until": "2025-12-31",
            "applicable_slots": "all",
            "applicable_sports": ["Football", "Cricket", "Basketball", "Volleyball"],
            "requires_team": True,
            "min_players": 10,
            "active": True
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
