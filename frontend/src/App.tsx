import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MuiNavbar from './components/MuiNavbar';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import AddMatchPage from './pages/AddMatchPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RankingsPage from './pages/RankingsPage';
import MatchesPage from './pages/MatchesPage';
import { AppThemeProvider } from './context/ThemeContext';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const handleLoginStatusChange = (status: boolean) => {
    setIsAdminLoggedIn(status);
    localStorage.setItem('isAdminLoggedIn', String(status));
  };

  return (
    <AppThemeProvider>
      <div className="App">
        <MuiNavbar isAdminLoggedIn={isAdminLoggedIn} onLoginStatusChange={handleLoginStatusChange} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-match" element={<AddMatchPage />} />
          <Route path="/matches" element={<MatchesPage isAdminLoggedIn={isAdminLoggedIn} />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/players" element={<PlayersPage isAdminLoggedIn={isAdminLoggedIn} />} />
          <Route path="/admin" element={<AdminLoginPage onLoginSuccess={() => handleLoginStatusChange(true)} />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </div>
    </AppThemeProvider>
  );
}

export default App;
