import React, { useEffect, useState } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Paper // Added Paper for consistent styling
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Match {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  location: string;
  date: string;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Tournament {
  id: string;
  name: string;
}

interface MatchesPageProps {
  isAdminLoggedIn: boolean;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ isAdminLoggedIn }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const matchesResponse = await api.get<Match[]>('/matches');
      setMatches(matchesResponse.data);

      const playersResponse = await api.get<Player[]>('/players');
      setPlayers(playersResponse.data);

      const tournamentsResponse = await api.get<Tournament[]>('/tournaments');
      setTournaments(tournamentsResponse.data);

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

  const getPlayerName = (id: string) => {
    const player = players.find(p => p.id === id);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  const getTournamentName = (id: string) => {
    const tournament = tournaments.find(t => t.id === id);
    return tournament ? tournament.name : 'Unknown Tournament';
  };

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
    <Box sx={{ mt: 4 }}>
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
        <Typography sx={{ mt: 2 }}>No matches recorded yet.</Typography>
      ) : (
        <Paper elevation={2} sx={{ mt: 2 }}> {/* Wrap list in Paper for Material 3 feel */}
          <List>
            {matches.map((match) => (
              <ListItem
                key={match.id}
                secondaryAction={
                  isAdminLoggedIn && (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMatch(match.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Typography component="span" variant="body1" color="text.primary">
                      {getTournamentName(match.tournamentId)}: {getPlayerName(match.player1Id)} {match.score1} - {match.score2} {getPlayerName(match.player2Id)}
                    </Typography>
                  }
                  secondary={
                    <Typography component="span" variant="body2" color="text.secondary">
                      Location: {match.location} | Date: {new Date(match.date).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default MatchesPage;