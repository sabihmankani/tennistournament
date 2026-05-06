import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Typography, Button, Container, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress,
  Alert, Box, FormControl, InputLabel, Select,
  MenuItem, TextField, IconButton, Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAppTheme } from '../context/ThemeContext';
import PlayerAvatar from '../components/PlayerAvatar';

interface Player { id: string; firstName: string; lastName: string; }

interface WeeklyMatchEntry {
  id: string;
  player1Id: Player;
  player2Id: Player;
  weekLabel: string;
  isCompleted: boolean;
  completedMatch: { score1: number; score2: number; player1Id: Player; player2Id: Player } | null;
}

interface MatchLog {
  id: string;
  player1Id: Player;
  player2Id: Player;
  score1: number;
  score2: number;
  date: string;
  ipAddress: string;
}

const AdminDashboardPage: React.FC = () => {
  const { c } = useAppTheme();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [weekly, setWeekly] = useState<WeeklyMatchEntry[]>([]);
  const [matchLogs, setMatchLogs] = useState<MatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newP1, setNewP1] = useState('');
  const [newP2, setNewP2] = useState('');
  const [weekLabel, setWeekLabel] = useState('');
  const [addingMatch, setAddingMatch] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [wmRes, logRes, plRes] = await Promise.all([
        api.get<WeeklyMatchEntry[]>('/weekly-matches'),
        api.get<MatchLog[]>('/admin/match-logs'),
        api.get<Player[]>('/players'),
      ]);
      setWeekly(wmRes.data);
      setMatchLogs(logRes.data);
      setPlayers(plRes.data);
      if (wmRes.data.length > 0) setWeekLabel(wmRes.data[0].weekLabel || '');
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin'); return; }
    fetchData();
  }, [navigate, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
  };

  const handleAddWeeklyMatch = async () => {
    if (!newP1 || !newP2 || newP1 === newP2) { setError('Select two different players.'); return; }
    setAddingMatch(true); setError(null);
    try {
      await api.post('/admin/weekly-matches', { player1Id: newP1, player2Id: newP2, weekLabel });
      setNewP1(''); setNewP2('');
      setSuccess('Match added to schedule.');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add match.');
    } finally {
      setAddingMatch(false);
    }
  };

  const handleDeleteWeeklyMatch = async (id: string) => {
    try {
      await api.delete(`/admin/weekly-matches/${id}`);
      setWeekly(prev => prev.filter(m => m.id !== id));
    } catch {
      setError('Failed to remove match.');
    }
  };

  const handleClearWeekly = async () => {
    if (!window.confirm('Clear all matches from this week\'s schedule?')) return;
    try {
      await api.delete('/admin/weekly-matches');
      setWeekly([]); setSuccess('Weekly schedule cleared.');
    } catch { setError('Failed to clear schedule.'); }
  };

  const handleSeedWeek1 = async () => {
    if (!window.confirm('Seed 9 players + 9 Week 1 fixtures? (Existing players are kept, weekly schedule is replaced.)')) return;
    setSeeding(true); setError(null);
    try {
      await api.post('/admin/seed-week1');
      setSuccess('Seeded! Reloading…');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Seed failed.');
      setSeeding(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ Delete ALL players, matches, and schedule?')) return;
    if (!window.confirm('Last chance — this cannot be undone.')) return;
    setClearingAll(true);
    try {
      await api.delete('/admin/clear-all');
      setSuccess('All data cleared.');
      setWeekly([]); setMatchLogs([]); setPlayers([]);
    } catch { setError('Failed to clear data.'); }
    finally { setClearingAll(false); }
  };

  const handleUpdateLabel = async () => {
    try {
      await api.put('/admin/weekly-matches/label', { weekLabel });
      setSuccess('Week label updated.');
    } catch { setError('Failed to update label.'); }
  };

  const cardSx = {
    bgcolor: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: 3,
    p: 3,
    mb: 3,
  };

  const selectSx = {
    color: c.text,
    bgcolor: c.surface,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.borderStrong },
    '& .MuiSvgIcon-root': { color: c.textMuted },
  };

  const fieldSx = {
    '& .MuiInputLabel-root': { color: c.textMuted },
    '& .MuiOutlinedInput-root': {
      color: c.text,
      bgcolor: c.surface,
      '& fieldset': { borderColor: c.border },
      '&:hover fieldset': { borderColor: c.borderStrong },
    },
  };

  const cellSx = { color: c.text, borderColor: c.border, py: 1, fontSize: '0.8rem' };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg, transition: 'background-color 0.2s' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettingsIcon sx={{ color: c.green, fontSize: 24 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: c.text }}>Admin Dashboard</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: c.textMuted }}>SBP Summer Tennis League 2026</Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            sx={{
              borderColor: c.lossColor + '66',
              color: c.lossColor,
              textTransform: 'none',
              '&:hover': { borderColor: c.lossColor, bgcolor: c.lossColor + '11' },
            }}
          >
            Logout
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: c.green }} size={32} />
          </Box>
        ) : (
          <>
            {/* ── Weekly Schedule ── */}
            <Box sx={cardSx}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: c.text, mb: 0.5 }}>
                This Week's Schedule
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: c.textMuted, mb: 2.5 }}>
                Set which matches need to be played this week.
              </Typography>

              {/* Week label */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
                <TextField
                  size="small"
                  label="Week label (e.g. Week 1 — May 5–10)"
                  value={weekLabel}
                  onChange={e => setWeekLabel(e.target.value)}
                  sx={{ flex: 1, ...fieldSx }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleUpdateLabel}
                  disabled={weekly.length === 0}
                  sx={{
                    borderColor: c.green + '88',
                    color: c.green,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': { borderColor: c.green },
                  }}
                >
                  Update Label
                </Button>
              </Box>

              {/* Add match form */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: c.bg,
                  borderRadius: 2,
                  border: `1px solid ${c.border}`,
                  mb: 2,
                }}
              >
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel sx={{ color: c.textMuted }}>Home Player</InputLabel>
                  <Select value={newP1} label="Home Player" onChange={e => setNewP1(e.target.value)} sx={selectSx}>
                    <MenuItem value="">Select</MenuItem>
                    {players.map(p => (
                      <MenuItem key={p.id} value={p.id} disabled={p.id === newP2}>
                        {p.firstName} {p.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: '0.8rem' }}>vs</Typography>

                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel sx={{ color: c.textMuted }}>Away Player</InputLabel>
                  <Select value={newP2} label="Away Player" onChange={e => setNewP2(e.target.value)} sx={selectSx}>
                    <MenuItem value="">Select</MenuItem>
                    {players.map(p => (
                      <MenuItem key={p.id} value={p.id} disabled={p.id === newP1}>
                        {p.firstName} {p.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddWeeklyMatch}
                  disabled={addingMatch || !newP1 || !newP2}
                  sx={{
                    bgcolor: '#1B5E20',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#155216' },
                    boxShadow: 'none',
                  }}
                >
                  Add to Schedule
                </Button>
              </Box>

              {/* Current schedule list */}
              {weekly.length === 0 ? (
                <Typography sx={{ color: c.textMuted, textAlign: 'center', py: 2, fontSize: '0.875rem' }}>
                  No matches scheduled yet.
                </Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                    {weekly.map((wm, idx) => (
                      <Box
                        key={wm.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.5,
                          py: 1,
                          borderRadius: 1.5,
                          bgcolor: c.bg,
                          border: `1px solid ${wm.isCompleted ? c.green + '44' : c.border}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.7rem', color: c.textMuted, minWidth: 20 }}>
                            {idx + 1}.
                          </Typography>
                          <PlayerAvatar firstName={wm.player1Id.firstName} lastName={wm.player1Id.lastName} size={22} />
                          <Typography sx={{ fontSize: '0.85rem', color: c.text, fontWeight: 500 }}>
                            {wm.player1Id.firstName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: c.textMuted }}>vs</Typography>
                          <PlayerAvatar firstName={wm.player2Id.firstName} lastName={wm.player2Id.lastName} size={22} />
                          <Typography sx={{ fontSize: '0.85rem', color: c.text, fontWeight: 500 }}>
                            {wm.player2Id.firstName}
                          </Typography>
                          {wm.isCompleted && wm.completedMatch && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                              <CheckCircleOutlineIcon sx={{ color: c.green, fontSize: 14 }} />
                              <Typography sx={{ fontSize: '0.75rem', color: c.green }}>
                                {wm.completedMatch.player1Id.id === wm.player1Id.id
                                  ? `${wm.completedMatch.score1}–${wm.completedMatch.score2}`
                                  : `${wm.completedMatch.score2}–${wm.completedMatch.score1}`}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWeeklyMatch(wm.id)}
                          sx={{ color: c.textSubtle, '&:hover': { color: c.lossColor } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleClearWeekly}
                    sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                  >
                    Clear All Weekly Matches
                  </Button>
                </>
              )}
            </Box>

            {/* ── Match Log ── */}
            <Box sx={cardSx}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: c.text, mb: 2 }}>
                Match Submission Log ({matchLogs.length})
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: c.bg }}>
                      {['#', 'Home', 'Score', 'Away', 'Winner', 'Date', 'IP'].map(h => (
                        <TableCell key={h} sx={{ ...cellSx, fontWeight: 700, color: c.textMuted, fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                          {h.toUpperCase()}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ color: c.textMuted, py: 3, borderColor: c.border }}>
                          No matches recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : matchLogs.map((log, i) => {
                      const p1 = `${log.player1Id?.firstName || '?'} ${log.player1Id?.lastName || ''}`.trim();
                      const p2 = `${log.player2Id?.firstName || '?'} ${log.player2Id?.lastName || ''}`.trim();
                      const winner = log.score1 > log.score2 ? p1 : p2;
                      return (
                        <TableRow key={log.id} sx={{ '&:hover': { bgcolor: c.border } }}>
                          <TableCell sx={{ ...cellSx, color: c.textSubtle }}>{matchLogs.length - i}</TableCell>
                          <TableCell sx={cellSx}>{p1}</TableCell>
                          <TableCell sx={{ ...cellSx, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: c.green }}>
                            {log.score1}–{log.score2}
                          </TableCell>
                          <TableCell sx={cellSx}>{p2}</TableCell>
                          <TableCell sx={{ ...cellSx, color: c.winColor, fontWeight: 600 }}>{winner.split(' ')[0]}</TableCell>
                          <TableCell sx={{ ...cellSx, color: c.textMuted, fontSize: '0.72rem' }}>
                            {new Date(log.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell sx={{ ...cellSx, color: c.textSubtle, fontSize: '0.68rem', fontFamily: 'monospace' }}>
                            {log.ipAddress}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* ── Seed Data ── */}
            <Box sx={{ ...cardSx, border: `1px solid ${c.green}44` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: c.text }}>Quick Seed</Typography>
              </Box>
              <Typography sx={{ color: c.textMuted, fontSize: '0.875rem', mb: 2 }}>
                Adds all 9 players + Week 1 fixtures in one click. Skips players that already exist. Replaces weekly schedule.
              </Typography>
              <Button
                variant="contained"
                onClick={handleSeedWeek1}
                disabled={seeding}
                sx={{
                  bgcolor: '#1B5E20',
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#155216' },
                  boxShadow: 'none',
                }}
              >
                {seeding ? 'Seeding…' : '🌱 Seed Week 1 Players + Fixtures'}
              </Button>
            </Box>

            {/* ── Danger Zone ── */}
            <Box
              sx={{
                ...cardSx,
                border: `1px solid ${c.lossColor}44`,
                bgcolor: c.lossColor + '08',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningAmberIcon sx={{ color: c.lossColor, fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: c.lossColor, fontSize: '1rem' }}>Danger Zone</Typography>
              </Box>
              <Divider sx={{ borderColor: c.lossColor + '33', mb: 2 }} />
              <Typography sx={{ color: c.textMuted, fontSize: '0.875rem', mb: 2 }}>
                Permanently delete all players, match records, weekly schedule, and rate limit data. Cannot be undone.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<WarningAmberIcon />}
                onClick={handleClearAllData}
                disabled={clearingAll}
                sx={{ textTransform: 'none' }}
              >
                {clearingAll ? 'Clearing…' : 'Clear All Data'}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
