import React, { useEffect, useState } from 'react';
import AddPlayerForm from '../components/AddPlayerForm';
import { api } from '../apiConfig';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface PlayersPageProps {
  isAdminLoggedIn: boolean;
}

const PlayersPage: React.FC<PlayersPageProps> = ({ isAdminLoggedIn }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
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
      fetchPlayers();
    } catch {
      setError('Failed to remove player.');
    }
  };

  const initials = (p: Player) =>
    `${p.firstName[0] || ''}${p.lastName[0] || ''}`.toUpperCase();

  const avatarColor = (name: string) => {
    const colors = ['#2e7d32', '#1565c0', '#6a1b9a', '#c62828', '#e65100', '#00695c', '#283593'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <PeopleIcon color="success" />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Players
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {players.length} player{players.length !== 1 ? 's' : ''} registered in the tournament
      </Typography>

      {isAdminLoggedIn && <AddPlayerForm onPlayerAdded={fetchPlayers} />}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : players.length === 0 ? (
        <Alert severity="info">No players registered yet. Add players using the form above.</Alert>
      ) : (
        <Grid container spacing={2}>
          {players.map(player => (
            <Grid item xs={12} sm={6} md={4} key={player.id}>
              <Card elevation={2} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: avatarColor(player.firstName),
                    width: 48,
                    height: 48,
                    ml: 1,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {initials(player)}
                </Avatar>
                <CardContent sx={{ flex: 1, py: '12px !important' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {player.firstName} {player.lastName}
                  </Typography>
                </CardContent>
                {isAdminLoggedIn && (
                  <CardActions sx={{ p: 0, pr: 1 }}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="remove player"
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
  );
};

export default PlayersPage;
