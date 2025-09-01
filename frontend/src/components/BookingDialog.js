import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import PaymentDialog from './PaymentDialog';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function BookingDialog({ open, onClose, defaultDate }) {
  const [selectedDate, setSelectedDate] = useState(defaultDate || new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [teamName, setTeamName] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData.team_name || '';
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [showPayment, setShowPayment] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (open) {
      fetchAvailableSlots();
    }
  }, [open, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE_URL}/available-slots`, {
        params: { date: formattedDate }
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAlert({
        show: true,
        message: 'Error fetching available slots',
        severity: 'error'
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedSport) {
      setAlert({
        show: true,
        message: 'Please select a time slot and sport',
        severity: 'error'
      });
      return;
    }

    if (!teamName.trim()) {
      setAlert({
        show: true,
        message: 'Please enter your team name',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const [startTime, endTime] = selectedSlot.split(' - ').map(t => t.trim());

      const bookingDetails = {
        sport: selectedSport,
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedSlot,
        team: teamName,
        notes: notes
      };

      setBookingDetails(bookingDetails);
      setShowPayment(true);
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error preparing booking',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'primary.main', color: 'white' }}>
        New Booking
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {alert.show && (
          <Alert severity={alert.severity} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setSelectedSlot(null);
                setSelectedSport(null);
              }}
              disablePast
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  margin: 'normal'
                }
              }}
            />
          </LocalizationProvider>
        </Box>

        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
          {availableSlots.map((slot) => {
            const timeString = `${slot.start_time} - ${slot.end_time}`;
            const isSelected = selectedSlot === timeString;
            
            return (
              <ListItem
                key={timeString}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.light' : 'action.hover',
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" color={isSelected ? 'primary.main' : 'text.primary'}>
                      {timeString}
                    </Typography>
                  }
                  secondary={
                    <Typography component="div" variant="body2">
                      <Box sx={{ mt: 1 }}>
                        {slot.sports.map((sport) => (
                          <Button
                            key={sport}
                            variant={selectedSlot === timeString && selectedSport === sport ? "contained" : "outlined"}
                            size="small"
                            onClick={() => {
                              setSelectedSlot(timeString);
                              setSelectedSport(sport);
                            }}
                            sx={{ mr: 1, mb: 1 }}
                          >
                            {sport}
                          </Button>
                        ))}
                      </Box>
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        {selectedSlot && selectedSport && (
          <Box sx={{ mt: 3 }}>
            <TextField
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Additional Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Any special requests or requirements..."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedSlot || !selectedSport || !teamName.trim() || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Payment'}
        </Button>
      </DialogActions>

      <PaymentDialog 
        open={showPayment} 
        onClose={() => setShowPayment(false)} 
        bookingDetails={bookingDetails}
        onSuccess={() => {
          setShowPayment(false);
          setAlert({
            show: true,
            message: 'Booking confirmed successfully!',
            severity: 'success'
          });
          setTimeout(() => {
            onClose();
          }, 2000);
        }}
      />
    </Dialog>
  );
}

export default BookingDialog;
