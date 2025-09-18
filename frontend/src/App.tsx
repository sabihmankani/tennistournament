import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// import Navbar from './components/Navbar'; // Will replace with MUI AppBar

import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import TournamentsPage from './pages/TournamentsPage';
import AddMatchPage from './pages/AddMatchPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RankingsPage from './pages/RankingsPage';
import MatchesPage from './pages/MatchesPage';
import GroupsPage from './pages/GroupsPage';
import GroupMembersPage from './pages/GroupMembersPage';
import MuiNavbar from './components/MuiNavbar';
import { Container } from '@mui/material'; // Import Container

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const storedLoginStatus = localStorage.getItem('isAdminLoggedIn');
    return storedLoginStatus === 'true';
  });

  const handleLoginStatusChange = (status: boolean) => {
    setIsAdminLoggedIn(status);
    localStorage.setItem('isAdminLoggedIn', String(status));
  };

  return (
    <div className="App">
      <MuiNavbar isAdminLoggedIn={isAdminLoggedIn} onLoginStatusChange={handleLoginStatusChange} />
      <Container maxWidth="lg" sx={{ mt: 4 }}> {/* Replaced div with MUI Container */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage isAdminLoggedIn={isAdminLoggedIn} />} />
          <Route path="/tournaments" element={<TournamentsPage isAdminLoggedIn={isAdminLoggedIn} />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/add-match" element={<AddMatchPage />} />
          <Route path="/matches" element={<MatchesPage isAdminLoggedIn={isAdminLoggedIn} />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/group-members" element={<GroupMembersPage />} />
          <Route path="/admin" element={<AdminLoginPage onLoginSuccess={() => handleLoginStatusChange(true)} />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
