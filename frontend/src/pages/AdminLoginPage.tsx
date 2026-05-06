import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  Alert,
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
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SportsTennisIcon color="success" sx={{ fontSize: 48 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>Admin Login</Typography>
        <Typography variant="body2" color="text.secondary">Soul Brothers Pakistan Tennis</Typography>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2.5 }}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={<LockIcon />}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminLoginPage;
