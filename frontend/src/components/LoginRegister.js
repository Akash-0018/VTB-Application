import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  // Typography,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function LoginRegister({ onAuthSuccess }) {
  const [tab, setTab] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    team_name: '',
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => {
      setAlert({ show: false, message: '', severity: 'success' });
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: loginData.username,
        password: loginData.password,
      });

      // Store token and user data (use consistent localStorage key)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      // Call onAuthSuccess with token and user
      if (onAuthSuccess) {
        onAuthSuccess(response.data.token, response.data.user);
      }
      showAlert('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error.response?.data);
      showAlert(error.response?.data?.message || 'Login failed', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, registerData);

      // Store token and user data (consistent key)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      // Call onAuthSuccess with token and user
      if (onAuthSuccess) {
        onAuthSuccess(response.data.token, response.data.user);
      }
      showAlert('Registration successful!');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Registration failed', 'error');
    }
  };

  const handleLoginInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterInputChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      {alert.show && (
        <Alert
          severity={alert.severity}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {alert.message}
        </Alert>
      )}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          {tab === 0 ? (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={loginData.username}
                onChange={handleLoginInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                sx={{ mb: 3 }}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
                  },
                }}
              >
                Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleRegisterInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={registerData.name}
                onChange={handleRegisterInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Phone (WhatsApp)"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Team Name (Optional)"
                name="team_name"
                value={registerData.team_name}
                onChange={handleRegisterInputChange}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
                  },
                }}
              >
                Register
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister;
