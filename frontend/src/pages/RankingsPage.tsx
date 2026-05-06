import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Chip,
} from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { api } from '../apiConfig';

interface Player { id: string; firstName: string; lastName: string; }

interface PlayerRanking {
  player: Player;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gameDiff: number;
}

interface H2HEntry { score1: number; score2: number; }
interface H2HData { players: Player[]; h2h: Record<string, Record<string, H2HEntry | null>>; }

const MEDAL = ['🥇', '🥈', '🥉'];

const darkCell = { borderColor: '#1a2e1a', py: 1 };

const RankingsPage: React.FC = () => {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [h2hData, setH2HData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<PlayerRanking[]>('/rankings/overall'),
      api.get<H2HData>('/rankings/head-to-head'),
    ])
      .then(([rankRes, h2hRes]) => {
        setRankings(rankRes.data);
        setH2HData(h2hRes.data);
      })
      .catch(() => setError('Failed to load rankings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f0a', display: 'flex', justifyContent: 'center', pt: 12 }}>
        <CircularProgress sx={{ color: '#c8ff00' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f0a' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0d2e0d 0%, #1a4d1a 100%)', borderBottom: '2px solid #4caf50', py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LeaderboardIcon sx={{ color: '#c8ff00' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#c8ff00' }}>Standings</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
          SBP Summer Tennis League 2026 — Win = 3 pts · Tiebreaker: H2H → Game diff → Games won
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Main leaderboard */}
        {rankings.length === 0 ? (
          <Alert
            severity="info"
            sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', color: 'rgba(255,255,255,0.6)' }}
          >
            No matches played yet — standings will appear here after the first match is recorded.
          </Alert>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', borderRadius: 2, mb: 6 }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#0d2e0d' }}>
                  {['Rank', 'Player', 'Pts', 'W', 'L', 'Played', '+/−', 'GW'].map(h => (
                    <TableCell key={h} sx={{ color: '#c8ff00', fontWeight: 700, py: 1.5, borderColor: '#1e3a1e' }}>
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
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                  >
                    <TableCell sx={{ ...darkCell, fontWeight: 700, color: '#c8ff00' }}>
                      {MEDAL[i] || i + 1}
                    </TableCell>
                    <TableCell sx={darkCell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {i === 0 && <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 16 }} />}
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: i < 3 ? 700 : 400 }}>
                          {r.player.firstName} {r.player.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={darkCell}>
                      <Typography sx={{ color: '#c8ff00', fontWeight: 900, fontSize: '1.1rem' }}>
                        {r.points}
                      </Typography>
                    </TableCell>
                    <TableCell sx={darkCell}>
                      <Chip label={r.wins} size="small" sx={{ bgcolor: 'rgba(76,175,80,0.2)', color: '#4caf50', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={darkCell}>
                      <Chip label={r.losses} size="small" sx={{ bgcolor: 'rgba(239,83,80,0.15)', color: '#ef5350', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ ...darkCell, color: 'rgba(255,255,255,0.5)' }}>{r.matchesPlayed}</TableCell>
                    <TableCell sx={{ ...darkCell, color: r.gameDiff >= 0 ? '#4caf50' : '#ef5350', fontWeight: 700 }}>
                      {r.gameDiff > 0 ? '+' : ''}{r.gameDiff}
                    </TableCell>
                    <TableCell sx={{ ...darkCell, color: 'rgba(255,255,255,0.6)' }}>{r.gamesWon}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Head-to-Head Matrix */}
        {h2hData && h2hData.players.length > 0 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#c8ff00', mb: 0.5 }}>
              Head-to-Head
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 2 }}>
              Row player's score vs column player. Green = win · Red = loss · · = not yet played.
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#111c11', color: '#c8ff00', fontWeight: 700, borderColor: '#1a2e1a' }}>
                      vs
                    </TableCell>
                    {h2hData.players.map(p => (
                      <Tooltip key={p.id} title={`${p.firstName} ${p.lastName}`} arrow>
                        <TableCell
                          align="center"
                          sx={{
                            bgcolor: '#111c11', color: '#c8ff00', fontWeight: 700,
                            fontSize: '0.65rem', maxWidth: 50, whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            borderColor: '#1a2e1a',
                          }}
                        >
                          {p.firstName}
                        </TableCell>
                      </Tooltip>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {h2hData.players.map(rowP => (
                    <TableRow key={rowP.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ bgcolor: '#111c11', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', borderColor: '#1a2e1a' }}>
                        {rowP.firstName} {rowP.lastName}
                      </TableCell>
                      {h2hData.players.map(colP => {
                        if (rowP.id === colP.id) {
                          return (
                            <TableCell key={colP.id} align="center" sx={{ bgcolor: '#0d2e0d', color: '#2e4a2e', borderColor: '#1a2e1a' }}>
                              —
                            </TableCell>
                          );
                        }
                        const result = h2hData.h2h[rowP.id]?.[colP.id];
                        if (!result) {
                          return (
                            <TableCell key={colP.id} align="center" sx={{ color: 'rgba(255,255,255,0.15)', borderColor: '#1a2e1a', bgcolor: '#0d120d' }}>
                              ·
                            </TableCell>
                          );
                        }
                        const won = result.score1 > result.score2;
                        return (
                          <TableCell
                            key={colP.id}
                            align="center"
                            sx={{
                              bgcolor: won ? 'rgba(76,175,80,0.15)' : 'rgba(239,83,80,0.1)',
                              color: won ? '#4caf50' : '#ef5350',
                              fontWeight: 700, fontSize: '0.75rem',
                              border: '1px solid',
                              borderColor: won ? 'rgba(76,175,80,0.3)' : 'rgba(239,83,80,0.2)',
                            }}
                          >
                            {result.score1}–{result.score2}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RankingsPage;
