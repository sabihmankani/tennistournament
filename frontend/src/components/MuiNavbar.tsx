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
  { name: 'Leaderboard', path: '/rankings' },
];

const adminNav = [
  { name: 'Players', path: '/players' },
  { name: 'Admin Dashboard', path: '/admin/dashboard' },
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

  const DrawerContent = () => (
    <Box sx={{ width: 280 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsTennisIcon color="success" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Soul Brothers Pakistan</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map(item => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton component={Link} to={item.path} selected={isActive(item.path)}>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          {isAdminLoggedIn ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
            </ListItemButton>
          ) : (
            <ListItemButton component={Link} to="/admin">
              <ListItemText primary="Admin Login" primaryTypographyProps={{ color: 'text.secondary' }} />
            </ListItemButton>
          )}
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: 'blur(20px)', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.9)' }}
      >
        <Toolbar>
          <IconButton
            size="large"
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
            <SportsTennisIcon color="success" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.dark', display: { xs: 'none', sm: 'block' } }}>
              Soul Brothers Pakistan
            </Typography>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 0.5 }}>
            {publicNav.map(item => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                variant={isActive(item.path) ? 'contained' : 'text'}
                color={isActive(item.path) ? 'success' : 'inherit'}
                size="small"
                sx={{ fontWeight: isActive(item.path) ? 700 : 400 }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* Admin section */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            {isAdminLoggedIn && adminNav.map(item => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                variant="text"
                color="inherit"
                size="small"
              >
                {item.name}
              </Button>
            ))}
            {isAdminLoggedIn ? (
              <Button variant="outlined" color="error" size="small" onClick={handleLogout} sx={{ ml: 1 }}>
                Logout
              </Button>
            ) : (
              <Button variant="text" color="inherit" size="small" component={Link} to="/admin" sx={{ ml: 1, opacity: 0.5 }}>
                Admin
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerContent />
      </Drawer>
    </Box>
  );
};

export default MuiNavbar;
