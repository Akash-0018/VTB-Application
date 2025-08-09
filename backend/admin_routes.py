from flask import Blueprint, jsonify, request, send_file, g
from datetime import datetime, timedelta
import csv
import io
from extensions import db
from models import Booking, TurfConfig, User, Testimonial, ActivityLog, SiteStats
from auth import admin_required, token_required
import pandas as pd

admin_routes = Blueprint('admin_routes_api', __name__)

# Your existing routes remain unchanged...
@admin_routes.route('/turf-config', methods=['GET'])
@admin_required  # Add admin check
def get_turf_config():
    print("📝 GET /turf-config endpoint called")
    print(f"🔑 Headers: {dict(request.headers)}")
    print(f"👤 Current user: {g.user.username if hasattr(g, 'user') else 'No user in context'}")
    print(f"🎫 Is admin: {g.user.is_admin if hasattr(g, 'user') else 'Unknown'}")
    
    config = TurfConfig.query.first()
    if not config:
        print("❌ No turf configuration found in database")
        return jsonify({'error': 'No configuration found'}), 404
    print("✅ Found turf configuration")
    
    return jsonify({
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
    })

@admin_routes.route('/turf-config', methods=['PUT'])
@admin_required
def update_turf_config():
    config = TurfConfig.query.first()
    if not config:
        return jsonify({'error': 'No configuration found'}), 404

    data = request.json
    config.name = data.get('name', config.name)
    config.details = data.get('details', config.details)
    config.location = data.get('location', config.location)
    config.phone = data.get('phone', config.phone)
    config.email = data.get('email', config.email)
    config.sports_available = data.get('sports_available', config.sports_available)
    config.price_details = data.get('price_details', config.price_details)
    config.last_updated = datetime.utcnow()

    db.session.commit()
    return jsonify({'message': 'Configuration updated successfully'})

@admin_routes.route('/turf-config/images', methods=['PUT'])
@admin_required
def update_turf_images():
    config = TurfConfig.query.first()
    if not config:
        return jsonify({'error': 'No configuration found'}), 404

    data = request.json
    config.images = data.get('images', [])
    config.last_updated = datetime.utcnow()

    db.session.commit()
    return jsonify({'message': 'Images updated successfully'})

@admin_routes.route('/turf-config/offers', methods=['PUT'])
@admin_required
def update_turf_offers():
    config = TurfConfig.query.first()
    if not config:
        return jsonify({'error': 'No configuration found'}), 404

    data = request.json
    config.special_offers = data.get('special_offers', [])
    config.last_updated = datetime.utcnow()

    db.session.commit()
    return jsonify({'message': 'Special offers updated successfully'})

# ENHANCED BOOKING STATS WITH REAL DATA
@admin_routes.route('/booking-stats', methods=['GET'])
@admin_required
def get_booking_stats():
    # Get total bookings
    total_bookings = Booking.query.count()
    
    # Get active bookings (today's and future confirmed bookings)
    today = datetime.utcnow().date()
    active_bookings = Booking.query.filter(
        Booking.booking_date >= today,
        Booking.status == 'confirmed'
    ).count()
    
    # Calculate monthly revenue for current month
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month_start = (current_month_start + timedelta(days=32)).replace(day=1)
    
    current_month_bookings = Booking.query.filter(
        Booking.booking_date >= current_month_start.date(),
        Booking.booking_date < next_month_start.date(),
        Booking.status == 'confirmed'
    ).all()
    
    monthly_revenue = sum(
        float(booking.price_details.get('amount', 0)) if booking.price_details else 0
        for booking in current_month_bookings
    )
    
    # Calculate monthly stats for last 6 months
    monthly_stats = []
    now = datetime.utcnow()
    
    for i in range(6):
        # Calculate start and end dates of the month i months ago
        if i == 0:
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        if start_date.month == 12:
            end_date = start_date.replace(year=start_date.year + 1, month=1, day=1)
        else:
            end_date = start_date.replace(month=start_date.month + 1, day=1)
        
        bookings = Booking.query.filter(
            Booking.booking_date >= start_date.date(),
            Booking.booking_date < end_date.date()
        ).all()
        
        revenue = sum(
            float(booking.price_details.get('amount', 0)) if booking.price_details else 0
            for booking in bookings
        )
        
        monthly_stats.append({
            'month': start_date.strftime('%B %Y'),
            'bookings': len(bookings),
            'revenue': revenue
        })
    
    # Get turf images
    config = TurfConfig.query.first()
    turf_images = config.images if config else []
    
    return jsonify({
        'totalBookings': total_bookings,
        'activeBookings': active_bookings,
        'monthlyRevenue': monthly_revenue,
        'monthlyStats': monthly_stats,
        'turfImages': turf_images
    })

# NEW ENDPOINTS FOR TESTIMONIALS
@admin_routes.route('/testimonials', methods=['GET'])
@admin_required
def get_all_testimonials():
    testimonials = Testimonial.query.join(User).all()
    
    return jsonify([{
        'id': t.id,
        'user_name': t.user.name,
        'user_team': t.user.team_name,
        'rating': t.rating,
        'comment': t.comment,
        'sport': t.sport,
        'is_featured': t.is_featured,
        'is_approved': t.is_approved,
        'created_at': t.created_at.isoformat()
    } for t in testimonials])

