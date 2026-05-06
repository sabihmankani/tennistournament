import React, { useState } from 'react';
import { api } from '../apiConfig';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useAppTheme } from '../context/ThemeContext';

interface AddPlayerFormProps {
  onPlayerAdded: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onPlayerAdded }) => {
  const { c } = useAppTheme();
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
    '& .MuiInputLabel-root': { color: c.textMuted },
    '& .MuiInputLabel-root.Mui-focused': { color: c.green },
    '& .MuiOutlinedInput-root': {
      color: c.text,
      bgcolor: c.surface,
      '& fieldset': { borderColor: c.border },
      '&:hover fieldset': { borderColor: c.borderStrong },
      '&.Mui-focused fieldset': { borderColor: c.green },
    },
  };

  return (
    <Box sx={{ bgcolor: c.cardBg, borderRadius: 2.5, border: `1px solid ${c.border}`, p: 2.5, mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
        <PersonAddOutlinedIcon sx={{ color: c.green, fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: c.text, fontSize: '0.95rem' }}>Add New Player</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.8rem' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1.5, fontSize: '0.8rem' }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField size="small" label="First Name" value={firstName}
            onChange={e => setFirstName(e.target.value)} required sx={{ flex: 1, minWidth: 130, ...fieldSx }} />
          <TextField size="small" label="Last Name" value={lastName}
            onChange={e => setLastName(e.target.value)} required sx={{ flex: 1, minWidth: 130, ...fieldSx }} />
          <Button type="submit" variant="contained" disabled={submitting}
            sx={{ bgcolor: '#1B5E20', color: '#fff', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#155216' }, boxShadow: 'none', whiteSpace: 'nowrap' }}>
            {submitting ? 'Adding…' : 'Add Player'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddPlayerForm;
