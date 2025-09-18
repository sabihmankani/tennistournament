import React, { useState } from 'react';
import { api } from '../apiConfig';
import { Box, TextField, Button, Typography, Card, CardContent, Alert } from '@mui/material';

interface AddPlayerFormProps {
  onPlayerAdded: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onPlayerAdded }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [ranking, setRanking] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const newPlayer = { firstName, lastName, location, ranking };

    try {
      await api.post('/players', newPlayer);

      setFirstName('');
      setLastName('');
      setLocation('');
      setRanking(0);
      setSuccess('Player added successfully!');
      onPlayerAdded(); // Notify parent component to refresh player list
    } catch (err: any) {
      console.error("Error adding player:", err.response ? err.response.data : err.message);
      setError(err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Failed to add player.');
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 4, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h3" gutterBottom>
          Add New Player
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              variant="outlined"
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
              variant="outlined"
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
              variant="outlined"
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
              variant="outlined"
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" size="large">
            Add Player
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPlayerForm;