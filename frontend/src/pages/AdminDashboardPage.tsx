import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleInitializeTournament = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/initialize-tournament', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      alert('Tournament initialized successfully!');
    } catch (error) {
      console.error("Error initializing tournament:", error);
      alert('Failed to initialize tournament.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <p>Welcome, Admin!</p>
      <button className="btn btn-danger me-2" onClick={handleLogout}>Logout</button>
      <button className="btn btn-success" onClick={handleInitializeTournament}>Initialize Pre-built Tournament</button>
      {/* Admin functionalities will go here */}
    </div>
  );
};

export default AdminDashboardPage;
