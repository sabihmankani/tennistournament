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

interface MuiNavbarProps {
  isAdminLoggedIn: boolean;
  onLoginStatusChange: (status: boolean) => void;
}

const MuiNavbar: React.FC<MuiNavbarProps> = ({ isAdminLoggedIn, onLoginStatusChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    onLoginStatusChange(false);
    navigate('/');
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const navItems = [
    { name: 'Home', path: '/', adminOnly: false },
    { name: 'Players', path: '/players', adminOnly: true },
    { name: 'Tournaments', path: '/tournaments', adminOnly: true },
    { name: 'Groups', path: '/groups', adminOnly: true },
    { name: 'Add Match', path: '/add-match', adminOnly: false },
    { name: 'Matches', path: '/matches', adminOnly: false },
    { name: 'Rankings', path: '/rankings', adminOnly: false },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="sticky" 
        color="transparent" 
        elevation={0}
        sx={{ backdropFilter: 'blur(20px)', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Tennis Championship
            </Link>
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navItems.map((item) => (
              (!item.adminOnly || isAdminLoggedIn) && (
                <Button 
                  key={item.name} 
                  variant={isActive(item.path) ? "contained" : "text"}
                  color="inherit" 
                  component={Link} 
                  to={item.path}
                  sx={{ my: 1, mx: 1.5 }}
                >
                  {item.name}
                </Button>
              )
            ))}
            {isAdminLoggedIn ? (
              <Button color="inherit" onClick={handleLogout} variant="outlined" sx={{ my: 1, mx: 1.5 }}>
                Logout
              </Button>
            ) : (
              <Button color="inherit" component={Link} to="/admin" variant="outlined" sx={{ my: 1, mx: 1.5 }}>
                Admin Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 280, bgcolor: 'background.default' }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {navItems.map((item) => (
              (!item.adminOnly || isAdminLoggedIn) && (
                <ListItem key={item.name} disablePadding>
                  <ListItemButton component={Link} to={item.path} selected={isActive(item.path)}>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              )
            ))}
            <ListItem disablePadding>
              {isAdminLoggedIn ? (
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              ) : (
                <ListItemButton component={Link} to="/admin">
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