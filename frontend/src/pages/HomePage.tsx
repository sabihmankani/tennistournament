import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress, Divider,
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { api } from '../apiConfig';

interface Player { id: string; firstName: string; lastName: string; }

interface WeeklyMatchEntry {
  id: string;
  player1Id: Player;
  player2Id: Player;
  weekLabel: string;
  isCompleted: boolean;
  completedMatch: {
    player1Id: Player; player2Id: Player; score1: number; score2: number;
  } | null;
}

interface Ranking {
  player: Player;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  gameDiff: number;
  gamesWon: number;
}

const MEDAL = ['🥇', '🥈', '🥉'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [weekly, setWeekly] = useState<WeeklyMatchEntry[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [wmRes, rankRes] = await Promise.all([
          api.get<WeeklyMatchEntry[]>('/weekly-matches'),
          api.get<Ranking[]>('/rankings/overall'),
        ]);
        setWeekly(wmRes.data);
        setRankings(rankRes.data);
      } catch {
        // silently degrade
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const weekLabel = weekly.length > 0 ? weekly[0].weekLabel : '';

  // For a completed weekly match, show the score from the perspective of player1 (home)
  const getDisplayScore = (wm: WeeklyMatchEntry) => {
    if (!wm.isCompleted || !wm.completedMatch) return null;
    const m = wm.completedMatch;
    const p1id = wm.player1Id.id;
    // Check if the match was recorded as home=player1
    if (m.player1Id.id === p1id) return { s1: m.score1, s2: m.score2 };
    return { s1: m.score2, s2: m.score1 };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f0a' }}>
      {/* ── Hero ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d2e0d 0%, #1a4d1a 50%, #0d2e0d 100%)',
          borderBottom: '3px solid #4caf50',
          py: { xs: 4, md: 5 },
          px: 2,
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <SportsTennisIcon sx={{ color: '#c8ff00', fontSize: 36 }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: '#c8ff00', letterSpacing: 1, fontSize: { xs: '1.5rem', md: '2.2rem' } }}
          >
            SBP SUMMER TENNIS LEAGUE
          </Typography>
          <SportsTennisIcon sx={{ color: '#c8ff00', fontSize: 36 }} />
        </Box>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, letterSpacing: 3, mb: 0.5 }}>
          2026
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 2, mb: 3 }}>
          SOUL BROTHERS CANADA — FAIR PLAY. GREAT MATCHES. STRONG BROTHERHOOD.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component={Link}
            to="/add-match"
            sx={{ bgcolor: '#c8ff00', color: '#0a1a0a', fontWeight: 800, px: 4, '&:hover': { bgcolor: '#b0e000' } }}
          >
            Record a Score
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/matches"
            sx={{ borderColor: 'rgba(200,255,0,0.5)', color: '#c8ff00', px: 4 }}
          >
            All Results
          </Button>
        </Box>
      </Box>

      {/* ── Main Content ── */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#c8ff00' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>

            {/* ── Left: This Week's Schedule ── */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ color: '#c8ff00', fontWeight: 800 }}>
                  This Week's Schedule
                </Typography>
                {weekLabel && (
                  <Chip
                    label={weekLabel}
                    size="small"
                    sx={{ bgcolor: 'rgba(200,255,0,0.15)', color: '#c8ff00', border: '1px solid rgba(200,255,0,0.3)' }}
                  />
                )}
              </Box>

              {weekly.length === 0 ? (
                <Card sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <RadioButtonUncheckedIcon sx={{ color: '#4a6a4a', fontSize: 48, mb: 1 }} />
                    <Typography color="rgba(255,255,255,0.4)">
                      No matches scheduled yet this week.
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.25)" sx={{ mt: 1, display: 'block' }}>
                      The admin will post this week's fixtures soon.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {weekly.map(wm => {
                    const score = getDisplayScore(wm);
                    const homeWon = score ? score.s1 > score.s2 : false;
                    return (
                      <Card
                        key={wm.id}
                        sx={{
                          bgcolor: wm.isCompleted ? '#0d1f0d' : '#111c11',
                          border: '1px solid',
                          borderColor: wm.isCompleted ? '#2e7d32' : '#1e3a1e',
                          transition: 'border-color 0.2s',
                          '&:hover': { borderColor: '#4caf50' },
                        }}
                      >
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            {/* Players & score */}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="H" size="small" sx={{ bgcolor: '#1a3a1a', color: '#c8ff00', fontSize: '0.6rem', height: 18, minWidth: 22 }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: wm.isCompleted && homeWon ? '#c8ff00' : 'rgba(255,255,255,0.85)',
                                    fontWeight: wm.isCompleted && homeWon ? 700 : 400,
                                  }}
                                >
                                  {wm.player1Id.firstName} {wm.player1Id.lastName}
                                </Typography>
                              </Box>

                              {wm.isCompleted && score ? (
                                <Typography
                                  variant="h6"
                                  sx={{ color: '#c8ff00', fontWeight: 900, letterSpacing: 2, my: 0.25, ml: 3.5 }}
                                >
                                  {score.s1} — {score.s2}
                                </Typography>
                              ) : (
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', ml: 3.5 }}>
                                  vs
                                </Typography>
                              )}

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="A" size="small" sx={{ bgcolor: '#1a1a3a', color: '#82b1ff', fontSize: '0.6rem', height: 18, minWidth: 22 }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: wm.isCompleted && !homeWon ? '#c8ff00' : 'rgba(255,255,255,0.85)',
                                    fontWeight: wm.isCompleted && !homeWon ? 700 : 400,
                                  }}
                                >
                                  {wm.player2Id.firstName} {wm.player2Id.lastName}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Status / action */}
                            {wm.isCompleted ? (
                              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                sx={{
                                  bgcolor: '#c8ff00', color: '#0a1a0a', fontWeight: 700,
                                  fontSize: '0.7rem', px: 1.5, py: 0.5, whiteSpace: 'nowrap',
                                  '&:hover': { bgcolor: '#b0e000' },
                                }}
                                onClick={() => navigate(
                                  `/add-match?player1=${wm.player1Id.id}&player2=${wm.player2Id.id}`
                                )}
                              >
                                Record Score
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Grid>

            {/* ── Right: Standings ── */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ color: '#c8ff00', fontWeight: 800 }}>
                  Standings
                </Typography>
                <Button
                  size="small"
                  component={Link}
                  to="/rankings"
                  sx={{ color: 'rgba(200,255,0,0.6)', textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Full stats →
                </Button>
              </Box>

              {rankings.length === 0 ? (
                <Card sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <EmojiEventsIcon sx={{ color: '#4a6a4a', fontSize: 48, mb: 1 }} />
                    <Typography color="rgba(255,255,255,0.4)">
                      No matches recorded yet. Standings will appear here.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', borderRadius: 2 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#0d2e0d' }}>
                        {['#', 'Player', 'Pts', 'W', 'L', '+/-'].map(h => (
                          <TableCell key={h} sx={{ color: '#c8ff00', fontWeight: 700, py: 1.25, borderColor: '#1e3a1e' }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rankings.map((r, i) => (
                        <TableRow
                          key={r.player.id}
                          sx={{
                            bgcolor: i === 0 ? 'rgba(200,255,0,0.05)' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                          }}
                        >
                          <TableCell sx={{ color: '#c8ff00', fontWeight: 700, borderColor: '#1a2e1a', py: 1 }}>
                            {MEDAL[i] || i + 1}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderColor: '#1a2e1a', py: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: i < 3 ? 700 : 400 }}>
                              {r.player.firstName} {r.player.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderColor: '#1a2e1a', py: 1 }}>
                            <Typography sx={{ color: '#c8ff00', fontWeight: 800, fontSize: '0.9rem' }}>
                              {r.points}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#4caf50', fontWeight: 600, borderColor: '#1a2e1a', py: 1 }}>
                            {r.wins}
                          </TableCell>
                          <TableCell sx={{ color: '#ef5350', fontWeight: 600, borderColor: '#1a2e1a', py: 1 }}>
                            {r.losses}
                          </TableCell>
                          <TableCell sx={{
                            color: r.gameDiff >= 0 ? '#4caf50' : '#ef5350',
                            fontWeight: 600, borderColor: '#1a2e1a', py: 1,
                          }}>
                            {r.gameDiff > 0 ? '+' : ''}{r.gameDiff}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Rules Summary */}
              <Box
                sx={{
                  mt: 3, p: 2, borderRadius: 2,
                  bgcolor: '#111c11', border: '1px solid #1e3a1e',
                }}
              >
                <Typography variant="caption" sx={{ color: '#c8ff00', fontWeight: 700, display: 'block', mb: 1, letterSpacing: 1 }}>
                  POINTS SYSTEM
                </Typography>
                <Divider sx={{ borderColor: '#1e3a1e', mb: 1 }} />
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box>
                    <Typography sx={{ color: '#4caf50', fontWeight: 800, fontSize: '1.4rem' }}>3</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.4)">Points for a Win</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#ef5350', fontWeight: 800, fontSize: '1.4rem' }}>0</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.4)">Points for a Loss</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', display: 'block', mt: 1 }}>
                  Tiebreaker: Head-to-head → Game diff → Games won
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid #1e3a1e', py: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="rgba(255,255,255,0.25)">
          SBP Summer Tennis League 2026 &nbsp;•&nbsp; Soul Brothers Canada &nbsp;•&nbsp; Energy · Balance · Brotherhood
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
