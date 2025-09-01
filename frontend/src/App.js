import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Box, CssBaseline, Alert } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import LoginRegister from './components/LoginRegister';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDatabase from './components/AdminDatabase';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function AppContent() {
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(userRole === 'admin');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.is_admin ? 'admin' : 'user');
    localStorage.setItem('userData', JSON.stringify(user));
    setIsAuthenticated(true);
    setIsAdmin(user.is_admin);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 9 },
          pb: 4,
          mt: 2,
        }}
      >
        <Container maxWidth="xl">
          <AnimatePresence mode="wait" exitBeforeEnter>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="error"
              >
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="message"
              >
                <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              </motion.div>
            )}
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route
                path="/"
                element={<Home isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}
              />
              <Route
                path="/login"
                element={
                  isAuthenticated
                    ? isAdmin
                      ? <Navigate to="/admin-dashboard" />
                      : <Navigate to="/user-dashboard" />
                    : <LoginRegister onAuthSuccess={handleLogin} setError={setError} />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/user-dashboard"
                element={
                  isAuthenticated
                    ? <UserDashboard onLogout={handleLogout} setError={setError} setMessage={setMessage} />
                    : <Navigate to="/" />
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  isAuthenticated && isAdmin
                    ? <AdminDashboard onLogout={handleLogout} setError={setError} setMessage={setMessage} />
                    : <Navigate to="/" />
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated && isAdmin
                    ? <Dashboard />
                    : <Navigate to="/" />
                }
              />
              <Route
                path="/admin-database"
                element={
                  isAuthenticated && isAdmin
                    ? <AdminDatabase />
                    : <Navigate to="/" />
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </Container>
      </Box>

      {/* Footer only shows on Home page */}
      {location.pathname === '/' && <Footer />}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
