import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Card, List, ListItem, ListItemText, Chip, Avatar, Fab, Rating } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../utils/axios';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const API_BASE_URL = 'http://localhost:5000/api';

// Keep all your existing data arrays
const dummyImages = [
  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  'https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800',
  'https://images.unsplash.com/photo-1542652184-04fe4ec9d5bb?w=800',
  'https://images.unsplash.com/photo-1577223625816-7546b31a2995?w=800',
  'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800',
  'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800',
  'https://images.unsplash.com/photo-1550881111-7cfde14d0e17?w=800',
  'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800',
  'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800'
];

const sportsData = [
  { 
    name: 'Football', 
    icon: <SportsFootballIcon />, 
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400',
    popular: true 
  },
  { 
    name: 'Cricket', 
    icon: <SportsCricketIcon />, 
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
    popular: true 
  },
  { 
    name: 'Basketball', 
    icon: <SportsBasketballIcon />, 
    image: 'https://images.unsplash.com/photo-1542652184-04fe4ec9d5bb?w=400',
    popular: false 
  },
  { 
    name: 'Tennis', 
    icon: <SportsTennisIcon />, 
    image: 'https://images.unsplash.com/photo-1544717684-16a6f1e1b0ca?w=400',
    popular: false 
  }
];

const fallbackTestimonials = [
  {
    name: "Rahul Sharma",
    comment: "Amazing facility! The turf quality is top-notch and booking is super easy.",
    rating: 5,
    sport: "Football",
    avatar: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=2563eb&color=fff"
  },
  {
    name: "Priya Patel",
    comment: "Best cricket ground in the city. Professional management and great atmosphere!",
    rating: 5,
    sport: "Cricket", 
    avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=2563eb&color=fff"
  },
  {
    name: "Team Eagles",
    comment: "We've been playing here for 2 years. Highly recommend for serious teams!",
    rating: 5,
    sport: "Basketball",
    avatar: "https://ui-avatars.com/api/?name=Team+Eagles&background=2563eb&color=fff"
  }
];

const fallbackActivity = [
  { user: "Rajesh Kumar", action: "booked Football Turf for 6:00 PM", time: "2 minutes ago", sport: "Football" },
  { user: "Team Eagles", action: "reserved Cricket Ground for weekend", time: "5 minutes ago", sport: "Cricket" },
  { user: "Mumbai Warriors", action: "confirmed Basketball court booking", time: "12 minutes ago", sport: "Basketball" },
  { user: "Anisha Reddy", action: "booked Tennis court for tomorrow", time: "18 minutes ago", sport: "Tennis" }
];

