import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const style = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/tennis-court.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: `calc(100vh - ${isSmallScreen ? '56px' : '64px'})`, // Adjust for AppBar height based on screen size
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    padding: '20px',
    textAlign: 'center', // Center text for better mobile experience
  };

  return (
    <Box sx={style}>
      <Typography variant={isSmallScreen ? "h4" : "h2"} component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        Tennis Championship of Toronto Brothers
      </Typography>
      <Typography variant={isSmallScreen ? "h6" : "h5"} component="p" sx={{ mb: 4 }}>
        The ultimate tournament experience.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 5 }}>
        Follow the action, view match results, and see who comes out on top.
      </Typography>
      <Button variant="contained" size="large" component={Link} to="/rankings" sx={{ textDecoration: 'none' }}>
        View Player Rankings
      </Button>
    </Box>
  );
};

export default HomePage;
