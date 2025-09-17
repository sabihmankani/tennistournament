import React, { useEffect, useState } from 'react';
import AddTournamentForm from '../components/AddTournamentForm'; // This will be converted to MUI later
import { api } from '../apiConfig';
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Tournament {
  id: string;
  name: string;
  groupIds: string[];
}

interface TournamentsPageProps {
  isAdminLoggedIn: boolean;
}

const TournamentsPage: React.FC<TournamentsPageProps> = ({ isAdminLoggedIn }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Tournament[]>('/tournaments');
      setTournaments(response.data);
    } catch (err: any) {
      console.error("Error fetching tournaments:", err);
      setError('Failed to fetch tournaments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleDeleteTournament = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await api.delete(`/tournaments/${id}`);
        fetchTournaments(); // Refresh the list after deletion
      } catch (err: any) {
        console.error("Error deleting tournament:", err);
        setError('Failed to delete tournament.');
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Tournaments
      </Typography>
      {isAdminLoggedIn && <AddTournamentForm onTournamentAdded={handleTournamentAdded} />}

      <Typography variant="h5" component="h3" sx={{ mt: 5, mb: 2 }}>
        Current Tournaments
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : tournaments.length === 0 ? (
        <Typography>No tournaments added yet.</Typography>
      ) : (
        <List>
          {tournaments.map((tournament) => (
            <ListItem
              key={tournament.id}
              secondaryAction={
                isAdminLoggedIn && (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTournament(tournament.id)}>
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText primary={tournament.name} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TournamentsPage;