@admin_routes.route('/testimonials/<int:testimonial_id>/feature', methods=['PUT'])
@admin_required
def toggle_testimonial_feature(testimonial_id):
    testimonial = Testimonial.query.get_or_404(testimonial_id)
    testimonial.is_featured = not testimonial.is_featured
    db.session.commit()
    
    return jsonify({
        'message': f'Testimonial {"featured" if testimonial.is_featured else "unfeatured"} successfully',
        'is_featured': testimonial.is_featured
    })

@admin_routes.route('/testimonials/<int:testimonial_id>/approve', methods=['PUT'])
@admin_required
def toggle_testimonial_approval(testimonial_id):
    testimonial = Testimonial.query.get_or_404(testimonial_id)
    testimonial.is_approved = not testimonial.is_approved
    db.session.commit()
    
    return jsonify({
        'message': f'Testimonial {"approved" if testimonial.is_approved else "disapproved"} successfully',
        'is_approved': testimonial.is_approved
    })

# NEW ENDPOINTS FOR ACTIVITY LOGS
@admin_routes.route('/activity-logs', methods=['GET'])
@admin_required
def get_activity_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    logs = ActivityLog.query.join(User, ActivityLog.user_id == User.id, isouter=True)\
                           .order_by(ActivityLog.created_at.desc())\
                           .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'logs': [{
            'id': log.id,
            'user_name': log.user.name if log.user else 'System',
            'action_type': log.action_type,
            'action_description': log.action_description,
            'sport': log.sport,
            'created_at': log.created_at.isoformat(),
            'metadata': log.metadata
        } for log in logs.items],
        'total': logs.total,
        'pages': logs.pages,
        'current_page': page
    })

# Your existing report routes remain unchanged...
@admin_routes.route('/reports/monthly', methods=['GET'])
@admin_required
def get_monthly_report():
    today = datetime.utcnow()
    start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
    
    bookings = Booking.query.filter(
        Booking.booking_date >= start_of_month,
        Booking.booking_date <= end_of_month
    ).all()

    # Convert to pandas DataFrame
    data = []
    for booking in bookings:
        data.append({
            'Booking ID': booking.id,
            'User': booking.user.name if booking.user else '',
            'Sport': booking.sport,
            'Date': booking.booking_date.strftime('%Y-%m-%d'),
            'Start Time': booking.start_time.strftime('%H:%M'),
            'End Time': booking.end_time.strftime('%H:%M'),
            'Status': booking.status,
            'Amount': booking.price_details.get('amount', 0) if booking.price_details else 0,
            'Notes': booking.notes,
            'Admin Notes': booking.admin_notes,
            'Created At': booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'Updated At': booking.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    df = pd.DataFrame(data)

    # Create Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Monthly Report', index=False)
        
        workbook = writer.book
        worksheet = writer.sheets['Monthly Report']
        
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'fg_color': '#D7E4BC',
            'border': 1
        })
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            worksheet.set_column(col_num, col_num, 15)  # set column width
    
    output.seek(0)
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'monthly-report-{today.strftime("%Y-%m")}.xlsx'
    )

@admin_routes.route('/reports/bookings', methods=['GET'])
@admin_required
def get_bookings_report():
    bookings = Booking.query.all()

    data = []
    for booking in bookings:
        data.append({
            'Booking ID': booking.id,
            'User': booking.user.name if booking.user else '',
            'Sport': booking.sport,
            'Date': booking.booking_date.strftime('%Y-%m-%d'),
            'Start Time': booking.start_time.strftime('%H:%M'),
            'End Time': booking.end_time.strftime('%H:%M'),
            'Status': booking.status,
            'Amount': booking.price_details.get('amount', 0) if booking.price_details else 0,
            'Notes': booking.notes,
            'Admin Notes': booking.admin_notes,
            'Created At': booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'Updated At': booking.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Bookings Report', index=False)
        
        workbook = writer.book
        worksheet = writer.sheets['Bookings Report']
        
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'fg_color': '#D7E4BC',
            'border': 1
        })
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            worksheet.set_column(col_num, col_num, 15)
    
    output.seek(0)
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'bookings-report-{datetime.utcnow().strftime("%Y-%m-%d")}.xlsx'
    )

@admin_routes.route('/monthly-report/<month_year>', methods=['GET'])
@admin_required
def get_monthly_report_csv(month_year):
    try:
        # Parse month and year
        month_date = datetime.strptime(month_year, '%B %Y')
        start_date = month_date.replace(day=1)
        if month_date.month == 12:
            end_date = month_date.replace(year=month_date.year + 1, month=1, day=1)
        else:
            end_date = month_date.replace(month=month_date.month + 1, day=1)
        
        bookings = Booking.query.filter(
            Booking.booking_date >= start_date,
            Booking.booking_date < end_date
        ).all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(['Date', 'User', 'Sport', 'Start Time', 'End Time', 'Status', 'Amount'])
        
        # Write booking data
        for booking in bookings:
            writer.writerow([
                booking.booking_date.strftime('%Y-%m-%d'),
                booking.user.username if booking.user else '',
                booking.sport,
                booking.start_time.strftime('%H:%M') if booking.start_time else '',
                booking.end_time.strftime('%H:%M') if booking.end_time else '',
                booking.status,
                booking.price_details.get('amount', 0) if booking.price_details else 0
            ])
        
        # Prepare response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'booking_report_{month_year}.csv'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
