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
  Alert 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  ranking: number;
}

interface PlayersPageProps {
  isAdminLoggedIn: boolean;
}

const PlayersPage: React.FC<PlayersPageProps> = ({ isAdminLoggedIn }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Player[]>('/players');
      setPlayers(response.data);
    } catch (err: any) {
      console.error("Error fetching players:", err);
      setError('Failed to fetch players.');
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePlayerAdded = () => {
    fetchPlayers(); // Refresh the list after a player is added
  };

  const handleRemovePlayer = async (id: string) => {
    try {
      await api.delete(`/players/${id}`);
      fetchPlayers(); // Refresh the list after a player is removed
    } catch (err: any) {
      console.error("Error removing player:", err);
      setError('Failed to remove player.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Players
      </Typography>
      {isAdminLoggedIn && <AddPlayerForm onPlayerAdded={handlePlayerAdded} />}

      <Typography variant="h5" component="h3" sx={{ mt: 5, mb: 2 }}>
        Current Players
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : players.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>No players added yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {players.map((player) => (
            <Grid item xs={12} sm={6} md={4} key={player.id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6">{`${player.firstName} ${player.lastName}`}</Typography>
                  <Typography color="text.secondary">{player.location}</Typography>
                  <Typography>Ranking: {player.ranking}</Typography>
                </CardContent>
                {isAdminLoggedIn && (
                  <CardActions>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePlayer(player.id)}>
                      <DeleteIcon />
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
