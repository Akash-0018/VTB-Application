import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a', // Clean black background
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid #333333',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and About */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="span"
                sx={{
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: 'white', // ✅ White logo text
                  mr: 1
                }}
              >
                TurfZone
              </Box>
            </Box>
            <Typography variant="body2" paragraph sx={{ color: 'white', lineHeight: 1.6 }}>
              Your premier destination for sports facility bookings.<br />
              Experience top-quality turfs and courts for all your sporting needs.
            </Typography>
            
            {/* Social Media Links - Brand Colors on Hover */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'white', // ✅ White header text
                fontWeight: 600, 
                mt: 3, 
                mb: 2,
                borderBottom: '2px solid #2563eb', // ✅ Blue underline
                paddingBottom: '8px',
                display: 'inline-block'
              }}
            >
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* WhatsApp - Brand color on hover */}
              <IconButton
                color="inherit"
                aria-label="WhatsApp"
                href="https://wa.me/+919843464180"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white', // ✅ White by default
                  backgroundColor: 'transparent',
                  border: 'none',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#25D366', // ✅ WhatsApp green on hover
                    backgroundColor: 'transparent',
                    transform: 'scale(1.2)',
                  }
                }}
              >
                <WhatsAppIcon fontSize="large" />
              </IconButton>

              {/* Facebook - Brand color on hover */}
              <IconButton
                color="inherit"
                aria-label="Facebook"
                href="https://facebook.com/yourturfzone"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white',
                  backgroundColor: 'transparent',
                  border: 'none',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#1877F2', // ✅ Facebook blue on hover
                    backgroundColor: 'transparent',
                    transform: 'scale(1.2)',
                  }
                }}
              >
                <FacebookIcon fontSize="large" />
              </IconButton>

              {/* Instagram - Brand color on hover */}
              <IconButton
                color="inherit"
                aria-label="Instagram"
                href="https://instagram.com/yourturfzone"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white',
                  backgroundColor: 'transparent',
                  border: 'none',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#E4405F', // ✅ Instagram pink on hover
                    backgroundColor: 'transparent',
                    transform: 'scale(1.2)',
                  }
                }}
              >
                <InstagramIcon fontSize="large" />
              </IconButton>

              {/* Twitter - Brand color on hover */}
              <IconButton
                color="inherit"
                aria-label="Twitter"
                href="https://twitter.com/yourturfzone"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white',
                  backgroundColor: 'transparent',
                  border: 'none',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#1DA1F2', // ✅ Twitter blue on hover
                    backgroundColor: 'transparent',
                    transform: 'scale(1.2)',
                  }
                }}
              >
                <TwitterIcon fontSize="large" />
              </IconButton>

              {/* LinkedIn - Brand color on hover */}
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                href="https://linkedin.com/company/yourturfzone"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white',
                  backgroundColor: 'transparent',
                  border: 'none',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#0077B5', // ✅ LinkedIn blue on hover
                    backgroundColor: 'transparent',
                    transform: 'scale(1.2)',
                  }
                }}
              >
                <LinkedInIcon fontSize="large" />
              </IconButton>
            </Box>
          </Grid>

          {/* Location Details */}
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'white', // ✅ White header text
                fontWeight: 600,
                borderBottom: '2px solid #2563eb', // ✅ Blue underline
                paddingBottom: '8px',
                display: 'inline-block'
              }}
            >
              Our Location
            </Typography>
            
            {/* Address */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1, mt: 2 }}>
              <LocationOnIcon 
                fontSize="small" 
                sx={{ color: 'white', mt: 0.2 }} // ✅ White icon
              />
              <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.5 }}>
                123 Sports Complex,<br />
                Stadium Road, City Center,<br />
                Mumbai, Maharashtra - 400001
              </Typography>
            </Box>

            {/* Google Maps Navigation Link */}
            <Box sx={{ mb: 2 }}>
              <Link
                href="https://maps.google.com/?q=TurfZone+Sports+Complex+Mumbai"
                target="_blank"
                rel="noopener"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#2563eb',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #2563eb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: '#2563eb',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <DirectionsIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Get Directions
                </Typography>
              </Link>
            </Box>

            {/* Quick Links */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'white', // ✅ White header text
                fontWeight: 600, 
                mt: 3,
                borderBottom: '2px solid #2563eb', // ✅ Blue underline
                paddingBottom: '8px',
                display: 'inline-block'
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  color: 'white', // ✅ White text
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { 
                    color: '#2563eb',
                    textDecoration: 'underline',
                  }
                }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to="/login"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  color: 'white', // ✅ White text
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { 
                    color: '#2563eb',
                    textDecoration: 'underline',
                  }
                }}
              >
                Login/Register
              </Link>
              <Link
                component={RouterLink}
                to="/dashboard"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  color: 'white', // ✅ White text
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { 
                    color: '#2563eb',
                    textDecoration: 'underline',
                  }
                }}
              >
                Dashboard
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'white', // ✅ White header text
                fontWeight: 600,
                borderBottom: '2px solid #2563eb', // ✅ Blue underline
                paddingBottom: '8px',
                display: 'inline-block'
              }}
            >
              Contact Us
            </Typography>
            
            {/* WhatsApp Contact */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <WhatsAppIcon 
                fontSize="small" 
                sx={{ color: 'white' }} // ✅ White icon
              />
              <Link
                href="https://wa.me/+919843464180"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white', // ✅ White text
                  textDecoration: 'none',
                  '&:hover': { 
                    color: '#25D366', // ✅ WhatsApp green on hover
                    textDecoration: 'underline',
                  }
                }}
              >
                <Typography variant="body2">
                  +91 9843464180 (WhatsApp)
                </Typography>
              </Link>
            </Box>

            {/* Phone Contact */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon 
                fontSize="small" 
                sx={{ color: 'white' }} // ✅ White icon
              /> 
              <Link
                href="tel:+919843464180"
                sx={{
                  color: 'white', // ✅ White text
                  textDecoration: 'none',
                  '&:hover': { 
                    color: '#2563eb', 
                    textDecoration: 'underline',
                  }
                }}
              >
                <Typography variant="body2">
                  +91 9843464180
                </Typography>
              </Link>
            </Box>

            {/* Email Contact */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon 
                fontSize="small" 
                sx={{ color: 'white' }} // ✅ White icon
              />
              <Link
                href="mailto:contact@turfzone.com"
                sx={{
                  color: 'white', // ✅ White text
                  textDecoration: 'none',
                  '&:hover': { 
                    color: '#f59e0b', 
                    textDecoration: 'underline',
                  }
                }}
              >
                <Typography variant="body2">
                  contact@turfzone.com
                </Typography>
              </Link>
            </Box>

            {/* Operating Hours */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: 'white', // ✅ White header text
                fontWeight: 600, 
                mt: 3,
                borderBottom: '2px solid #2563eb', // ✅ Blue underline
                paddingBottom: '8px',
                display: 'inline-block'
              }}
            >
              Operating Hours
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.5, mt: 2 }}>
              Monday - Sunday<br />
              6:00 AM - 12:00 AM<br />
              <Box component="span" sx={{ color: '#f59e0b' }}>
                Lunch Break: 12:00 PM - 2:00 PM
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Section */}
      <Box
        sx={{
          bgcolor: '#0d0d0d',
          py: 3,
          mt: 4,
          textAlign: 'center',
          borderTop: '1px solid #333333',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
            © {new Date().getFullYear()} TurfZone. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#888888', mt: 1, display: 'block' }}>
            Built with ❤️ for sports enthusiasts
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
