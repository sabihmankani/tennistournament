import React, { useEffect, useState } from 'react';
import AddPlayerForm from '../components/AddPlayerForm';
import { api } from '../apiConfig';
import { Box, Typography, CircularProgress, IconButton, Alert, Container } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the tournament?`)) return;
    try {
      await api.delete(`/players/${id}`);
      setPlayers(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to remove player.');
    }
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
            {players.map((player, i) => (
              <Box
                key={player.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderBottom: i < players.length - 1 ? `1px solid ${c.border}` : 'none',
                  '&:hover': { bgcolor: c.border },
                }}
              >
                <PlayerAvatar firstName={player.firstName} lastName={player.lastName} size={36} />
                <Typography sx={{ flex: 1, fontWeight: 500, color: c.text, fontSize: '0.95rem' }}>
                  {player.firstName} {player.lastName}
                </Typography>
                {isAdminLoggedIn && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(player.id, `${player.firstName} ${player.lastName}`)}
                    sx={{ color: c.textSubtle, '&:hover': { color: c.lossColor } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PlayersPage;
