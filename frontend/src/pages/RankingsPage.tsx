import React, { useEffect, useState } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Chip,
} from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface PlayerRanking {
  player: Player;
  wins: number;
  losses: number;
  winPct: number;
  gamesWon: number;
  gamesLost: number;
  gamesRatio: number;
  matchesPlayed: number;
}

interface H2HEntry {
  score1: number;
  score2: number;
}

interface H2HData {
  players: Player[];
  h2h: Record<string, Record<string, H2HEntry | null>>;
}

const MEDAL = ['🥇', '🥈', '🥉'];

const RankingsPage: React.FC = () => {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [h2hData, setH2HData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rankRes, h2hRes] = await Promise.all([
          api.get<PlayerRanking[]>('/rankings/overall'),
          api.get<H2HData>('/rankings/head-to-head'),
        ]);
        setRankings(rankRes.data);
        setH2HData(h2hRes.data);
      } catch {
        setError('Failed to load rankings.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <LeaderboardIcon color="info" />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Leaderboard
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Soul Brothers Pakistan Tennis Championship 2025 — Overall Rankings
      </Typography>

      {/* Leaderboard Table */}
      {rankings.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>No matches recorded yet — standings will appear here once matches are played.</Alert>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ mb: 6, borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'success.main' }}>
                {['Rank', 'Player', 'W', 'L', 'Played', 'Win %', 'Games Won', 'Games Lost', 'Games %'].map(h => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 700, py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rankings.map((r, i) => (
                <TableRow
                  key={r.player.id}
                  sx={{
                    bgcolor: i === 0 ? 'rgba(255,215,0,0.08)' : i % 2 === 0 ? 'action.hover' : 'background.paper',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>
                    {MEDAL[i] || i + 1}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {i === 0 && <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 18 }} />}
                      <Typography sx={{ fontWeight: i === 0 ? 700 : 400 }}>
                        {r.player.firstName} {r.player.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.wins} size="small" color="success" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.losses} size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{r.matchesPlayed}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{pct(r.winPct)}</TableCell>
                  <TableCell>{r.gamesWon}</TableCell>
                  <TableCell>{r.gamesLost}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{pct(r.gamesRatio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Head-to-Head Matrix */}
      {h2hData && h2hData.players.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Head-to-Head Results
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Row player's score vs column player. Green = win, Red = loss. Blank = not yet played.
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', borderBottom: 2 }}>vs</TableCell>
                  {h2hData.players.map(p => (
                    <Tooltip key={p.id} title={`${p.firstName} ${p.lastName}`} arrow>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          maxWidth: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          borderBottom: 2,
                          bgcolor: 'background.paper',
                        }}
                      >
                        {p.firstName}
                      </TableCell>
                    </Tooltip>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {h2hData.players.map((rowPlayer, ri) => (
                  <TableRow key={rowPlayer.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {rowPlayer.firstName} {rowPlayer.lastName}
                    </TableCell>
                    {h2hData.players.map((colPlayer, ci) => {
                      if (rowPlayer.id === colPlayer.id) {
                        return (
                          <TableCell
                            key={colPlayer.id}
                            align="center"
                            sx={{ bgcolor: 'grey.200', fontSize: '0.7rem' }}
                          >
                            —
                          </TableCell>
                        );
                      }
                      const result = h2hData.h2h[rowPlayer.id]?.[colPlayer.id];
                      if (!result) {
                        return (
                          <TableCell key={colPlayer.id} align="center" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                            ·
                          </TableCell>
                        );
                      }
                      const won = result.score1 > result.score2;
                      return (
                        <TableCell
                          key={colPlayer.id}
                          align="center"
                          sx={{
                            bgcolor: won ? 'rgba(46,125,50,0.15)' : 'rgba(211,47,47,0.1)',
                            color: won ? 'success.dark' : 'error.dark',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid',
                            borderColor: won ? 'success.light' : 'error.light',
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
  );
};

export default RankingsPage;