const Home = () => {
  const [turfConfig, setTurfConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    bookings: 0,
    rating: 5.0
  });
  
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [liveActivity, setLiveActivity] = useState(fallbackActivity);
  const [quickAvailability, setQuickAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [realStatsLoaded, setRealStatsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const timeSlots = [
    "6:00 AM - 8:00 AM",
    "8:00 AM - 10:00 AM", 
    "10:00 AM - 12:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
    "8:00 PM - 10:00 PM",
    "10:00 PM - 12:00 AM"
  ];

  const specialOffers = [
    { primary: "Early Bird: 20% OFF", secondary: "6 AM - 10 AM slots", color: "success" },
    { primary: "Weekend Package: 15% OFF", secondary: "Book any 3 weekend slots", color: "primary" },
    { primary: "Midnight Madness: 30% OFF", secondary: "10 PM - 12 AM slots", color: "secondary" },
    { primary: "Group Booking: 25% OFF", secondary: "Teams of 10+ players", color: "warning" }
  ];

  // Keep all your existing useEffect and functions unchanged
  useEffect(() => {
    fetchTurfConfig();
    fetchRealStats();
    fetchLiveActivity();
    fetchTestimonials();
    fetchQuickAvailability();
  }, []);

  const fetchTurfConfig = async () => {
    try {
      const response = await api.get('/turf-config');
      setTurfConfig(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching turf config:', error);
      setLoading(false);
    }
  };

  const fetchRealStats = async () => {
    try {
      const response = await api.get('/stats');
      const data = response.data;
      
      if (data.data_source === 'real' && (data.total_customers > 0 || data.total_bookings > 0)) {
        setRealStatsLoaded(true);
        animateStatsToTarget({
          customers: data.total_customers,
          bookings: data.total_bookings,
          rating: data.average_rating
        });
      } else {
        animateStats();
      }
    } catch (error) {
      console.error('Error fetching real stats:', error);
      animateStats();
    }
  };

  const fetchLiveActivity = async () => {
    try {
      const response = await api.get('/live-activity');
      const data = response.data;
      
      if (data && data.length > 0) {
        setLiveActivity(data);
      }
    } catch (error) {
      console.error('Error fetching live activity:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/testimonials');
      const data = response.data;
      
      if (data && data.length > 0) {
        const testimonialsWithAvatars = data.map(testimonial => ({
          ...testimonial,
          avatar: testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2563eb&color=fff`
        }));
        setTestimonials(testimonialsWithAvatars);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchQuickAvailability = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setAvailabilityError(false);
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];

      const weekend = new Date();
      while (weekend.getDay() !== 6) { // Find next Saturday
        weekend.setDate(weekend.getDate() + 1);
      }
      const weekendDate = weekend.toISOString().split('T')[0];

      const [todaySlots, tomorrowSlots, weekendSlots] = await Promise.all([
        api.get(`/available-slots?date=${today}`),
        api.get(`/available-slots?date=${tomorrowDate}`),
        api.get(`/available-slots?date=${weekendDate}`)
      ]);

      const processSlotsData = (slotsData) => {
        const sportCounts = {};
        let totalSlots = 0;
        
        slotsData.forEach(slot => {
          slot.sports.forEach(sport => {
            sportCounts[sport] = (sportCounts[sport] || 0) + 1;
            totalSlots++;
          });
        });

        const timeRanges = slotsData.map(slot => ({
          time: slot.time_slot,
          sports: slot.sports
        }));

        return {
          totalSlots,
          sportCounts,
          timeRanges
        };
      };

      const data = {
        today: {
          label: 'Today',
          date: today,
          ...processSlotsData(todaySlots.data)
        },
        tomorrow: {
          label: 'Tomorrow',
          date: tomorrowDate,
          ...processSlotsData(tomorrowSlots.data)
        },
        weekend: {
          label: `This Weekend (${weekend.toLocaleDateString()})`,
          date: weekendDate,
          ...processSlotsData(weekendSlots.data)
        }
      };

      setQuickAvailability(data);
      setAvailabilityError(false);
    } catch (error) {
      console.error('Error fetching quick availability:', error);
      setAvailabilityError(true);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const animateStatsToTarget = (targets) => {
    let customers = 0;
    let bookings = 0;
    const customerTarget = targets.customers;
    const bookingTarget = targets.bookings;
    
    const customerIncrement = Math.max(1, Math.ceil(customerTarget / 20));
    const bookingIncrement = Math.max(1, Math.ceil(bookingTarget / 20));
    
    const customerInterval = setInterval(() => {
      customers += customerIncrement;
      if (customers >= customerTarget) {
        customers = customerTarget;
        clearInterval(customerInterval);
      }
      setStats(prev => ({ ...prev, customers }));
    }, 50);

    const bookingInterval = setInterval(() => {
      bookings += bookingIncrement;
      if (bookings >= bookingTarget) {
        bookings = bookingTarget;
        clearInterval(bookingInterval);
      }
      setStats(prev => ({ ...prev, bookings, rating: targets.rating }));
    }, 50);
  };

  const animateStats = () => {
    let customers = 0;
    let bookings = 0;
    const customerTarget = 500;
    const bookingTarget = 1200;
    
    const customerInterval = setInterval(() => {
      customers += 25;
      if (customers >= customerTarget) {
        customers = customerTarget;
        clearInterval(customerInterval);
      }
      setStats(prev => ({ ...prev, customers }));
    }, 50);

    const bookingInterval = setInterval(() => {
      bookings += 60;
      if (bookings >= bookingTarget) {
        bookings = bookingTarget;
        clearInterval(bookingInterval);
      }
      setStats(prev => ({ ...prev, bookings }));
    }, 50);
  };

  const handleRefresh = () => {
    fetchQuickAvailability(true);
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Modern Hero Section - Professional 2025 Styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              px: { xs: 2, md: 4 },
              mb: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #1e40af 50%, #1e3a8a 75%, #1e293b 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(37, 99, 235, 0.15)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600") center/cover',
                opacity: 0.1,
                zIndex: 1,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                  letterSpacing: '-0.03em',
                  color: 'white',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  mb: 2
                }}
              >
                TurfZone
              </Typography>
              <Typography 
                variant="h4" 
                component="p" 
                sx={{ 
                  mb: 4,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.4
                }}
              >
                Your premier destination for sports facility bookings
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  size="large"
                  sx={{ 
                    fontSize: '1.1rem', 
                    py: 2, 
                    px: 4,
                    backgroundColor: 'white',
                    color: '#2563eb',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(255, 255, 255, 0.4)',
                    }
                  }}
                >
                  Book Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    fontSize: '1.1rem', 
                    py: 2, 
                    px: 4,
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: 'none',
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                      transform: 'translateY(-3px)',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Statistics Counter - Modern Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ py: 4, mb: 6 }}>
            {realStatsLoaded && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip 
                  label="🔴 Live Data" 
                  sx={{
                    bgcolor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                />
              </Box>
            )}
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15)',
                      transform: 'translateY(-6px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                    }
                  }}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#2563eb', mb: 2 }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '2.5rem' }}>
                      {stats.customers}+
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Happy Customers
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={6} md={3}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 60px rgba(16, 185, 129, 0.15)',
                      transform: 'translateY(-6px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                    }
                  }}>
                    <EventAvailableIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '2.5rem' }}>
                      {stats.bookings}+
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Bookings Completed
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={6} md={3}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 60px rgba(245, 158, 11, 0.15)',
                      transform: 'translateY(-6px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    }
                  }}>
                    <AccessTimeIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '2.5rem' }}>
                      24/7
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Support Available
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={6} md={3}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.08)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 60px rgba(156, 39, 176, 0.15)',
                      transform: 'translateY(-6px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #9c27b0, #7b1fa2)',
                    }
                  }}>
                    <StarIcon sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '2.5rem' }}>
                      {stats.rating}★
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Average Rating
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Weather Widget - Modern Glass Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card sx={{ 
            p: 4, 
            mb: 6, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <WbSunnyIcon sx={{ fontSize: 56 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Perfect Weather Today! ☀️
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  28°C - Ideal for outdoor sports
                </Typography>
              </Box>
            </Box>
          </Card>
        </motion.div>

        {/* Live Activity Feed - Modern Design */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card sx={{ 
            p: 4, 
            mb: 6,
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e)',
              borderRadius: '16px 16px 0 0',
            }
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#1e293b',
              fontWeight: 700,
              mb: 3
            }}>
              🔴 Live Activity
            </Typography>
            <List>
              {liveActivity.map((activity, index) => (
                <ListItem key={index} sx={{ py: 1.5, px: 0, borderBottom: '1px solid #f1f5f9' }}>
                  <ListItemText 
                    primary={`${activity.user} ${activity.action}`}
                    secondary={activity.time}
                    primaryTypographyProps={{ 
                      variant: 'body1',
                      color: '#374151',
                      fontWeight: 600
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption', 
                      color: '#6b7280' 
                    }}
                  />
                  <Chip 
                    label={activity.sport} 
                    size="small" 
                    sx={{
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 600,
                      border: '1px solid #dbeafe',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Sports Selection - Modern Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ my: 8 }}>
            <Typography 
              variant="h3" 
              textAlign="center" 
              gutterBottom 
              sx={{ 
                mb: 6,
                color: '#1e293b',
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Choose Your Sport
            </Typography>
            <Grid container spacing={4}>
              {sportsData.map((sport, index) => (
                <Grid item xs={6} md={3} key={sport.name}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ 
                      position: 'relative',
                      height: 260,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                      },
                      '&:hover .sport-overlay': {
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)'
                      }
                    }}>
                      <Box
                        component="img"
                        src={sport.image}
                        alt={sport.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box 
                        className="sport-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(30, 41, 59, 0.8) 100%)',
                          color: 'white',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {sport.icon && React.cloneElement(sport.icon, { sx: { fontSize: 48, mb: 2 } })}
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {sport.name}
                        </Typography>
                        {sport.popular && (
                          <Chip 
                            label="Popular" 
                            size="small" 
                            sx={{ 
                              bgcolor: '#f59e0b', 
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Timings & Offers - Modern Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ my: 8 }}>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 5, 
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      color: '#1e293b',
                      fontWeight: 700,
                      mb: 4
                    }}
                  >
                    <AccessTimeIcon sx={{ color: '#2563eb', fontSize: 32 }} />
                    Available Timings
                  </Typography>
                  <List dense>
                    {timeSlots.map((slot, i) => (
                      <ListItem key={i} sx={{ py: 1, px: 0, borderBottom: '1px solid #f8fafc' }}>
                        <ListItemText
                          primary={slot}
                          primaryTypographyProps={{ 
                            variant: 'body1',
                            sx: { fontWeight: 600, color: '#374151' }
                          }}
                        />
                        <Chip 
                          label="Available" 
                          size="small" 
                          sx={{
                            bgcolor: '#dcfce7',
                            color: '#16a34a',
                            fontWeight: 600,
                            border: '1px solid #bbf7d0',
                          }}
                        />
                      </ListItem>
                    ))}
                    <ListItem sx={{ py: 1, px: 0, mt: 2 }}>
                      <ListItemText
                        primary="Lunch Break: 12:00 PM - 2:00 PM"
                        primaryTypographyProps={{ 
                          variant: 'body1', 
                          sx: { 
                            color: '#dc2626', 
                            fontWeight: 700,
                            fontStyle: 'italic'
                          } 
                        }}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 5, 
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      color: '#1e293b',
                      fontWeight: 700,
                      mb: 4
                    }}
                  >
                    <LocalOfferIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                    Special Offers
                  </Typography>
                  <List dense>
                    {specialOffers.map((offer, i) => (
                      <ListItem key={i} sx={{ py: 1, px: 0, borderBottom: '1px solid #f8fafc' }}>
                        <ListItemText
                          primary={offer.primary}
                          secondary={offer.secondary}
                          primaryTypographyProps={{ 
                            variant: 'body1',
                            sx: { 
                              fontWeight: 700, 
                              color: offer.color === 'success' ? '#16a34a' : 
                                     offer.color === 'primary' ? '#2563eb' :
                                     offer.color === 'secondary' ? '#9333ea' :
                                     '#ea580c'
                            }
                          }}
                          secondaryTypographyProps={{ 
                            variant: 'body2', 
                            color: '#6b7280'
                          }}
                        />
                        <Chip 
                          label="Limited Time" 
                          size="small" 
                          sx={{
                            bgcolor: offer.color === 'success' ? '#dcfce7' : 
                                     offer.color === 'primary' ? '#dbeafe' :
                                     offer.color === 'secondary' ? '#faf5ff' :
                                     '#fed7aa',
                            color: offer.color === 'success' ? '#16a34a' : 
                                   offer.color === 'primary' ? '#2563eb' :
                                   offer.color === 'secondary' ? '#9333ea' :
                                   '#ea580c',
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Testimonials - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ py: 8, my: 6, bgcolor: 'rgba(248, 250, 252, 0.5)', borderRadius: 4, px: 4 }}>
            <Typography 
              variant="h3" 
              textAlign="center" 
              gutterBottom 
              sx={{ 
                mb: 6,
                color: '#1e293b',
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              What Our Players Say
            </Typography>
            <Grid container spacing={4}>
              {testimonials.slice(0, 3).map((review, index) => (
                <Grid item xs={12} md={4} key={review.id || index}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ 
                      p: 4, 
                      height: '100%',
                      bgcolor: 'white',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', mb: 3, justifyContent: 'center' }}>
                        <Rating 
                          value={review.rating} 
                          readOnly 
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: '#f59e0b'
                            }
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body1" 
                        paragraph 
                        sx={{ 
                          fontStyle: 'italic', 
                          textAlign: 'center',
                          color: '#374151',
                          mb: 4,
                          lineHeight: 1.7,
                          fontSize: '1.1rem'
                        }}
                      >
                        "{review.comment}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                        <Avatar 
                          src={review.avatar} 
                          sx={{ 
                            width: 56, 
                            height: 56,
                            border: '3px solid #e2e8f0'
                          }} 
                        />
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {review.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {review.team_name ? `${review.team_name} - ${review.sport}` : `${review.sport} Player`}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Quick Availability - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card sx={{ 
            p: 6, 
            mb: 6, 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(37, 99, 235, 0.25)',
          }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                textAlign: 'center',
                fontWeight: 700,
                mb: 4
              }}
            >
              Quick Availability Check
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                startIcon={<EventAvailableIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                variant="outlined"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Availability'}
              </Button>
            </Box>
            {availabilityError && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{ color: '#fef2f2', mb: 2 }}>
                  Unable to fetch latest availability. Please try again.
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              {quickAvailability ? (
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {['today', 'tomorrow', 'weekend'].map((period) => (
                    <Grid item xs={12} md={4} key={period}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          p: 3,
                          borderRadius: 4,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                          },
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: '#2563eb', 
                            fontWeight: 700, 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <EventAvailableIcon />
                            {quickAvailability[period].label}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                              Total Slots: {quickAvailability[period].totalSlots}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {Object.entries(quickAvailability[period].sportCounts).map(([sport, count]) => (
                                <Chip
                                  key={sport}
                                  label={`${sport}: ${count}`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#dbeafe',
                                    color: '#2563eb',
                                    fontWeight: 600
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>

                          <Box>
                            <Typography variant="body2" sx={{ color: '#4b5563', mb: 1, fontWeight: 600 }}>
                              Available Times:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {quickAvailability[period].timeRanges.map((timeSlot, idx) => (
                                <Chip
                                  key={idx}
                                  label={timeSlot.time}
                                  size="small"
                                  sx={{
                                    bgcolor: '#f3f4f6',
                                    color: '#4b5563',
                                    fontWeight: 500
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>

                          <Button
                            variant="contained"
                            fullWidth
                            sx={{
                              mt: 3,
                              textTransform: 'none',
                              fontWeight: 600,
                              bgcolor: '#2563eb',
                              '&:hover': {
                                bgcolor: '#1d4ed8',
                              }
                            }}
                            onClick={() => {
                              let selectedDate = quickAvailability[period].date;
                              localStorage.setItem('selectedDate', selectedDate);
                              window.location.href = '/booking';
                            }}
                          >
                            Book Slots
                          </Button>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={4}>
                  {['Today', 'Tomorrow', 'Weekend'].map((period, index) => (
                    <Grid item xs={12} md={4} key={period}>
                      <Card sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 4
                      }}>
                        <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700, mb: 2 }}>
                          {period}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#374151' }}>
                          Loading availability...
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Card>
        </motion.div>

        {/* Image Carousel - Modern Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ my: 8, overflow: 'hidden' }}>
            <Box sx={{ 
              position: 'relative', 
              height: '500px', 
              borderRadius: 4, 
              overflow: 'hidden', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              {(turfConfig?.images || dummyImages).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    x: [-300, 0, 0, 300],
                  }}
                  transition={{
                    duration: 2.5,
                    times: [0, 0.3, 0.7, 1],
                    repeat: Infinity,
                    repeatDelay: (turfConfig?.images || dummyImages).length * 2.5 - 2.5,
                    delay: index * 2.5,
                  }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`Turf view ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 4,
                      background: 'linear-gradient(transparent, rgba(30, 41, 59, 0.9))',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {`Featured Facility ${index + 1}`}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Venue Information - Modern Cards */}
        {turfConfig && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, my: 8 }}>
              <Card sx={{ 
                p: 5,
                bgcolor: 'white',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                }
              }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1e293b', fontWeight: 700, mb: 4 }}>
                  Venue Details
                </Typography>
                <Box sx={{ space: 3 }}>
                  <Typography variant="h6" paragraph sx={{ color: '#374151', mb: 2 }}>
                    <strong style={{ color: '#1e293b' }}>Name:</strong> {turfConfig.name}
                  </Typography>
                  <Typography variant="h6" paragraph sx={{ color: '#374151', mb: 2 }}>
                    <strong style={{ color: '#1e293b' }}>Location:</strong> {turfConfig.location}
                  </Typography>
                  <Typography variant="h6" paragraph sx={{ color: '#374151', mb: 2 }}>
                    <strong style={{ color: '#1e293b' }}>Contact:</strong> {turfConfig.phone}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#374151' }}>
                    <strong style={{ color: '#1e293b' }}>Email:</strong> {turfConfig.email}
                  </Typography>
                </Box>
              </Card>

              <Card sx={{ 
                p: 5,
                bgcolor: 'white',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                }
              }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1e293b', fontWeight: 700, mb: 4 }}>
                  Sports Available
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {turfConfig.sports_available.map((sport, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Chip
                        label={sport}
                        sx={{
                          bgcolor: '#dbeafe',
                          color: '#2563eb',
                          fontWeight: 700,
                          px: 2,
                          py: 1,
                          fontSize: '1rem',
                          borderRadius: 3,
                          '&:hover': {
                            bgcolor: '#bfdbfe',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Card>
            </Box>
          </motion.div>
        )}

        {/* Floating Action Buttons - Modern */}
        <Fab 
          color="success"
          sx={{ 
            position: 'fixed', 
            bottom: 90, 
            right: 20,
            bgcolor: '#25D366',
            width: 64,
            height: 64,
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              bgcolor: '#22c55e',
              transform: 'scale(1.15)',
              boxShadow: '0 12px 40px rgba(37, 211, 102, 0.4)',
            }
          }}
          href="https://wa.me/+919843464180"
          target="_blank"
        >
          <WhatsAppIcon sx={{ fontSize: 32 }} />
        </Fab>
        
        <Fab 
          color="primary"
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            bgcolor: '#2563eb',
            width: 64,
            height: 64,
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              bgcolor: '#1d4ed8',
              transform: 'scale(1.15)',
              boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
            }
          }}
          href="tel:+919843464180"
        >
          <PhoneIcon sx={{ fontSize: 32 }} />
        </Fab>

        {/* Special Offers from API - Modern */}
        {turfConfig?.special_offers && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ my: 8 }}>
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  mb: 6, 
                  textAlign: 'center',
                  color: '#1e293b',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Featured Offers
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                {turfConfig.special_offers.map((offer, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      sx={{ 
                        p: 4,
                        bgcolor: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${index % 4 === 0 ? '#2563eb, #3b82f6' : 
                                                                index % 4 === 1 ? '#10b981, #059669' :
                                                                index % 4 === 2 ? '#f59e0b, #d97706' :
                                                                '#9c27b0, #7b1fa2'})`,
                        }
                      }}
                    >
                      <Typography variant="h5" gutterBottom sx={{ color: '#1e293b', fontWeight: 700 }}>
                        {offer.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                        {offer.description}
                      </Typography>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default Home;
