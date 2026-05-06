import React, { useEffect, useState } from 'react';
import { api } from '../apiConfig';
import {
  Box, Typography, IconButton, CircularProgress, Alert,
  Container, Grid, Card, CardContent, CardActions, Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Player { id: string; firstName: string; lastName: string; }

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
    try {
      const res = await api.get<Match[]>('/matches');
      setMatches(res.data);
    } catch {
      setError('Failed to load results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this match result?')) return;
    try {
      await api.delete(`/matches/${id}`);
      setMatches(prev => prev.filter(m => m.id !== id));
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f0a' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #0d2e0d, #1a4d1a)', borderBottom: '2px solid #4caf50', py: 3, px: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#c8ff00' }}>Match Results</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''} recorded
        </Typography>
      </Box>

      <Container sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: '#c8ff00' }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : matches.length === 0 ? (
          <Alert severity="info" sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', color: 'rgba(255,255,255,0.6)' }}>
            No matches recorded yet.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {matches.map(match => {
              const p1Won = match.score1 > match.score2;
              const p1 = `${match.player1Id?.firstName || '?'} ${match.player1Id?.lastName || ''}`.trim();
              const p2 = `${match.player2Id?.firstName || '?'} ${match.player2Id?.lastName || ''}`.trim();
              const date = new Date(match.date).toLocaleDateString('en-CA', {
                day: 'numeric', month: 'short', year: 'numeric',
              });

              return (
                <Grid item xs={12} sm={6} md={4} key={match.id}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: '#111c11',
                      border: '1px solid #1e3a1e',
                      borderTop: '3px solid #4caf50',
                      '&:hover': { borderColor: '#4caf50' },
                    }}
                  >
                    <CardContent>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mb: 1.5 }}>
                        {date}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{
                            color: p1Won ? '#c8ff00' : 'rgba(255,255,255,0.7)',
                            fontWeight: p1Won ? 700 : 400,
                          }}>
                            {p1Won && '🏆 '}{p1}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#c8ff00', letterSpacing: 2 }}>
                            {match.score1}–{match.score2}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{
                            color: !p1Won ? '#c8ff00' : 'rgba(255,255,255,0.7)',
                            fontWeight: !p1Won ? 700 : 400,
                          }}>
                            {!p1Won && '🏆 '}{p2}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                        <Chip
                          label={`Winner: ${p1Won ? p1 : p2}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(76,175,80,0.15)',
                            color: '#4caf50',
                            border: '1px solid rgba(76,175,80,0.3)',
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>
                    </CardContent>

                    {isAdminLoggedIn && (
                      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(match.id)}>
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
    </Box>
  );
};

export default MatchesPage;
