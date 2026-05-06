import React, { useEffect, useState } from 'react';
import AddPlayerForm from '../components/AddPlayerForm';
import { api } from '../apiConfig';
import {
  Box, Typography, CircularProgress, IconButton,
  Container, Grid, Card, CardContent, CardActions, Alert, Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

interface Player { id: string; firstName: string; lastName: string; }
interface PlayersPageProps { isAdminLoggedIn: boolean; }

const COLORS = ['#2e7d32', '#1565c0', '#6a1b9a', '#c62828', '#e65100', '#00695c', '#283593', '#ad1457', '#4e342e'];

const PlayersPage: React.FC<PlayersPageProps> = ({ isAdminLoggedIn }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await api.get<Player[]>('/players');
      setPlayers(res.data);
    } catch {
      setError('Failed to fetch players.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the tournament?`)) return;
    try {
      await api.delete(`/players/${id}`);
      setPlayers(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to remove player.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f0a' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #0d2e0d, #1a4d1a)', borderBottom: '2px solid #4caf50', py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon sx={{ color: '#c8ff00' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#c8ff00' }}>Players</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
          {players.length} player{players.length !== 1 ? 's' : ''} registered
        </Typography>
      </Box>

      <Container sx={{ py: 4 }}>
        {isAdminLoggedIn && <AddPlayerForm onPlayerAdded={fetchPlayers} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: '#c8ff00' }} />
          </Box>
        ) : players.length === 0 ? (
          <Alert severity="info" sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', color: 'rgba(255,255,255,0.6)' }}>
            No players added yet.{isAdminLoggedIn && ' Use the form above to add players.'}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {players.map((player, i) => (
              <Grid item xs={12} sm={6} md={4} key={player.id}>
                <Card sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', display: 'flex', alignItems: 'center', p: 1 }}>
                  <Avatar sx={{ bgcolor: COLORS[i % COLORS.length], width: 44, height: 44, ml: 1, fontWeight: 700 }}>
                    {player.firstName[0]}{player.lastName[0]}
                  </Avatar>
                  <CardContent sx={{ flex: 1, py: '10px !important' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      {player.firstName} {player.lastName}
                    </Typography>
                  </CardContent>
                  {isAdminLoggedIn && (
                    <CardActions sx={{ p: 0, pr: 1 }}>
                      <IconButton
                        size="small" color="error"
                        onClick={() => handleRemove(player.id, `${player.firstName} ${player.lastName}`)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default PlayersPage;
