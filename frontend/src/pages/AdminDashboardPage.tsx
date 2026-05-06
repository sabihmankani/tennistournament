import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Typography, Button, Container, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Box, Chip, Divider, FormControl, InputLabel, Select,
  MenuItem, TextField, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
  const navigate = useNavigate();

  // State
  const [players, setPlayers] = useState<Player[]>([]);
  const [weekly, setWeekly] = useState<WeeklyMatchEntry[]>([]);
  const [matchLogs, setMatchLogs] = useState<MatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add match form
  const [newP1, setNewP1] = useState('');
  const [newP2, setNewP2] = useState('');
  const [weekLabel, setWeekLabel] = useState('');
  const [addingMatch, setAddingMatch] = useState(false);

  const [clearingAll, setClearingAll] = useState(false);

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
    if (!newP1 || !newP2 || newP1 === newP2) {
      setError('Select two different players.'); return;
    }
    setAddingMatch(true);
    setError(null);
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
      setError('Failed to remove match from schedule.');
    }
  };

  const handleClearWeekly = async () => {
    if (!window.confirm('Clear all matches from this week\'s schedule?')) return;
    try {
      await api.delete('/admin/weekly-matches');
      setWeekly([]);
      setSuccess('Weekly schedule cleared.');
    } catch {
      setError('Failed to clear schedule.');
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ This will delete ALL players, matches, and schedule. Are you absolutely sure?')) return;
    if (!window.confirm('Last chance — delete everything?')) return;
    setClearingAll(true);
    try {
      await api.delete('/admin/clear-all');
      setSuccess('All data cleared.');
      setWeekly([]); setMatchLogs([]); setPlayers([]);
    } catch {
      setError('Failed to clear data.');
    } finally {
      setClearingAll(false);
    }
  };

  const handleUpdateLabel = async () => {
    try {
      await api.put('/admin/weekly-matches/label', { weekLabel });
      setSuccess('Week label updated.');
    } catch {
      setError('Failed to update label.');
    }
  };

  const sx = {
    page: { bgcolor: '#0a0f0a', minHeight: '100vh' },
    header: { background: 'linear-gradient(135deg, #0d2e0d, #1a4d1a)', borderBottom: '2px solid #4caf50', py: 3, px: 3 },
    card: { bgcolor: '#111c11', border: '1px solid #1e3a1e', borderRadius: 2, p: 3, mb: 4 },
    label: { color: 'rgba(255,255,255,0.5)' },
    text: { color: 'rgba(255,255,255,0.85)' },
    border: { borderColor: '#1a2e1a' },
  };

  return (
    <Box sx={sx.page}>
      {/* Header */}
      <Box sx={sx.header}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettingsIcon sx={{ color: '#c8ff00' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#c8ff00' }}>Admin Dashboard</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>SBP Summer Tennis League 2026</Typography>
            </Box>
          </Box>
          <Button variant="outlined" color="error" onClick={handleLogout} size="small">Logout</Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: '#c8ff00' }} />
          </Box>
        ) : (
          <>
            {/* ── Weekly Schedule ── */}
            <Box sx={sx.card}>
              <Typography variant="h6" sx={{ color: '#c8ff00', fontWeight: 700, mb: 0.5 }}>
                This Week's Schedule
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 2 }}>
                Set which matches need to be played this week. Players will see "Record Score" buttons on the home page.
              </Typography>

              {/* Week label */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField
                  size="small"
                  label="Week label (e.g. Week 1 — May 5–11)"
                  value={weekLabel}
                  onChange={e => setWeekLabel(e.target.value)}
                  sx={{
                    flex: 1,
                    '& .MuiInputLabel-root': sx.label,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: '#2e4a2e' },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleUpdateLabel}
                  disabled={weekly.length === 0}
                  sx={{ borderColor: '#4caf50', color: '#4caf50', whiteSpace: 'nowrap' }}
                >
                  Update Label
                </Button>
              </Box>

              {/* Add match form */}
              <Box
                sx={{
                  display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
                  p: 2, bgcolor: '#0d1f0d', borderRadius: 2, border: '1px solid #1e3a1e', mb: 2,
                }}
              >
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel sx={sx.label}>Home Player (P1)</InputLabel>
                  <Select
                    value={newP1} label="Home Player (P1)"
                    onChange={e => setNewP1(e.target.value)}
                    sx={{ color: 'white', '& fieldset': { borderColor: '#2e4a2e' }, '& .MuiSvgIcon-root': sx.label }}
                  >
                    <MenuItem value="">Select player</MenuItem>
                    {players.map(p => (
                      <MenuItem key={p.id} value={p.id} disabled={p.id === newP2}>
                        {p.firstName} {p.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>vs</Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel sx={sx.label}>Away Player (P2)</InputLabel>
                  <Select
                    value={newP2} label="Away Player (P2)"
                    onChange={e => setNewP2(e.target.value)}
                    sx={{ color: 'white', '& fieldset': { borderColor: '#2e4a2e' }, '& .MuiSvgIcon-root': sx.label }}
                  >
                    <MenuItem value="">Select player</MenuItem>
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
                  sx={{ bgcolor: '#c8ff00', color: '#0a1a0a', fontWeight: 700, '&:hover': { bgcolor: '#b0e000' } }}
                >
                  Add to Schedule
                </Button>
              </Box>

              {/* Current schedule */}
              {weekly.length === 0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 2 }}>
                  No matches scheduled yet. Add matches above.
                </Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {weekly.map(wm => (
                      <Box
                        key={wm.id}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          p: 1.5, bgcolor: '#0d1a0d', borderRadius: 1.5,
                          border: '1px solid', borderColor: wm.isCompleted ? '#2e7d32' : '#1e3a1e',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                            <Chip label="H" size="small" sx={{ height: 18, bgcolor: '#1a3a1a', color: '#c8ff00', mr: 0.75 }} />
                            {wm.player1Id.firstName} {wm.player1Id.lastName}
                            <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 8px' }}>vs</span>
                            <Chip label="A" size="small" sx={{ height: 18, bgcolor: '#1a1a3a', color: '#82b1ff', mr: 0.75 }} />
                            {wm.player2Id.firstName} {wm.player2Id.lastName}
                          </Typography>
                          {wm.isCompleted && wm.completedMatch && (
                            <Typography variant="caption" sx={{ color: '#4caf50', ml: 0.5 }}>
                              ✓ Played: {
                                wm.completedMatch.player1Id.id === wm.player1Id.id
                                  ? `${wm.completedMatch.score1}–${wm.completedMatch.score2}`
                                  : `${wm.completedMatch.score2}–${wm.completedMatch.score1}`
                              }
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {wm.isCompleted && <Chip label="Done" size="small" color="success" />}
                          <IconButton
                            size="small" color="error"
                            onClick={() => handleDeleteWeeklyMatch(wm.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant="outlined" color="error" size="small"
                    onClick={handleClearWeekly}
                  >
                    Clear All Weekly Matches
                  </Button>
                </>
              )}
            </Box>

            {/* ── Match Log ── */}
            <Box sx={sx.card}>
              <Typography variant="h6" sx={{ color: '#c8ff00', fontWeight: 700, mb: 2 }}>
                Match Submission Log ({matchLogs.length})
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: '#0d1a0d', border: '1px solid #1e3a1e' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#0d2e0d' }}>
                      {['#', 'Home', 'Score', 'Away', 'Winner', 'Date', 'IP'].map(h => (
                        <TableCell key={h} sx={{ color: '#c8ff00', fontWeight: 700, borderColor: '#1e3a1e', py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ color: 'rgba(255,255,255,0.3)', py: 3, borderColor: '#1e3a1e' }}>
                          No matches recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      matchLogs.map((log, i) => {
                        const p1 = `${log.player1Id?.firstName || '?'} ${log.player1Id?.lastName || ''}`.trim();
                        const p2 = `${log.player2Id?.firstName || '?'} ${log.player2Id?.lastName || ''}`.trim();
                        const winner = log.score1 > log.score2 ? p1 : p2;
                        return (
                          <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.3)', borderColor: '#1a2e1a' }}>{matchLogs.length - i}</TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)', borderColor: '#1a2e1a' }}>{p1}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#c8ff00', borderColor: '#1a2e1a' }}>
                              {log.score1}–{log.score2}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)', borderColor: '#1a2e1a' }}>{p2}</TableCell>
                            <TableCell sx={{ borderColor: '#1a2e1a' }}>
                              <Chip label={winner} size="small" sx={{ bgcolor: 'rgba(76,175,80,0.2)', color: '#4caf50', fontSize: '0.65rem' }} />
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', borderColor: '#1a2e1a' }}>
                              {new Date(log.date).toLocaleString('en-CA')}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', borderColor: '#1a2e1a' }}>
                              {log.ipAddress}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ── Danger Zone ── */}
            <Box
              sx={{
                ...sx.card,
                border: '1px solid rgba(239,83,80,0.4)',
                bgcolor: 'rgba(239,83,80,0.05)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningAmberIcon sx={{ color: '#ef5350' }} />
                <Typography variant="h6" sx={{ color: '#ef5350', fontWeight: 700 }}>Danger Zone</Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(239,83,80,0.2)', mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
                Permanently delete all players, match records, weekly schedule, and rate limit data. This cannot be undone.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearAllData}
                disabled={clearingAll}
                startIcon={<WarningAmberIcon />}
              >
                {clearingAll ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
