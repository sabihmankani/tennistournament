import React, { useState } from 'react';
import { api } from '../apiConfig';
import { Box, TextField, Button, Typography, Card, CardContent, FormControlLabel, Checkbox } from '@mui/material';

interface AddTournamentFormProps {
  onTournamentAdded: () => void;
}

const AddTournamentForm: React.FC<AddTournamentFormProps> = ({ onTournamentAdded }) => {
  const [tournamentName, setTournamentName] = useState('');
  const [isGroupBased, setIsGroupBased] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTournament = { name: tournamentName, isGroupBased };

    try {
      await api.post('/tournaments', newTournament);

      setTournamentName('');
      setIsGroupBased(false); // Reset checkbox
      onTournamentAdded(); // Notify parent component to refresh tournament list
    } catch (error) {
      console.error("Error adding tournament:", error);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 4, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h3" gutterBottom>
          Add New Tournament
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tournament Name"
              id="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              required
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isGroupBased}
                  onChange={(e) => setIsGroupBased(e.target.checked)}
                  id="isGroupBased"
                />
              }
              label="Group Based Tournament"
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" size="large">
            Add Tournament
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTournamentForm;
