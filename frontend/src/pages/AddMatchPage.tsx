import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Box, TextField, Button, Typography, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { useAppTheme } from '../context/ThemeContext';
import PlayerAvatar from '../components/PlayerAvatar';

interface Player { id: string; firstName: string; lastName: string; }

const VALID_SCORES = [
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
];

const AddMatchPage: React.FC = () => {
  const { c } = useAppTheme();
  const navigate = useNavigate();
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
    setError(null); setSuccess(null);
    if (!player1 || !player2) { setError('Please select both players.'); return; }
    if (player1 === player2) { setError('Please select two different players.'); return; }
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (isNaN(s1) || isNaN(s2) || !validateScore(s1, s2)) {
      setError('Invalid score: winner must have 6, loser 0–5.'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/matches', { player1Id: player1, player2Id: player2, score1: s1, score2: s2 });
      const p1 = players.find(p => p.id === player1);
      const p2 = players.find(p => p.id === player2);
      setSuccess(`Match recorded: ${p1?.firstName} ${s1}–${s2} ${p2?.firstName}`);
      if (!isPreSelected) { setPlayer1(''); setPlayer2(''); }
      setScore1('6'); setScore2('0');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const p1Obj = players.find(p => p.id === player1);
  const p2Obj = players.find(p => p.id === player2);
  const s1n = parseInt(score1, 10);
  const s2n = parseInt(score2, 10);
  const winner = p1Obj && p2Obj && !isNaN(s1n) && !isNaN(s2n)
    ? (s1n === 6 ? p1Obj : s2n === 6 ? p2Obj : null)
    : null;

  const selectSx = {
    color: c.text,
    bgcolor: c.surface,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.borderStrong },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.green },
    '& .MuiSvgIcon-root': { color: c.textMuted },
  };

  const fieldSx = {
    '& .MuiInputLabel-root': { color: c.textMuted },
    '& .MuiInputLabel-root.Mui-focused': { color: c.green },
    '& .MuiOutlinedInput-root': {
      color: c.text,
      bgcolor: c.surface,
      '& fieldset': { borderColor: c.border },
      '&:hover fieldset': { borderColor: c.borderStrong },
      '&.Mui-focused fieldset': { borderColor: c.green },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg, transition: 'background-color 0.2s', pt: 3, px: 2, pb: 6 }}>
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: c.textMuted, textTransform: 'none', mb: 2, pl: 0, '&:hover': { color: c.green, bgcolor: 'transparent' } }}
        >
          Back
        </Button>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SportsTennisIcon sx={{ color: c.green, fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: c.text }}>Record Score</Typography>
        </Box>

        {isPreSelected && (
          <Box
            sx={{
              bgcolor: c.greenMuted,
              border: `1px solid ${c.green}33`,
              borderRadius: 2,
              px: 2,
              py: 1.25,
              mb: 2.5,
            }}
          >
            <Typography sx={{ color: c.green, fontSize: '0.825rem', fontWeight: 600 }}>
              Players pre-selected from this week's schedule
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: c.green }} size={32} />
          </Box>
        ) : (
          <Box sx={{ bgcolor: c.cardBg, borderRadius: 3, border: `1px solid ${c.border}`, p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8rem' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2.5, fontSize: '0.8rem' }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              {/* Player 1 */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: c.textMuted, '&.Mui-focused': { color: c.green } }}>
                  Home Player
                </InputLabel>
                <Select value={player1} label="Home Player" onChange={e => { setPlayer1(e.target.value); setError(null); }} required sx={selectSx}>
                  <MenuItem value="">Select player</MenuItem>
                  {players.map(p => (
                    <MenuItem key={p.id} value={p.id} disabled={p.id === player2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayerAvatar firstName={p.firstName} lastName={p.lastName} size={22} />
                        {p.firstName} {p.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Player 2 */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: c.textMuted, '&.Mui-focused': { color: c.green } }}>
                  Away Player
                </InputLabel>
                <Select value={player2} label="Away Player" onChange={e => { setPlayer2(e.target.value); setError(null); }} required sx={selectSx}>
                  <MenuItem value="">Select player</MenuItem>
                  {players.map(p => (
                    <MenuItem key={p.id} value={p.id} disabled={p.id === player1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayerAvatar firstName={p.firstName} lastName={p.lastName} size={22} />
                        {p.firstName} {p.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Score preview bar */}
              {p1Obj && p2Obj && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    bgcolor: c.border,
                    borderRadius: 2,
                    py: 1.5,
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <PlayerAvatar firstName={p1Obj.firstName} lastName={p1Obj.lastName} size={24} />
                    <Typography sx={{ fontWeight: 600, color: c.text, fontSize: '0.875rem' }}>
                      {p1Obj.firstName}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: c.text, fontSize: '1.2rem', fontVariantNumeric: 'tabular-nums' }}>
                    {score1} – {score2}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography sx={{ fontWeight: 600, color: c.text, fontSize: '0.875rem' }}>
                      {p2Obj.firstName}
                    </Typography>
                    <PlayerAvatar firstName={p2Obj.firstName} lastName={p2Obj.lastName} size={24} />
                  </Box>
                </Box>
              )}

              {/* Score inputs */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Home games"
                  type="number"
                  value={score1}
                  onChange={e => { setScore1(e.target.value); setError(null); }}
                  inputProps={{ min: 0, max: 6 }}
                  required
                  sx={fieldSx}
                />
                <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: '1.25rem' }}>–</Typography>
                <TextField
                  fullWidth
                  label="Away games"
                  type="number"
                  value={score2}
                  onChange={e => { setScore2(e.target.value); setError(null); }}
                  inputProps={{ min: 0, max: 6 }}
                  required
                  sx={fieldSx}
                />
              </Box>

              {/* Quick score chips */}
              <Typography sx={{ fontSize: '0.72rem', color: c.textMuted, mb: 0.75, fontWeight: 600, letterSpacing: '0.05em' }}>
                QUICK SELECT
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
                {VALID_SCORES.map(([s1, s2]) => {
                  const active = String(score1) === String(s1) && String(score2) === String(s2);
                  return (
                    <Box
                      key={`${s1}-${s2}`}
                      onClick={() => { setScore1(String(s1)); setScore2(String(s2)); setError(null); }}
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 50,
                        border: `1px solid ${active ? c.green : c.borderStrong}`,
                        bgcolor: active ? c.green : 'transparent',
                        color: active ? '#fff' : c.textMuted,
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: active ? 700 : 400,
                        userSelect: 'none',
                        transition: 'all 0.1s',
                        '&:hover': { borderColor: c.green, color: active ? '#fff' : c.green },
                      }}
                    >
                      {s1}–{s2}
                    </Box>
                  );
                })}
              </Box>

              {/* Winner callout */}
              {winner && (
                <Box
                  sx={{
                    bgcolor: c.greenMuted,
                    border: `1px solid ${c.green}44`,
                    borderRadius: 2,
                    px: 2,
                    py: 1.25,
                    mb: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ color: c.green, fontWeight: 700, fontSize: '0.9rem' }}>
                    🏆 {winner.firstName} {winner.lastName} wins
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                sx={{
                  bgcolor: '#1B5E20',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.4,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#155216' },
                  '&:disabled': { bgcolor: c.borderStrong, color: c.textMuted },
                  boxShadow: 'none',
                }}
              >
                {submitting ? 'Saving…' : 'Record Match'}
              </Button>
            </form>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AddMatchPage;
