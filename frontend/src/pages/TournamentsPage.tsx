import React, { useEffect, useState } from 'react';
import AddTournamentForm from '../components/AddTournamentForm';
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

  const handleTournamentAdded = () => {
    fetchTournaments(); // Refresh the list after a tournament is added
  };

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
    <Container sx={{ mt: 4 }}>
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
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : tournaments.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>No tournaments added yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} sm={6} md={4} key={tournament.id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6">{tournament.name}</Typography>
                </CardContent>
                {isAdminLoggedIn && (
                  <CardActions>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTournament(tournament.id)}>
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

export default TournamentsPage;
