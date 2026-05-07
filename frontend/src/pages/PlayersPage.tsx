import React, { useEffect, useState } from 'react';
import AddPlayerForm from '../components/AddPlayerForm';
import { api } from '../apiConfig';
import {
  Box, Typography, CircularProgress, IconButton, Alert, Container, TextField,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useAppTheme } from '../context/ThemeContext';
import PlayerAvatar from '../components/PlayerAvatar';

interface Player { id: string; firstName: string; lastName: string; }
interface PlayersPageProps { isAdminLoggedIn: boolean; }

const PlayersPage: React.FC<PlayersPageProps> = ({ isAdminLoggedIn }) => {
  const { c } = useAppTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await api.get<Player[]>('/players');
      setPlayers(res.data);
    } catch {
      setError('Failed to fetch players.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, []);

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditFirst(player.firstName);
    setEditLast(player.lastName);
    setError(null);
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id: string) => {
    if (!editFirst.trim() || !editLast.trim()) { setError('Both names are required.'); return; }
    setSaving(true);
    try {
      const res = await api.put<Player>(`/players/${id}`, { firstName: editFirst.trim(), lastName: editLast.trim() });
      setPlayers(prev => prev.map(p => p.id === id ? res.data : p));
      setEditingId(null);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the tournament?`)) return;
    try {
      await api.delete(`/players/${id}`);
      setPlayers(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to remove player.');
    }
  };

  const inputSx = {
    '& .MuiInputLabel-root': { color: c.textMuted, fontSize: '0.8rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: c.green },
    '& .MuiOutlinedInput-root': {
      color: c.text,
      fontSize: '0.875rem',
      bgcolor: c.surface,
      '& fieldset': { borderColor: c.border },
      '&:hover fieldset': { borderColor: c.borderStrong },
      '&.Mui-focused fieldset': { borderColor: c.green },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg, transition: 'background-color 0.2s' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PeopleOutlineIcon sx={{ color: c.text, fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: c.text }}>Players</Typography>
          <Box sx={{ px: 1, py: 0.2, borderRadius: 50, bgcolor: c.border, fontSize: '0.75rem', color: c.textMuted, fontWeight: 600, lineHeight: 1.6 }}>
            {players.length}
          </Box>
        </Box>

        {isAdminLoggedIn && <AddPlayerForm onPlayerAdded={fetchPlayers} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: c.green }} size={32} />
          </Box>
        ) : players.length === 0 ? (
          <Box sx={{ bgcolor: c.cardBg, borderRadius: 2.5, border: `1px dashed ${c.borderStrong}`, py: 5, textAlign: 'center' }}>
            <Typography sx={{ color: c.textMuted }}>No players added yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: c.cardBg, borderRadius: 2.5, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
            {players.map((player, i) => {
              const isEditing = editingId === player.id;
              return (
                <Box
                  key={player.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: isEditing ? 1.25 : 1.5,
                    borderBottom: i < players.length - 1 ? `1px solid ${c.border}` : 'none',
                    bgcolor: isEditing ? c.greenMuted : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <PlayerAvatar
                    firstName={isEditing ? editFirst || player.firstName : player.firstName}
                    lastName={isEditing ? editLast || player.lastName : player.lastName}
                    size={36}
                  />

                  {isEditing ? (
                    <>
                      <TextField
                        size="small"
                        label="First name"
                        value={editFirst}
                        onChange={e => setEditFirst(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(player.id); if (e.key === 'Escape') cancelEdit(); }}
                        autoFocus
                        sx={{ ...inputSx, width: 140 }}
                      />
                      <TextField
                        size="small"
                        label="Last name"
                        value={editLast}
                        onChange={e => setEditLast(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(player.id); if (e.key === 'Escape') cancelEdit(); }}
                        sx={{ ...inputSx, width: 140 }}
                      />
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                        <IconButton
                          size="small"
                          onClick={() => saveEdit(player.id)}
                          disabled={saving}
                          sx={{ color: c.green, '&:hover': { bgcolor: `${c.green}22` } }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={cancelEdit}
                          sx={{ color: c.textMuted, '&:hover': { color: c.text } }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1, fontWeight: 500, color: c.text, fontSize: '0.95rem' }}>
                        {player.firstName} {player.lastName}
                      </Typography>
                      {isAdminLoggedIn && (
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          <IconButton
                            size="small"
                            onClick={() => startEdit(player)}
                            sx={{ color: c.textSubtle, '&:hover': { color: c.green } }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemove(player.id, `${player.firstName} ${player.lastName}`)}
                            sx={{ color: c.textSubtle, '&:hover': { color: c.lossColor } }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PlayersPage;
