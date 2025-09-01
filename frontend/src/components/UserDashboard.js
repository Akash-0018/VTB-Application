import React, { useState, useEffect } from 'react';
import BookingDialog from './BookingDialog';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function UserDashboard({ onLogout, setError, setMessage }) {
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [turfInfo, setTurfInfo] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [newBooking, setNewBooking] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
    sport: '',
    team_name: '',
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Prefill team_name from user data if available
        setNewBooking((prev) => ({
          ...prev,
          team_name: userData.team_name || '',
        }));
      } catch {
        setUser(null);
      }
    }
    fetchBookings();
    fetchTurfInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setError?.('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError?.(error.response?.data?.message || error.message);
      }
      setBookings([]);
    }
  };

  // Fetch turf information
  const fetchTurfInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/turf`);
      setTurfInfo(response.data);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setError?.('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError?.(error.response?.data?.message || error.message);
      }
      setTurfInfo(null);
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Handle input changes for the booking form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const { booking_date, start_time, end_time, sport, team_name } = newBooking;
    if (!booking_date || !start_time || !end_time || !sport) {
      setError?.('Please fill all required fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        booking_date,
        start_time,
        end_time,
        sport,
        team_name: team_name || user?.team_name || '',
      };

      await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookingDialogOpen(false);
      fetchBookings();
      setNewBooking({
        booking_date: '',
        start_time: '',
        end_time: '',
        sport: '',
        team_name: user?.team_name || '',
      });
      setMessage?.('Booking submitted successfully.');
      showSnackbar('Booking submitted successfully.');
    } catch (error) {
      setError?.(error.response?.data?.message || error.message);
    }
  };

  // Booking tab
  const BookingsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setBookingDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        New Booking
      </Button>

      {bookings.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
          No bookings found. Make your first booking!
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Sport</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Admin Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  sx={{
                    backgroundColor:
                      booking.status === 'approved'
                        ? 'rgba(46, 125, 50, 0.1)'
                        : booking.status === 'rejected'
                        ? 'rgba(211, 47, 47, 0.1)'
                        : 'inherit',
                  }}
                >
                  <TableCell>{booking.booking_date}</TableCell>
                  <TableCell>{`${booking.start_time} - ${booking.end_time}`}</TableCell>
                  <TableCell>{booking.sport}</TableCell>
                  <TableCell>{booking.team_name || 'No team'}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>{booking.admin_notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Turf info tab
  const TurfInfoTab = () => (
    <Box sx={{ mt: 3 }}>
      {!turfInfo ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
          Loading turf information...
        </Typography>
      ) : (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {turfInfo.name}
              </Typography>
              <Typography paragraph>{turfInfo.details}</Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography>Phone: {turfInfo.phone}</Typography>
                  <Typography>Email: {turfInfo.email}</Typography>
                  {turfInfo.location && (
                    <Button
                      variant="outlined"
                      color="primary"
                      href={turfInfo.location}
                      target="_blank"
                      sx={{ mt: 1 }}
                    >
                      View Location
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sports Available
                  </Typography>
                  <Typography>
                    {turfInfo.sports_available?.join(', ') || 'No sports listed'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekday Rates
                  </Typography>
                  {Object.entries(turfInfo.price_details?.weekday || {}).map(([time, price]) => (
                    <Typography key={time}>
                      {time.charAt(0).toUpperCase() + time.slice(1)}: {price}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekend Rates
                  </Typography>
                  {Object.entries(turfInfo.price_details?.weekend || {}).map(([time, price]) => (
                    <Typography key={time}>
                      {time.charAt(0).toUpperCase() + time.slice(1)}: {price}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {turfInfo.special_offers?.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Special Offers
                </Typography>

                <Grid container spacing={2}>
                  {turfInfo.special_offers.map((offer, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{offer.title}</Typography>
                          <Typography paragraph>{offer.description}</Typography>
                          <Typography variant="subtitle2">
                            Discount: {offer.discount}
                          </Typography>
                          <Typography variant="caption">
                            Valid: {offer.valid_from} to {offer.valid_until}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {turfInfo.images?.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Turf Gallery
              </Typography>

              <ImageList cols={3} gap={8}>
                {turfInfo.images.map((url, idx) => (
                  <ImageListItem key={idx}>
                    <img
                      src={url}
                      alt={`Turf image ${idx + 1}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Welcome, {user?.username || 'User'}!
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'secondary.main',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5 
              }}
            >
              Team: 
              <span style={{ 
                color: user?.team_name ? 'inherit' : 'text.secondary',
                fontStyle: user?.team_name ? 'normal' : 'italic'
              }}>
                {user?.team_name || 'No team'}
              </span>
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onLogout}
          sx={{ height: 'fit-content' }}
        >
          Logout
        </Button>
      </Box>

      <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="My Bookings" />
        <Tab label="Turf Information" />
      </Tabs>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === 0 ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 0 ? <BookingsTab /> : <TurfInfoTab />}
        </motion.div>
      </AnimatePresence>

      <BookingDialog
        open={bookingDialogOpen}
        onClose={() => {
          setBookingDialogOpen(false);
          fetchBookings();
        }}
      />
    </Box>
  );
}

export default UserDashboard;
