import React, { useEffect, useState } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Updated interfaces to reflect populated data from the backend
interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Tournament {
  id: string;
  name: string;
}

interface Match {
  id: string;
  tournamentId: Tournament;
  player1Id: Player;
  player2Id: Player;
  score1: number;
  score2: number;
  location: string;
  date: string;
}

interface MatchesPageProps {
  isAdminLoggedIn: boolean;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ isAdminLoggedIn }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Only one API call is needed now
      const matchesResponse = await api.get<Match[]>('/matches');
      setMatches(matchesResponse.data);
    } catch (err: any) {
      console.error("Error fetching matches data:", err);
      setError('Failed to fetch matches data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, []);

  const handleDeleteMatch = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await api.delete(`/matches/${id}`);
        fetchMatchesData(); // Refresh the list after deletion
      } catch (err: any) {
        console.error("Error deleting match:", err);
        setError('Failed to delete match.');
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        All Matches
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : matches.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>No matches recorded yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} md={6} key={match.id}>
              <Card elevation={2}>
                <CardContent>
                  {/* Use populated data directly */}
                  <Typography variant="h6">{match.tournamentId?.name || 'Unknown Tournament'}</Typography>
                  <Typography variant="body1" color="text.primary">
                    {`${match.player1Id?.firstName || 'Unknown'} ${match.player1Id?.lastName || 'Player'}`} {match.score1} - {match.score2} {`${match.player2Id?.firstName || 'Unknown'} ${match.player2Id?.lastName || 'Player'}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {match.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(match.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
                {isAdminLoggedIn && (
                  <CardActions>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMatch(match.id)}>
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

export default MatchesPage;
