import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Box, TextField, Button, Typography, Card, CardContent, Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      if (res.status === 200 && res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        onLoginSuccess();
        navigate('/admin/dashboard');
      }
    } catch {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
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
    <Box
      sx={{
        minHeight: '100vh', bgcolor: '#0a0f0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SportsTennisIcon sx={{ color: '#c8ff00', fontSize: 48 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#c8ff00', mt: 1 }}>Admin Login</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>SBP Summer Tennis League 2026</Typography>
        </Box>

        <Card sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Username" value={username}
                onChange={e => setUsername(e.target.value)} required sx={{ mb: 2.5, ...fieldSx }}
              />
              <TextField fullWidth label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required sx={{ mb: 3, ...fieldSx }}
              />
              <Button
                type="submit" variant="contained" fullWidth size="large"
                disabled={loading} startIcon={<LockIcon />}
                sx={{
                  bgcolor: '#c8ff00', color: '#0a1a0a', fontWeight: 800,
                  '&:hover': { bgcolor: '#b0e000' },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminLoginPage;
