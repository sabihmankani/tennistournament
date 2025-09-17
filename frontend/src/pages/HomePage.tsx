import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const HomePage: React.FC = () => {
  const style = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/tennis-court.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: 'calc(100vh - 64px)', // Adjust for AppBar height (default 64px)
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    padding: '20px',
  };

  return (
    <Box sx={style}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        Tennis Championship of Toronto Brothers
      </Typography>
      <Typography variant="h5" component="p" sx={{ mb: 4 }}>
        The ultimate tournament experience.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 5 }}>
        Follow the action, view match results, and see who comes out on top.
      </Typography>
      <Button variant="contained" size="large" component={Link} to="/rankings">
        View Player Rankings
      </Button>
    </Box>
  );
};

export default HomePage;
