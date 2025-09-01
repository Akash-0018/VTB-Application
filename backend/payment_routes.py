from flask import jsonify, request, g
from extensions import db
from models import TurfConfig, Booking
from datetime import datetime
from auth import token_required

@token_required
def calculate_price():
    """Calculate the price for a booking with applicable discounts"""
    try:
        if not request.is_json:
            return jsonify({'message': 'Missing JSON in request'}), 400

        data = request.json
        print("Received data:", data)  # Debug log

        required_fields = ['sport', 'date', 'timeSlot']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400

        # Get turf configuration for pricing
        turf_config = TurfConfig.query.first()
        if not turf_config:
            return jsonify({'message': 'Turf configuration not found'}), 500

        # Get base price from config based on time and day
        booking_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        time_slot = data['timeSlot'].split(' - ')[0]  # Get start time
        start_time = datetime.strptime(time_slot, '%H:%M').time()

        # Determine if it's a weekend
        is_weekend = booking_date.weekday() >= 5
        price_category = 'weekend' if is_weekend else 'weekday'

        # Get time category
        if start_time.hour < 12:
            time_period = 'morning'
        elif start_time.hour < 16:
            time_period = 'afternoon'
        else:
            time_period = 'evening'

        # Get base price from configuration
        base_price = 1000  # Default price
        if turf_config.price_details and price_category in turf_config.price_details:
            if time_period in turf_config.price_details[price_category]:
                base_price = int(turf_config.price_details[price_category][time_period].split()[0])

        # Calculate discounts
        discounts = []
        final_amount = base_price

        # Early bird discount
        if start_time.hour >= 6 and start_time.hour < 10:
            discount = int(base_price * 0.20)
            discounts.append({
                'name': 'Early Bird Discount',
                'description': '20% off for morning slots',
                'amount': discount
            })
            final_amount -= discount

        # Team booking discount
        if data.get('team'):
            discount = int(base_price * 0.10)
            discounts.append({
                'name': 'Team Booking Discount',
                'description': '10% off for team bookings',
                'amount': discount
            })
            final_amount -= discount

        # Weekend discount
        if is_weekend:
            discount = int(base_price * 0.15)
            discounts.append({
                'name': 'Weekend Special',
                'description': '15% off for weekend bookings',
                'amount': discount
            })
            final_amount -= discount

        return jsonify({
            'basePrice': base_price,
            'discounts': discounts,
            'finalAmount': final_amount,
            'currency': 'INR',
            'upiDetails': {
                'id': 'akashgunasekar585@ybl',
                'name': 'Akash G',
                'merchantCode': 'TURFZONE001'
            }
        })

    except Exception as e:
        print(f"Error in calculate_price: {str(e)}")
        return jsonify({'message': f'Error calculating price: {str(e)}'}), 500
    try:
        data = request.json
        turf_config = TurfConfig.query.first()
        if not turf_config:
            return jsonify({'message': 'Turf configuration not found'}), 500

        # Get base price from config
        price_details = turf_config.price_details
        booking_date = datetime.strptime(data['date'], '%Y-%m-%d')
        start_time = datetime.strptime(data['timeSlot'].split(' - ')[0], '%H:%M').time()

        # Determine if it's a weekend
        is_weekend = booking_date.weekday() >= 5
        price_category = 'weekend' if is_weekend else 'weekday'

        # Determine time of day
        if start_time.hour < 12:
            time_category = 'morning'
        elif start_time.hour < 16:
            time_category = 'afternoon'
        else:
            time_category = 'evening'

        base_price = int(price_details[price_category][time_category].split()[0])  # Extract number from "1000 INR/hour"
        
        # Initialize discounts list
        discounts = []
        final_amount = base_price

        # Apply Early Bird Discount (6 AM - 10 AM)
        if start_time.hour >= 6 and start_time.hour < 10:
            discount_amount = int(base_price * 0.20)  # 20% off
            discounts.append({
                'name': 'Early Bird Discount',
                'description': '20% off on morning slots (6-10 AM)',
                'amount': discount_amount
            })
            final_amount -= discount_amount

        # Apply Weekend Package Discount
        if is_weekend and data.get('team'):  # Team bookings on weekends
            discount_amount = int(base_price * 0.15)  # 15% off
            discounts.append({
                'name': 'Weekend Team Discount',
                'description': '15% off for team bookings on weekends',
                'amount': discount_amount
            })
            final_amount -= discount_amount

        # Apply Late Night Discount (after 10 PM)
        if start_time.hour >= 22:
            discount_amount = int(base_price * 0.30)  # 30% off
            discounts.append({
                'name': 'Night Owl Discount',
                'description': '30% off on late night slots',
                'amount': discount_amount
            })
            final_amount -= discount_amount

        # Apply Group Booking Discount
        if data.get('team'):
            discount_amount = int(base_price * 0.10)  # 10% off
            discounts.append({
                'name': 'Group Booking Discount',
                'description': '10% off for team bookings',
                'amount': discount_amount
            })
            final_amount -= discount_amount

        # Apply any special offers from turf config
        if turf_config.special_offers:
            for offer in turf_config.special_offers:
                if offer.get('active', True):  # Only apply active offers
                    if _is_offer_applicable(offer, data):
                        discount_amount = int(base_price * float(offer.get('discount_percentage', 0)) / 100)
                        discounts.append({
                            'name': offer['title'],
                            'description': offer['description'],
                            'amount': discount_amount
                        })
                        final_amount -= discount_amount

        return jsonify({
            'basePrice': base_price,
            'discounts': discounts,
            'finalAmount': final_amount,
            'currency': 'INR'
        })

    except Exception as e:
        print(f"Error calculating price: {str(e)}")
        return jsonify({'message': f'Error calculating price: {str(e)}'}), 500

