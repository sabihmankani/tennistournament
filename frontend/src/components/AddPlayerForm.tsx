import React, { useState } from 'react';
import { api } from '../apiConfig';
import { Box, TextField, Button, Typography, Card, CardContent, Alert, Grid } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface AddPlayerFormProps {
  onPlayerAdded: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onPlayerAdded }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    setSubmitting(true);
    try {
      await api.post('/players', { firstName: firstName.trim(), lastName: lastName.trim() });
      setSuccess(`${firstName} ${lastName} added!`);
      setFirstName(''); setLastName('');
      onPlayerAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add player.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldSx = {
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': { borderColor: '#2e4a2e' },
      '&:hover fieldset': { borderColor: '#4caf50' },
    },
  };

  return (
    <Card sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonAddIcon sx={{ color: '#c8ff00' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#c8ff00' }}>Add New Player</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="First Name" value={firstName}
                onChange={e => setFirstName(e.target.value)} required sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Last Name" value={lastName}
                onChange={e => setLastName(e.target.value)} required sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button type="submit" variant="contained" fullWidth disabled={submitting}
                sx={{ bgcolor: '#c8ff00', color: '#0a1a0a', fontWeight: 700, '&:hover': { bgcolor: '#b0e000' } }}>
                {submitting ? 'Adding...' : 'Add Player'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPlayerForm;
