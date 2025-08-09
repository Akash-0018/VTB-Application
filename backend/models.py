from extensions import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    team_name = db.Column(db.String(100))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships with proper back_populates
    bookings = db.relationship('Booking', back_populates='user', lazy='dynamic')
    testimonials = db.relationship('Testimonial', back_populates='user', lazy='dynamic')
    activity_logs = db.relationship('ActivityLog', back_populates='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'team_name': self.team_name,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sport = db.Column(db.String(20), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='pending')
    price_details = db.Column(db.JSON)
    notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Fixed relationships
    user = db.relationship('User', back_populates='bookings')
    activity_logs = db.relationship('ActivityLog', back_populates='booking', lazy='dynamic')
    
    def get_time_ago(self):
        """Helper method to get human-readable time difference"""
        if not self.created_at:
            return "Unknown"
        
        time_diff = datetime.utcnow() - self.created_at
        
        if time_diff.days > 0:
            return f"{time_diff.days} days ago"
        elif time_diff.seconds > 3600:
            hours = time_diff.seconds // 3600
            return f"{hours} hours ago"
        elif time_diff.seconds > 60:
            minutes = time_diff.seconds // 60
            return f"{minutes} minutes ago"
        else:
            return "Just now"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'sport': self.sport,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'status': self.status,
            'notes': self.notes,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TurfConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    sports_available = db.Column(db.JSON, nullable=False)
    price_details = db.Column(db.JSON, nullable=False)
    images = db.Column(db.JSON)
    special_offers = db.Column(db.JSON)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    sport = db.Column(db.String(50))
    is_featured = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Fixed relationship
    user = db.relationship('User', back_populates='testimonials')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.user.name if self.user else 'Anonymous',
            'rating': self.rating,
            'comment': self.comment,
            'sport': self.sport,
            'is_featured': self.is_featured,
            'team_name': self.user.team_name if self.user else None,
            'avatar': f"https://ui-avatars.com/api/?name={self.user.name}&background=2563eb&color=fff" if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    action_type = db.Column(db.String(50), nullable=False)
    action_description = db.Column(db.String(200), nullable=False)
    sport = db.Column(db.String(50))
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=True)
    meta_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Fixed relationships
    user = db.relationship('User', back_populates='activity_logs')
    booking = db.relationship('Booking', back_populates='activity_logs')
    
    def get_time_ago(self):
        """Helper method to get human-readable time difference"""
        if not self.created_at:
            return "Unknown"
        
        time_diff = datetime.utcnow() - self.created_at
        
        if time_diff.days > 0:
            return f"{time_diff.days} days ago"
        elif time_diff.seconds > 3600:
            hours = time_diff.seconds // 3600
            return f"{hours} hours ago"
        elif time_diff.seconds > 60:
            minutes = time_diff.seconds // 60
            return f"{minutes} minutes ago"
        else:
            return "Just now"

class SiteStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stat_name = db.Column(db.String(50), unique=True, nullable=False)
    stat_value = db.Column(db.JSON, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