@token_required
def initiate_payment():
    """Initiate a UPI payment"""
    try:
        data = request.json
        print("Payment initiation data:", data)  # Debug log

        if 'amount' not in data or 'bookingDetails' not in data:
            return jsonify({'message': 'Missing amount or booking details'}), 400

        amount = data['amount']
        booking_details = data['bookingDetails']

        # UPI Details
        upi_id = 'akashgunasekar585@ybl'  # Your UPI ID
        merchant_name = 'TurfZone'
        transaction_note = f"TurfZone-{booking_details['sport']}-{booking_details['date']}"

        # Create UPI deep links for different apps
        base_upi_link = (
            f"upi://pay?"
            f"pa={upi_id}&"
            f"pn={merchant_name}&"
            f"tn={transaction_note}&"
            f"am={amount}&"
            f"cu=INR"
        )

        gpay_link = f"gpay://upi/pay?pa={upi_id}&pn={merchant_name}&tn={transaction_note}&am={amount}&cu=INR"
        phonepe_link = f"phonepe://pay?pa={upi_id}&pn={merchant_name}&tn={transaction_note}&am={amount}&cu=INR"
        paytm_link = f"paytmmp://pay?pa={upi_id}&pn={merchant_name}&tn={transaction_note}&am={amount}&cu=INR"

        return jsonify({
            'upiLinks': {
                'default': base_upi_link,
                'gpay': gpay_link,
                'phonepe': phonepe_link,
                'paytm': paytm_link
            },
            'merchantDetails': {
                'name': merchant_name,
                'upiId': upi_id,
                'amount': amount,
                'note': transaction_note
            }
        })

    except Exception as e:
        print(f"Error initiating payment: {str(e)}")
        return jsonify({'message': f'Error initiating payment: {str(e)}'}), 500

@token_required
def verify_payment():
    """Verify a payment transaction"""
    try:
        data = request.json
        booking_id = data['bookingId']
        transaction_id = data['transactionId']

        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404

        # Update booking with payment details
        booking.price_details = {
            'amount_paid': data['amount'],
            'transaction_id': transaction_id,
            'payment_time': datetime.utcnow().isoformat(),
            'payment_status': 'completed'
        }
        booking.status = 'confirmed'  # Auto-confirm booking upon successful payment

        db.session.commit()

        return jsonify({
            'message': 'Payment verified successfully',
            'booking': booking.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error verifying payment: {str(e)}")
        return jsonify({'message': f'Error verifying payment: {str(e)}'}), 500

def _is_offer_applicable(offer, booking_data):
    """Helper function to check if a special offer is applicable"""
    try:
        # Check date validity
        if offer.get('valid_until'):
            valid_until = datetime.strptime(offer['valid_until'], '%Y-%m-%d')
            booking_date = datetime.strptime(booking_data['date'], '%Y-%m-%d')
            if booking_date > valid_until:
                return False

        # Check if sport matches
        if offer.get('applicable_sports'):
            if booking_data['sport'] not in offer['applicable_sports']:
                return False

        # Check time slots
        if offer.get('applicable_slots'):
            booking_slot = booking_data['timeSlot'].split(' - ')[0]
            if booking_slot not in offer['applicable_slots']:
                return False

        return True
    except Exception:
        return False  # If there's any error in checking, don't apply the offer
