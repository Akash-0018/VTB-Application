import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const Navbar = ({ isAuthenticated, isAdmin, onLogout }) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'white',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <SportsSoccerIcon 
            sx={{ 
              color: '#2563eb', 
              mr: 1, 
              fontSize: 32,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(360deg)',
                color: '#1d4ed8',
              }
            }} 
          />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              color: '#1e293b',
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: 0.5,
              fontSize: '1.5rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#2563eb',
              }
            }}
          >
            TurfZone
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: '#64748b',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                  }
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{
                  background: '#2563eb',
                  color: 'white !important', // ✅ FIXED: Explicit white text
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    background: '#1d4ed8',
                    color: 'white !important', // ✅ FIXED: White text on hover
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              {isAdmin && (
                <>
                  <Button
                    component={RouterLink}
                    to="/admin-dashboard"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        color: '#f59e0b',
                        backgroundColor: '#fef3c7',
                      }
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/admin-database"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        color: '#8b5cf6',
                        backgroundColor: '#f3e8ff',
                      }
                    }}
                  >
                    Database
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                onClick={onLogout}
                sx={{
                  color: '#dc2626',
                  borderColor: '#dc2626',
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    color: 'white !important', // ✅ FIXED: White text on hover
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
