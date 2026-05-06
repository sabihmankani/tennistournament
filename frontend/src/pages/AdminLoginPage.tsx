import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { useAppTheme } from '../context/ThemeContext';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const { c } = useAppTheme();
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: c.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        transition: 'background-color 0.2s',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              bgcolor: '#1B5E20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <SportsTennisIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: c.text }}>Admin Login</Typography>
          <Typography sx={{ color: c.textMuted, fontSize: '0.8rem', mt: 0.25 }}>SBP Summer Tennis League 2026</Typography>
        </Box>

        <Box
          sx={{
            bgcolor: c.cardBg,
            borderRadius: 3,
            border: `1px solid ${c.border}`,
            p: 3,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              sx={{ mb: 2, ...fieldSx }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              sx={{ mb: 2.5, ...fieldSx }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={<LockOutlinedIcon />}
              sx={{
                bgcolor: '#1B5E20',
                color: '#fff',
                fontWeight: 700,
                py: 1.25,
                textTransform: 'none',
                fontSize: '0.95rem',
                borderRadius: 2,
                '&:hover': { bgcolor: '#155216' },
                boxShadow: 'none',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLoginPage;
