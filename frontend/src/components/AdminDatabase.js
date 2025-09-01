import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Image as ImageIcon
} from '@mui/icons-material';

// Helper to get token or throw if missing
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  return token;
};

const AdminDatabase = () => {
  const [turfConfig, setTurfConfig] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'image' or 'offer'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newImage, setNewImage] = useState('');
  const [newOffer, setNewOffer] = useState({ title: '', description: '' });
  const [editedConfig, setEditedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    fetchTurfConfig();
    // eslint-disable-next-line
  }, []);

  const fetchTurfConfig = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/admin/turf-config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTurfConfig(data);
      setEditedConfig(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching turf config:', error);
      showSnackbar(error.message.includes('authentication token') ? 'Please login again.' : 'Error fetching configuration', 'error');
      setAuthError(error.message.includes('authentication token'));
      // fallback blank config
      const emptyConfig = {
        name: '',
        details: '',
        location: '',
        phone: '',
        email: '',
        sports_available: [],
        price_details: {
          weekday: { morning: '', afternoon: '', evening: '' },
          weekend: { morning: '', afternoon: '', evening: '' }
        },
        images: [],
        special_offers: []
      };
      setTurfConfig(emptyConfig);
      setEditedConfig(emptyConfig);
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/admin/turf-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedConfig),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update configuration');
      }
      setTurfConfig({ ...editedConfig });
      showSnackbar('Configuration updated successfully', 'success');
    } catch (error) {
      console.error('Error updating config:', error);
      showSnackbar('Error updating configuration', 'error');
    }
  };

  const handleAddImage = async () => {
    if (!newImage) return;
    try {
      const token = getToken();
      const updatedImages = [...(editedConfig.images || []), newImage];
      const response = await fetch('http://localhost:5000/api/admin/turf-config/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images: updatedImages }),
      });
      if (!response.ok) throw new Error('Failed to add image');
      setEditedConfig(prev => ({ ...prev, images: updatedImages }));
      setTurfConfig(prev => ({ ...prev, images: updatedImages }));
      setNewImage('');
      setOpenDialog(false);
      showSnackbar('Image added successfully', 'success');
    } catch (error) {
      console.error('Error adding image:', error);
      showSnackbar('Error adding image', 'error');
    }
  };

  const handleDeleteImage = async (index) => {
    try {
      const token = getToken();
      const updatedImages = editedConfig.images.filter((_, i) => i !== index);
      const response = await fetch('http://localhost:5000/api/admin/turf-config/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images: updatedImages }),
      });
      if (!response.ok) throw new Error('Failed to delete image');
      setEditedConfig(prev => ({ ...prev, images: updatedImages }));
      setTurfConfig(prev => ({ ...prev, images: updatedImages }));
      showSnackbar('Image deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showSnackbar('Error deleting image', 'error');
    }
  };

  const handleAddOffer = async () => {
    if (!newOffer.title || !newOffer.description) return;
    try {
      const token = getToken();
      const updatedOffers = [...(editedConfig.special_offers || []), newOffer];
      const response = await fetch('http://localhost:5000/api/admin/turf-config/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ special_offers: updatedOffers }),
      });
      if (!response.ok) throw new Error('Failed to add offer');
      setEditedConfig(prev => ({ ...prev, special_offers: updatedOffers }));
      setTurfConfig(prev => ({ ...prev, special_offers: updatedOffers }));
      setNewOffer({ title: '', description: '' });
      setOpenDialog(false);
      showSnackbar('Offer added successfully', 'success');
    } catch (error) {
      console.error('Error adding offer:', error);
      showSnackbar('Error adding offer', 'error');
    }
  };

  const handleDeleteOffer = async (index) => {
    try {
      const token = getToken();
      const updatedOffers = editedConfig.special_offers.filter((_, i) => i !== index);
      const response = await fetch('http://localhost:5000/api/admin/turf-config/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ special_offers: updatedOffers }),
      });
      if (!response.ok) throw new Error('Failed to delete offer');
      setEditedConfig(prev => ({ ...prev, special_offers: updatedOffers }));
      setTurfConfig(prev => ({ ...prev, special_offers: updatedOffers }));
      showSnackbar('Offer deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting offer:', error);
      showSnackbar('Error deleting offer', 'error');
    }
  };

  const handleDownloadReport = async (reportType) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/admin/reports/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSnackbar('Report downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading report:', error);
      showSnackbar('Error downloading report', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (authError) {
    return (
      <Container>
        <Typography color="error" sx={{ my: 2 }}>Authentication required. Please login again.</Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (!turfConfig || !editedConfig) {
    return (
      <Container>
        <Typography color="error">Error loading configuration</Typography>
        <Button onClick={fetchTurfConfig} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Database Management</Typography>
      {/* Reports Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReport('monthly')}
          >
            Download Monthly Report
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReport('bookings')}
          >
            Download Bookings Report
          </Button>
        </Box>
      </Paper>
      {/* Configuration Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Basic Configuration</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Name"
                value={editedConfig.name || ''}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={editedConfig.location || ''}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, location: e.target.value }))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editedConfig.phone || ''}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, phone: e.target.value }))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={editedConfig.email || ''}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Details"
                multiline
                rows={4}
                value={editedConfig.details || ''}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, details: e.target.value }))}
                margin="normal"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfig}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Images Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Images</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogType('image');
                setOpenDialog(true);
              }}
            >
              Add Image
            </Button>
          </Box>
          <List>
            {editedConfig.images && editedConfig.images.length > 0 ? (
              editedConfig.images.map((image, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={`Image ${index + 1}`} secondary={image} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteImage(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Typography color="textSecondary">No images added yet</Typography>
            )}
          </List>
        </CardContent>
      </Card>
      {/* Special Offers Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Special Offers</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogType('offer');
                setOpenDialog(true);
              }}
            >
              Add Offer
            </Button>
          </Box>
          <List>
            {editedConfig.special_offers && editedConfig.special_offers.length > 0 ? (
              editedConfig.special_offers.map((offer, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={offer.title} secondary={offer.description} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteOffer(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Typography color="textSecondary">No special offers added yet</Typography>
            )}
          </List>
        </CardContent>
      </Card>
      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'image' ? 'Add New Image' : 'Add New Offer'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'image' ? (
            <TextField
              fullWidth
              label="Image URL"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              margin="normal"
            />
          ) : (
            <>
              <TextField
                fullWidth
                label="Offer Title"
                value={newOffer.title}
                onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Offer Description"
                multiline
                rows={4}
                value={newOffer.description}
                onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={dialogType === 'image' ? handleAddImage : handleAddOffer}
            disabled={
              dialogType === 'image'
                ? !newImage
                : !newOffer.title || !newOffer.description
            }
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDatabase;
