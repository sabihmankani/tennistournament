import React, { useState } from 'react';
import { api } from '../apiConfig';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';

interface AddPlayerFormProps {
  onPlayerAdded: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onPlayerAdded }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [ranking, setRanking] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer = { firstName, lastName, location, ranking };

    try {
      await api.post('/players', newPlayer);

      setFirstName('');
      setLastName('');
      setLocation('');
      setRanking(0);
      onPlayerAdded(); // Notify parent component to refresh player list
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  return (
    <Card sx={{ p: 4, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h3" gutterBottom>
          Add New Player
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Last Name"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Location"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Ranking"
              id="ranking"
              type="number"
              value={ranking}
              onChange={(e) => setRanking(parseInt(e.target.value))}
              required
            />
          </Box>
          <Button type="submit" variant="contained" color="primary">
            Add Player
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPlayerForm;
