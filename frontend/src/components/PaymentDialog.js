import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import QrCodeIcon from '@mui/icons-material/QrCode';

const API_BASE_URL = 'http://localhost:5000/api';

const PaymentDialog = ({ open, onClose, bookingDetails }) => {
  const [loading, setLoading] = useState(true);
  const [priceDetails, setPriceDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && bookingDetails) {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue with payment');
        return;
      }
      fetchPriceDetails();
    }
  }, [open, bookingDetails]);

  const fetchPriceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      // Get start time from time slot
      const [startTime] = bookingDetails.timeSlot.split(' - ');

      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/calculate-price`,
        data: {
          sport: bookingDetails.sport,
          date: bookingDetails.date,
          timeSlot: bookingDetails.timeSlot,
          team: bookingDetails.team,
          start_time: startTime
        },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data) {
        setPriceDetails(response.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching price details:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Error calculating price. Please try again.');
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError('Unable to calculate price. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async (app = 'default') => {
    try {
      // Check for authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      // Create booking first
      const bookingResponse = await axios({
        method: 'post',
        url: `${API_BASE_URL}/bookings`,
        data: {
          sport: bookingDetails.sport,
          booking_date: bookingDetails.date,
          start_time: bookingDetails.timeSlot.split(' - ')[0],
          end_time: bookingDetails.timeSlot.split(' - ')[1],
          team_name: bookingDetails.team,
          notes: bookingDetails.notes,
          payment_details: {
            amount: priceDetails.finalAmount,
            payment_method: 'UPI',
            payment_status: 'pending'
          }
        },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // After booking is created, initiate payment
      const paymentResponse = await axios({
        method: 'post',
        url: `${API_BASE_URL}/initiate-payment`,
        data: {
          bookingDetails: {
            ...bookingDetails,
            bookingId: bookingResponse.data.booking.id
          },
          amount: priceDetails.finalAmount
        },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      const upiLinks = paymentResponse.data.upiLinks;
      const upiURL = upiLinks[app] || upiLinks.default;

      // Store booking ID for verification
      localStorage.setItem('pendingBookingId', bookingResponse.data.booking.id);
      
      // Open UPI app
      window.location.href = upiURL;
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Unable to initiate payment. Please try again.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#2563eb',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <PaymentsIcon />
        Payment Details
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : priceDetails && (
          <Box>
            {/* Booking Summary */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Booking Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Sport"
                    secondary={bookingDetails.sport}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Date"
                    secondary={new Date(bookingDetails.date).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Time Slot"
                    secondary={bookingDetails.timeSlot}
                  />
                </ListItem>
                {bookingDetails.team && (
                  <ListItem>
                    <ListItemText 
                      primary="Team Name"
                      secondary={bookingDetails.team}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>

            {/* Price Breakdown */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon color="primary" />
                Price Breakdown
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Base Price" />
                  <Typography>₹{priceDetails.basePrice}</Typography>
                </ListItem>
                
                {priceDetails.discounts.map((discount, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={discount.name}
                      secondary={`${discount.description}`}
                    />
                    <Typography color="success.main">-₹{discount.amount}</Typography>
                  </ListItem>
                ))}

                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Final Amount
                      </Typography>
                    }
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    ₹{priceDetails.finalAmount}
                  </Typography>
                </ListItem>
              </List>
            </Paper>

            {/* Payment Options */}
            <Paper sx={{ p: 2, bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Payment Options
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Choose Payment Method
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleUPIPayment('gpay')}
                      startIcon={
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_Pay_Logo.svg" 
                          alt="GPay"
                          style={{ width: 20, height: 20 }}
                        />
                      }
                      sx={{
                        bgcolor: '#1a73e8',
                        '&:hover': { bgcolor: '#1557b0' }
                      }}
                    >
                      Google Pay
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleUPIPayment('phonepe')}
                      startIcon={
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" 
                          alt="PhonePe"
                          style={{ width: 20, height: 20 }}
                        />
                      }
                      sx={{
                        bgcolor: '#5f259f',
                        '&:hover': { bgcolor: '#4a1d7d' }
                      }}
                    >
                      PhonePe
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleUPIPayment('paytm')}
                      startIcon={
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" 
                          alt="Paytm"
                          style={{ width: 20, height: 20 }}
                        />
                      }
                      sx={{
                        bgcolor: '#00b9f5',
                        '&:hover': { bgcolor: '#0091c2' }
                      }}
                    >
                      Paytm
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleUPIPayment('default')}
                      startIcon={<QrCodeIcon />}
                      sx={{
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      Other UPI Apps
                    </Button>
                  </motion.div>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                * Payment confirmation may take a few moments to process
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Need help with payment?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  color="primary"
                  component="a"
                  href="tel:+919843464180"
                  size="small"
                >
                  <PhoneIcon />
                </IconButton>
                <IconButton
                  color="success"
                  component="a"
                  href="https://wa.me/+919843464180"
                  target="_blank"
                  size="small"
                >
                  <WhatsAppIcon />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
