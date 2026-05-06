import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import Divider from '@mui/material/Divider';

interface MuiNavbarProps {
  isAdminLoggedIn: boolean;
  onLoginStatusChange: (status: boolean) => void;
}

const publicNav = [
  { name: 'Home', path: '/' },
  { name: 'Submit Score', path: '/add-match' },
  { name: 'Results', path: '/matches' },
  { name: 'Standings', path: '/rankings' },
];

const adminNav = [
  { name: 'Players', path: '/players' },
  { name: 'Admin', path: '/admin/dashboard' },
];

const MuiNavbar: React.FC<MuiNavbarProps> = ({ isAdminLoggedIn, onLoginStatusChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLoginStatusChange(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const navItems = isAdminLoggedIn ? [...publicNav, ...adminNav] : publicNav;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top agency banner */}
      <Box
        sx={{
          bgcolor: '#050a05',
          borderBottom: '1px solid #1a2e1a',
          py: 0.5,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', letterSpacing: 1 }}>
          Designed and Developed by{' '}
          <Box
            component="a"
            href="https://magency.co"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: '#c8ff00', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Magency Consultants
          </Box>
        </Typography>
      </Box>

      <AppBar
        position="sticky"
        sx={{
          bgcolor: '#0d2e0d',
          borderBottom: '1px solid #1e4a1e',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1, display: { md: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 3 }}>
            <SportsTennisIcon sx={{ color: '#c8ff00', fontSize: 22 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 900, color: '#c8ff00', lineHeight: 1.1, fontSize: '0.8rem', letterSpacing: 1 }}>
                SBP TENNIS LEAGUE
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(200,255,0,0.5)', lineHeight: 1, fontSize: '0.6rem', letterSpacing: 2 }}>
                2026
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 0.5 }}>
            {publicNav.map(item => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                size="small"
                sx={{
                  color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.7)',
                  fontWeight: isActive(item.path) ? 700 : 400,
                  bgcolor: isActive(item.path) ? 'rgba(200,255,0,0.12)' : 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  '&:hover': { bgcolor: 'rgba(200,255,0,0.08)', color: '#c8ff00' },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            {isAdminLoggedIn && adminNav.map(item => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                size="small"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#c8ff00' } }}
              >
                {item.name}
              </Button>
            ))}
            {isAdminLoggedIn ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleLogout}
                sx={{ borderColor: 'rgba(239,83,80,0.5)', color: '#ef5350', ml: 1, '&:hover': { borderColor: '#ef5350' } }}
              >
                Logout
              </Button>
            ) : (
              <Button
                size="small"
                component={Link}
                to="/admin"
                sx={{ color: 'rgba(255,255,255,0.25)', ml: 1, fontSize: '0.7rem', '&:hover': { color: 'rgba(255,255,255,0.6)' } }}
              >
                Admin
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{ width: 260, bgcolor: '#0a0f0a', height: '100%' }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #1e3a1e' }}>
            <SportsTennisIcon sx={{ color: '#c8ff00' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#c8ff00' }}>SBP Tennis League</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>Soul Brothers Canada 2026</Typography>
            </Box>
          </Box>
          <List>
            {navItems.map(item => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.7)',
                    '&.Mui-selected': { bgcolor: 'rgba(200,255,0,0.1)' },
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ borderColor: '#1e3a1e', my: 1 }} />
            <ListItem disablePadding>
              {isAdminLoggedIn ? (
                <ListItemButton onClick={handleLogout} sx={{ color: '#ef5350' }}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              ) : (
                <ListItemButton component={Link} to="/admin" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                  <ListItemText primary="Admin Login" />
                </ListItemButton>
              )}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MuiNavbar;
