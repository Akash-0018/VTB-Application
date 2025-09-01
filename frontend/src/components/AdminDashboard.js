import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  ImageList,
  ImageListItem,
  CardMedia,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Edit, Delete, Check, Close, Add } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function AdminDashboard() {
  const token = localStorage.getItem('token');
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [turfConfig, setTurfConfig] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [turfEditData, setTurfEditData] = useState(null);
  const [imageDialog, setImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [offerDialog, setOfferDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount: '',
    valid_from: '',
    valid_until: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchTurfConfig();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle the fixed backend response structure
      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showAlert('Error fetching bookings: ' + (error.response?.data?.message || error.message), 'error');
      setBookings([]);
    }
  };

  const fetchTurfConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/turf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      const fullData = {
        name: data.name || '',
        details: data.details || '',
        location: data.location || '',
        phone: data.phone || '',
        email: data.email || '',
        sports_available: data.sports_available || [],
        price_details: data.price_details || {
          weekday: { morning: '', afternoon: '', evening: '' },
          weekend: { morning: '', afternoon: '', evening: '' }
        },
        images: data.images || [],
        special_offers: data.special_offers || []
      };
      setTurfConfig(fullData);
      setTurfEditData(fullData);
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching turf config:', error);
      showAlert('Error fetching turf configuration', 'error');
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}/status`,
        { status, admin_notes: adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialogOpen(false);
      setSelectedBooking(null);
      setAdminNotes('');
      fetchBookings();
      showAlert(`Booking ${status} successfully`, 'success');
    } catch (error) {
      console.error('Error updating booking:', error);
      showAlert('Error updating booking status', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const openEditDialog = (booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || '');
    setEditDialogOpen(true);
  };

  const BookingsTab = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Time</strong></TableCell>
            <TableCell><strong>User Name</strong></TableCell>
            <TableCell><strong>Team Name</strong></TableCell>
            <TableCell><strong>Sport</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Admin Notes</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="textSecondary">No bookings found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow
                key={booking.id}
                sx={{
                  backgroundColor:
                    booking.status === 'confirmed'
                      ? 'rgba(46, 125, 50, 0.1)'
                      : booking.status === 'rejected'
                      ? 'rgba(211, 47, 47, 0.1)'
                      : 'inherit'
                }}
              >
                <TableCell>{booking.booking_date}</TableCell>
                <TableCell>{`${booking.start_time} - ${booking.end_time}`}</TableCell>
                <TableCell>{booking.user_name || 'Unknown'}</TableCell>
                <TableCell>{booking.team_name || 'No team'}</TableCell>
                <TableCell>{booking.sport}</TableCell>
                <TableCell>
                  <Typography 
                    sx={{ 
                      color: booking.status === 'confirmed' ? 'success.main' : 
                             booking.status === 'rejected' ? 'error.main' : 'warning.main',
                      fontWeight: 600
                    }}
                  >
                    {booking.status}
                  </Typography>
                </TableCell>
                <TableCell>{booking.admin_notes || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => openEditDialog(booking)}
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const handleTurfChange = (e) => {
    const { name, value } = e.target;
    setTurfEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (type, time, price) => {
    setTurfEditData(prev => ({
      ...prev,
      price_details: {
        ...prev.price_details,
        [type]: {
          ...prev.price_details[type],
          [time]: price
        }
      }
    }));
  };

  const handleSaveTurfChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/turf`,
        turfEditData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTurfConfig(turfEditData);
      showAlert('Turf configuration updated successfully');
    } catch (error) {
      console.error('Error updating turf config:', error);
      showAlert('Failed to update turf configuration', 'error');
    }
  };

  const handleAddImage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/turf/images`,
        { image_url: newImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedConfig = {
        ...turfEditData,
        images: [...(turfEditData.images || []), newImageUrl]
      };
      setTurfEditData(updatedConfig);
      setTurfConfig(updatedConfig);
      setNewImageUrl('');
      setImageDialog(false);
      showAlert('Image added successfully');
    } catch (error) {
      console.error('Error adding image:', error);
      showAlert('Failed to add image', 'error');
    }
  };

  const handleRemoveImage = async (index) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/turf/images/${index}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedImages = turfEditData.images.filter((_, i) => i !== index);
      const updatedConfig = { ...turfEditData, images: updatedImages };
      setTurfEditData(updatedConfig);
      setTurfConfig(updatedConfig);
      showAlert('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      showAlert('Failed to remove image', 'error');
    }
  };

  const handleAddOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/turf/offers`,
        newOffer,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedConfig = {
        ...turfEditData,
        special_offers: [...(turfEditData.special_offers || []), newOffer]
      };
      setTurfEditData(updatedConfig);
      setTurfConfig(updatedConfig);
      setNewOffer({
        title: '',
        description: '',
        discount: '',
        valid_from: '',
        valid_until: ''
      });
      setOfferDialog(false);
      showAlert('Special offer added successfully');
    } catch (error) {
      console.error('Error adding offer:', error);
      showAlert('Failed to add special offer', 'error');
    }
  };

  const handleRemoveOffer = async (index) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/turf/offers/${index}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOffers = turfEditData.special_offers.filter((_, i) => i !== index);
      const updatedConfig = { ...turfEditData, special_offers: updatedOffers };
      setTurfEditData(updatedConfig);
      setTurfConfig(updatedConfig);
      showAlert('Special offer removed successfully');
    } catch (error) {
      console.error('Error removing offer:', error);
      showAlert('Failed to remove special offer', 'error');
    }
  };

  const TurfConfigTab = () => (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Turf Configuration
          </Typography>
          {turfEditData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Turf Name"
                  name="name"
                  value={turfEditData.name || ''}
                  onChange={handleTurfChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Details"
                  name="details"
                  value={turfEditData.details || ''}
                  onChange={handleTurfChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Location URL"
                  name="location"
                  value={turfEditData.location || ''}
                  onChange={handleTurfChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={turfEditData.phone || ''}
                  onChange={handleTurfChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={turfEditData.email || ''}
                  onChange={handleTurfChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Price Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Weekday Rates
                </Typography>
                {turfEditData.price_details && turfEditData.price_details.weekday && 
                 Object.entries(turfEditData.price_details.weekday).map(([time, price]) => (
                  <TextField
                    key={time}
                    fullWidth
                    label={time.charAt(0).toUpperCase() + time.slice(1)}
                    value={price || ''}
                    onChange={(e) => handlePriceChange('weekday', time, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Weekend Rates
                </Typography>
                {turfEditData.price_details && turfEditData.price_details.weekend &&
                 Object.entries(turfEditData.price_details.weekend).map(([time, price]) => (
                  <TextField
                    key={time}
                    fullWidth
                    label={time.charAt(0).toUpperCase() + time.slice(1)}
                    value={price || ''}
                    onChange={(e) => handlePriceChange('weekend', time, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Grid>

              {/* Images Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setImageDialog(true)}
                  sx={{ mb: 2 }}
                >
                  Add Image
                </Button>
                {turfEditData.images && turfEditData.images.length > 0 ? (
                  <ImageList sx={{ width: '100%' }} cols={3} rowHeight={200} gap={8}>
                    {turfEditData.images.map((url, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={url}
                          alt={`Turf image ${index + 1}`}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '0 4px 0 4px'
                          }}
                        >
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveImage(index)}
                            sx={{ color: 'white' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography color="textSecondary">No images added yet</Typography>
                )}
              </Grid>

              {/* Special Offers Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Special Offers
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOfferDialog(true)}
                  sx={{ mb: 2 }}
                >
                  Add Special Offer
                </Button>
                {turfEditData.special_offers && turfEditData.special_offers.length > 0 ? (
                  <List>
                    {turfEditData.special_offers.map((offer, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveOffer(index)}
                          >
                            <Delete />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={offer.title}
                          secondary={offer.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">No special offers added yet</Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveTurfChanges}
                  sx={{ mt: 2 }}
                >
                  Save All Changes
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Image Dialog */}
      <Dialog
        open={imageDialog}
        onClose={() => setImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Image</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Image URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          {newImageUrl && (
            <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
              <CardMedia
                component="img"
                image={newImageUrl}
                alt="Image preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 1
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddImage}
            variant="contained"
            color="primary"
            disabled={!newImageUrl}
          >
            Add Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={offerDialog} onClose={() => setOfferDialog(false)}>
        <DialogTitle>Add Special Offer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newOffer.title}
              onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newOffer.description}
              onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Discount"
              value={newOffer.discount}
              onChange={(e) => setNewOffer(prev => ({ ...prev, discount: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Valid From"
              type="date"
              value={newOffer.valid_from}
              onChange={(e) => setNewOffer(prev => ({ ...prev, valid_from: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Valid Until"
              type="date"
              value={newOffer.valid_until}
              onChange={(e) => setNewOffer(prev => ({ ...prev, valid_until: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferDialog(false)}>Cancel</Button>
          <Button onClick={handleAddOffer} variant="contained" color="primary">
            Add Offer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const showAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');  
    window.location.reload();
  };

  if (!initialized) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setAlert(prev => ({ ...prev, open: false }))}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/admin-database"
            variant="contained"
            color="primary"
          >
            Database Management
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Bookings" />
        <Tab label="Turf Configuration" />
      </Tabs>

      {tab === 0 ? <BookingsTab /> : <TurfConfigTab />}

      {/* Booking Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>User:</strong> {selectedBooking.user_name || 'Unknown User'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date:</strong> {selectedBooking.booking_date}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Time:</strong> {selectedBooking.start_time} - {selectedBooking.end_time}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Sport:</strong> {selectedBooking.sport}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleBookingAction(selectedBooking?.id, 'confirmed')}
            color="success"
            startIcon={<Check />}
          >
            Approve
          </Button>
          <Button
            onClick={() => handleBookingAction(selectedBooking?.id, 'rejected')}
            color="error"
            startIcon={<Close />}
          >
            Reject
          </Button>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;
