import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

const VALID_SCORES = [
  { score1: 6, score2: 0 }, { score1: 6, score2: 1 }, { score1: 6, score2: 2 },
  { score1: 6, score2: 3 }, { score1: 6, score2: 4 }, { score1: 6, score2: 5 },
  { score1: 0, score2: 6 }, { score1: 1, score2: 6 }, { score1: 2, score2: 6 },
  { score1: 3, score2: 6 }, { score1: 4, score2: 6 }, { score1: 5, score2: 6 },
];

const AddMatchPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [score1, setScore1] = useState<string>('6');
  const [score2, setScore2] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.get<Player[]>('/players')
      .then(r => setPlayers(r.data))
      .catch(() => setError('Failed to load players. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const validateScore = (s1: number, s2: number) =>
    (s1 === 6 && s2 >= 0 && s2 <= 5) || (s2 === 6 && s1 >= 0 && s1 <= 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!player1 || !player2) {
      setError('Please select both players.');
      return;
    }
    if (player1 === player2) {
      setError('Please select two different players.');
      return;
    }

    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);

    if (isNaN(s1) || isNaN(s2) || !validateScore(s1, s2)) {
      setError('Invalid score: the winner must have exactly 6 games and the loser 0–5 games.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/matches', { player1Id: player1, player2Id: player2, score1: s1, score2: s2 });
      const p1Name = players.find(p => p.id === player1);
      const p2Name = players.find(p => p.id === player2);
      setSuccess(
        `Match recorded! ${p1Name?.firstName} ${p1Name?.lastName} ${s1} – ${s2} ${p2Name?.firstName} ${p2Name?.lastName}`
      );
      setPlayer1('');
      setPlayer2('');
      setScore1('6');
      setScore2('0');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit match. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const winner = (() => {
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (!player1 || !player2 || isNaN(s1) || isNaN(s2)) return null;
    const p1 = players.find(p => p.id === player1);
    const p2 = players.find(p => p.id === player2);
    if (!p1 || !p2) return null;
    if (s1 === 6) return `${p1.firstName} ${p1.lastName}`;
    if (s2 === 6) return `${p2.firstName} ${p2.lastName}`;
    return null;
  })();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SportsTennisIcon color="success" />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Submit Match Score
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Record a completed match. One set only — the winner must reach 6 games.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              {/* Players */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Player 1</InputLabel>
                <Select
                  value={player1}
                  label="Player 1"
                  onChange={e => { setPlayer1(e.target.value); setError(null); }}
                  required
                >
                  <MenuItem value="">Select Player 1</MenuItem>
                  {players.map(p => (
                    <MenuItem key={p.id} value={p.id} disabled={p.id === player2}>
                      {p.firstName} {p.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Player 2</InputLabel>
                <Select
                  value={player2}
                  label="Player 2"
                  onChange={e => { setPlayer2(e.target.value); setError(null); }}
                  required
                >
                  <MenuItem value="">Select Player 2</MenuItem>
                  {players.map(p => (
                    <MenuItem key={p.id} value={p.id} disabled={p.id === player1}>
                      {p.firstName} {p.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Scores */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Final Score (winner must have 6)
              </Typography>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Player 1 Games"
                    type="number"
                    value={score1}
                    onChange={e => { setScore1(e.target.value); setError(null); }}
                    inputProps={{ min: 0, max: 6 }}
                    required
                  />
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>–</Typography>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Player 2 Games"
                    type="number"
                    value={score2}
                    onChange={e => { setScore2(e.target.value); setError(null); }}
                    inputProps={{ min: 0, max: 6 }}
                    required
                  />
                </Grid>
              </Grid>

              {/* Quick score picker */}
              <Box sx={{ mb: 3, mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Quick select:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {VALID_SCORES.map(({ score1: s1, score2: s2 }) => (
                    <Chip
                      key={`${s1}-${s2}`}
                      label={`${s1} – ${s2}`}
                      size="small"
                      onClick={() => { setScore1(String(s1)); setScore2(String(s2)); setError(null); }}
                      color={String(score1) === String(s1) && String(score2) === String(s2) ? 'success' : 'default'}
                      variant={String(score1) === String(s1) && String(score2) === String(s2) ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Winner preview */}
              {winner && (
                <Alert severity="success" icon={false} sx={{ mb: 3 }}>
                  🏆 <strong>{winner}</strong> wins this match
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                fullWidth
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Record Match'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AddMatchPage;
