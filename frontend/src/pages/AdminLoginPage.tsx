import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post('/admin/login', { username, password });

      if (response.status === 200) {
        onLoginSuccess();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      console.error("Error during login:", err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Card elevation={3}> {/* Added elevation for Material 3 feel */}
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Admin Login
              </Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    variant="outlined" // Material 3 default
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant="outlined" // Material 3 default
                  />
                </Box>
                <Button type="submit" variant="contained" color="primary" fullWidth size="large"> {/* Added size for Material 3 feel */}
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminLoginPage;