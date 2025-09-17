import React, { useEffect, useState } from 'react';
import AddPlayerForm from '../components/AddPlayerForm';
import { api } from '../apiConfig';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, IconButton, Paper } from '@mui/material'; // Added Paper
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
    <Box sx={{ mt: 4 }}>
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
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      ) : players.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No players added yet.</Typography>
      ) : (
        <Paper elevation={2} sx={{ mt: 2 }}> {/* Wrap list in Paper for Material 3 feel */}
          <List>
            {players.map((player) => (
              <ListItem
                key={player.id}
                secondaryAction={
                  isAdminLoggedIn && (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePlayer(player.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={`${player.firstName} ${player.lastName} (${player.location})`}
                  secondary={`Ranking: ${player.ranking}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default PlayersPage;
