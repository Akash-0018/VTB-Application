from flask import Blueprint, jsonify, request, send_file
from datetime import datetime, timedelta
import csv
import io
from extensions import db
from models import Booking, TurfConfig
from auth import admin_required, token_required
import pandas as pd


admin_routes = Blueprint('admin_routes_api', __name__)


@admin_routes.route('/turf-config', methods=['GET'])
def get_turf_config():
    config = TurfConfig.query.first()
    if not config:
        return jsonify({'error': 'No configuration found'}), 404
    
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


@admin_routes.route('/booking-stats', methods=['GET'])
@admin_required
def get_booking_stats():
    # Get total bookings
    total_bookings = Booking.query.count()
    
    # Get active bookings (today's bookings)
    today = datetime.utcnow().date()
    active_bookings = Booking.query.filter(
        Booking.booking_date == today,
        Booking.status == 'confirmed'
    ).count()
    
    # Calculate monthly stats for last 6 months
    monthly_stats = []
    now = datetime.utcnow()
    # Start from current month first day
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    for i in range(6):
        # Calculate start and end dates of the month i months ago
        start_date = (current_month_start - timedelta(days=i*30)).replace(day=1)
        if start_date.month == 12:
            end_date = start_date.replace(year=start_date.year + 1, month=1, day=1)
        else:
            end_date = start_date.replace(month=start_date.month + 1, day=1)
        
        bookings = Booking.query.filter(
            Booking.booking_date >= start_date,
            Booking.booking_date < end_date
        ).all()
        
        monthly_stats.append({
            'month': start_date.strftime('%B %Y'),
            'bookings': len(bookings),
            'revenue': sum(
                float(booking.price_details.get('amount', 0)) if booking.price_details else 0
                for booking in bookings
            )
        })
    
    # Get turf images
    config = TurfConfig.query.first()
    turf_images = config.images if config else []
    
    return jsonify({
        'totalBookings': total_bookings,
        'activeBookings': active_bookings,
        'monthlyStats': monthly_stats,
        'turfImages': turf_images
    })


# Report Generation Routes
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
            'Sport': booking.sport,
            'Date': booking.booking_date.strftime('%Y-%m-%d'),
            'Start Time': booking.start_time.strftime('%H:%M'),
            'End Time': booking.end_time.strftime('%H:%M'),
            'Status': booking.status,
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
            'Sport': booking.sport,
            'Date': booking.booking_date.strftime('%Y-%m-%d'),
            'Start Time': booking.start_time.strftime('%H:%M'),
            'End Time': booking.end_time.strftime('%H:%M'),
            'Status': booking.status,
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
