import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Box, TextField, Button, Typography, FormControl, InputLabel,
  Select, MenuItem, Card, CardContent, Grid, CircularProgress,
  Alert, Chip,
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import InfoIcon from '@mui/icons-material/Info';

interface Player { id: string; firstName: string; lastName: string; }

const VALID_SCORES = [
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
];

const AddMatchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prePlayer1 = searchParams.get('player1') || '';
  const prePlayer2 = searchParams.get('player2') || '';

  const [players, setPlayers] = useState<Player[]>([]);
  const [player1, setPlayer1] = useState(prePlayer1);
  const [player2, setPlayer2] = useState(prePlayer2);
  const [score1, setScore1] = useState('6');
  const [score2, setScore2] = useState('0');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.get<Player[]>('/players')
      .then(r => {
        setPlayers(r.data);
        // Set pre-selected players from URL params (validate they exist)
        if (prePlayer1 && r.data.some(p => p.id === prePlayer1)) setPlayer1(prePlayer1);
        if (prePlayer2 && r.data.some(p => p.id === prePlayer2)) setPlayer2(prePlayer2);
      })
      .catch(() => setError('Failed to load players.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPreSelected = !!(prePlayer1 && prePlayer2);

  const validateScore = (s1: number, s2: number) =>
    (s1 === 6 && s2 >= 0 && s2 <= 5) || (s2 === 6 && s1 >= 0 && s1 <= 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!player1 || !player2) { setError('Please select both players.'); return; }
    if (player1 === player2) { setError('Please select two different players.'); return; }
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (isNaN(s1) || isNaN(s2) || !validateScore(s1, s2)) {
      setError('Invalid score: winner must have 6 games, loser 0–5.'); return;
    }

    setSubmitting(true);
    try {
      await api.post('/matches', { player1Id: player1, player2Id: player2, score1: s1, score2: s2 });
      const p1 = players.find(p => p.id === player1);
      const p2 = players.find(p => p.id === player2);
      setSuccess(`✅ Match recorded: ${p1?.firstName} ${p1?.lastName} ${s1}–${s2} ${p2?.firstName} ${p2?.lastName}`);
      if (!isPreSelected) {
        setPlayer1(''); setPlayer2('');
      }
      setScore1('6'); setScore2('0');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
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
    <Box
      sx={{
        minHeight: '100vh', bgcolor: '#0a0f0a',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: 4, px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <SportsTennisIcon sx={{ color: '#c8ff00', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#c8ff00' }}>
            Record Match Score
          </Typography>
        </Box>

        {isPreSelected && (
          <Alert
            icon={<InfoIcon />}
            severity="info"
            sx={{ mb: 2, bgcolor: 'rgba(200,255,0,0.08)', border: '1px solid rgba(200,255,0,0.2)', color: '#c8ff00' }}
          >
            Players pre-selected from this week's schedule
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: '#c8ff00' }} />
          </Box>
        ) : (
          <Card sx={{ bgcolor: '#111c11', border: '1px solid #1e3a1e', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                {/* Player 1 (Home) */}
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Player 1 (Home)</InputLabel>
                  <Select
                    value={player1}
                    label="Player 1 (Home)"
                    onChange={e => { setPlayer1(e.target.value); setError(null); }}
                    required
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2e4a2e' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                      '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                    }}
                  >
                    <MenuItem value="">Select home player</MenuItem>
                    {players.map(p => (
                      <MenuItem key={p.id} value={p.id} disabled={p.id === player2}>
                        {p.firstName} {p.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Player 2 (Away) */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Player 2 (Away)</InputLabel>
                  <Select
                    value={player2}
                    label="Player 2 (Away)"
                    onChange={e => { setPlayer2(e.target.value); setError(null); }}
                    required
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2e4a2e' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                      '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                    }}
                  >
                    <MenuItem value="">Select away player</MenuItem>
                    {players.map(p => (
                      <MenuItem key={p.id} value={p.id} disabled={p.id === player1}>
                        {p.firstName} {p.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Score */}
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
                  Final Score (winner must have 6)
                </Typography>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth label="P1 Games" type="number" value={score1}
                      onChange={e => { setScore1(e.target.value); setError(null); }}
                      inputProps={{ min: 0, max: 6 }}
                      required
                      sx={{
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: '#2e4a2e' },
                          '&:hover fieldset': { borderColor: '#4caf50' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>—</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth label="P2 Games" type="number" value={score2}
                      onChange={e => { setScore2(e.target.value); setError(null); }}
                      inputProps={{ min: 0, max: 6 }}
                      required
                      sx={{
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: '#2e4a2e' },
                          '&:hover fieldset': { borderColor: '#4caf50' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Quick chips */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mb: 0.75 }}>
                    Quick select score:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {VALID_SCORES.map(([s1, s2]) => {
                      const active = String(score1) === String(s1) && String(score2) === String(s2);
                      return (
                        <Chip
                          key={`${s1}-${s2}`}
                          label={`${s1}–${s2}`}
                          size="small"
                          onClick={() => { setScore1(String(s1)); setScore2(String(s2)); setError(null); }}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: active ? '#c8ff00' : 'rgba(200,255,0,0.08)',
                            color: active ? '#0a1a0a' : 'rgba(200,255,0,0.7)',
                            border: '1px solid',
                            borderColor: active ? '#c8ff00' : 'rgba(200,255,0,0.2)',
                            fontWeight: active ? 700 : 400,
                            '&:hover': { bgcolor: active ? '#b0e000' : 'rgba(200,255,0,0.15)' },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Winner preview */}
                {winner && (
                  <Box
                    sx={{
                      mb: 3, p: 1.5, borderRadius: 2,
                      bgcolor: 'rgba(200,255,0,0.08)', border: '1px solid rgba(200,255,0,0.25)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ color: '#c8ff00', fontWeight: 700 }}>
                      🏆 {winner} wins
                    </Typography>
                  </Box>
                )}

                <Button
                  type="submit" variant="contained" fullWidth size="large"
                  disabled={submitting}
                  sx={{
                    bgcolor: '#c8ff00', color: '#0a1a0a', fontWeight: 800,
                    fontSize: '1rem', py: 1.5,
                    '&:hover': { bgcolor: '#b0e000' },
                    '&:disabled': { bgcolor: 'rgba(200,255,0,0.3)' },
                  }}
                >
                  {submitting ? 'Saving...' : 'Record Match'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default AddMatchPage;
