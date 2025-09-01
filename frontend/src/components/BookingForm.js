import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Alert,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function BookingForm() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem('selectedDate');
    localStorage.removeItem('selectedDate'); // Clear it after using
    return savedDate ? new Date(savedDate) : new Date();
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [teamName, setTeamName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.team_name || '';
  });
  const [notes, setNotes] = useState("");
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE_URL}/available-slots`, {
        params: {
          date: formattedDate
        }
      });
      
      // Set available slots directly from the response
      setAvailableSlots(response.data);
      
      // Reset selections when slots are updated
      setSelectedSlot(null);
      setSelectedSport(null);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAlert({
        show: true,
        message: 'Error fetching available slots. Please try again.',
        severity: 'error'
      });
    }
  };



  const handleSubmit = async () => {
    if (!selectedSlot || !selectedSport) {
      setAlert({
        show: true,
        message: 'Please select both a time slot and sport',
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
      const token = localStorage.getItem('token');
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const [startTime, endTime] = selectedSlot.split('-').map(t => t.trim());

      await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          sport: selectedSport,
          booking_date: formattedDate,
          start_time: startTime,
          end_time: endTime,
          team_name: teamName,
          notes: notes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAlert({
        show: true,
        message: 'Booking submitted successfully! Awaiting confirmation.',
        severity: 'success'
      });

      // Reset selection
      setSelectedSlot(null);
      setSelectedSport(null);
      fetchAvailableSlots();
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error creating booking',
        severity: 'error'
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Book a Turf
      </Typography>

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
          />
        </LocalizationProvider>
      </Box>

      <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
        {availableSlots.map((slot) => {
          const timeString = `${slot.start_time} - ${slot.end_time}`;
          const isSelected = selectedSlot === timeString;
          
          return (
            <ListItem
              key={timeString}
              sx={{
                mb: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.light' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.light' : 'action.hover',
                },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'flex-start',
                padding: 2
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" color={isSelected ? 'primary.main' : 'text.primary'} sx={{ mb: 1 }}>
                    {timeString}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Available Sports: {slot.sports.join(', ')}
                  </Typography>
                }
                sx={{ flex: 1, mb: { xs: 2, sm: 0 } }}
              />
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                {slot.sports.map((sport) => (
                  <Button
                    key={sport}
                    variant={selectedSlot === timeString && selectedSport === sport ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setSelectedSlot(timeString);
                      setSelectedSport(sport);
                    }}
                    sx={{
                      minWidth: 100,
                      backgroundColor: selectedSlot === timeString && selectedSport === sport ? 'primary.main' : 'transparent'
                    }}
                  >
                    {sport}
                  </Button>
                ))}
              </Box>
            </ListItem>
          );
        })}
      </List>

      {selectedSlot && selectedSport && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Team Name"
            variant="outlined"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            variant="outlined"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Any special requests or requirements..."
          />
        </Box>
      )}

      {selectedSlot && selectedSport && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            sx={{
              background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
              },
            }}
          >
            Book {selectedSport} for {selectedSlot}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default BookingForm;
