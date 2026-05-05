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
  CardActions,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Match {
  id: string;
  player1Id: Player;
  player2Id: Player;
  score1: number;
  score2: number;
  date: string;
}

interface MatchesPageProps {
  isAdminLoggedIn: boolean;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ isAdminLoggedIn }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Match[]>('/matches');
      setMatches(res.data);
    } catch {
      setError('Failed to fetch match results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this match result?')) return;
    try {
      await api.delete(`/matches/${id}`);
      fetchMatches();
    } catch {
      setError('Failed to delete match.');
    }
  };

  const winner = (match: Match): 'p1' | 'p2' =>
    match.score1 > match.score2 ? 'p1' : 'p2';

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <EmojiEventsIcon color="warning" />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Match Results
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        All recorded matches — {matches.length} match{matches.length !== 1 ? 'es' : ''} played
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : matches.length === 0 ? (
        <Alert severity="info">No matches recorded yet. Be the first to submit a score!</Alert>
      ) : (
        <Grid container spacing={2}>
          {matches.map(match => {
            const w = winner(match);
            const p1 = match.player1Id;
            const p2 = match.player2Id;
            const p1Name = `${p1?.firstName || '?'} ${p1?.lastName || ''}`.trim();
            const p2Name = `${p2?.firstName || '?'} ${p2?.lastName || ''}`.trim();
            const date = new Date(match.date).toLocaleDateString('en-PK', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <Grid item xs={12} sm={6} md={4} key={match.id}>
                <Card
                  elevation={2}
                  sx={{ height: '100%', borderTop: '3px solid', borderColor: 'success.main' }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      {date}
                    </Typography>

                    {/* Score row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      {/* Player 1 */}
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: w === 'p1' ? 700 : 400, color: w === 'p1' ? 'success.main' : 'text.primary' }}
                        >
                          {w === 'p1' && '🏆 '}{p1Name}
                        </Typography>
                      </Box>

                      {/* Score */}
                      <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                          {match.score1} – {match.score2}
                        </Typography>
                      </Box>

                      {/* Player 2 */}
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: w === 'p2' ? 700 : 400, color: w === 'p2' ? 'success.main' : 'text.primary' }}
                        >
                          {w === 'p2' && '🏆 '}{p2Name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                      <Chip
                        label={`Winner: ${w === 'p1' ? p1Name : p2Name}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>

                  {isAdminLoggedIn && (
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <IconButton size="small" aria-label="delete" onClick={() => handleDelete(match.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MatchesPage;
