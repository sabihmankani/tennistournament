import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Container } from '@mui/material';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isAdminLoggedIn) {
      navigate('/admin'); // Redirect to login if not logged in
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3 }}> {/* Added maxWidth and padding for better layout */}
      <Typography variant="h4" component="h2" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 3 }}> {/* Added margin bottom */}
        Welcome, Admin!
      </Typography>
      <Button variant="contained" color="error" onClick={handleLogout} size="large"> {/* Added size for Material 3 feel */}
        Logout
      </Button>
      {/* Admin functionalities will go here */}
    </Container>
  );
};

export default AdminDashboardPage;
