import React, { useEffect, useState } from 'react';
import { api } from '../apiConfig';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAppTheme } from '../context/ThemeContext';
import PlayerAvatar from '../components/PlayerAvatar';

interface Player { id: string; firstName: string; lastName: string; }

interface Match {
  id: string;
  player1Id: Player;
  player2Id: Player;
  score1: number;
  score2: number;
  date: string;
}

interface MatchesPageProps {
  isAdminLoggedIn: boolean;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ isAdminLoggedIn }) => {
  const { c } = useAppTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Match[]>('/matches')
      .then(r => setMatches(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this match result?')) return;
    try {
      await api.delete(`/matches/${id}`);
      setMatches(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg, transition: 'background-color 0.2s' }}>
      <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 3 }}>
        {/* Page header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <FormatListBulletedIcon sx={{ color: c.text, fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: c.text }}>
            Results
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.2,
              borderRadius: 50,
              bgcolor: c.border,
              fontSize: '0.75rem',
              color: c.textMuted,
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {matches.length}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress sx={{ color: c.green }} size={32} />
          </Box>
        ) : matches.length === 0 ? (
          <Box
            sx={{
              bgcolor: c.cardBg,
              borderRadius: 2.5,
              border: `1px dashed ${c.borderStrong}`,
              py: 6,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '2rem', mb: 1.5 }}>🎾</Typography>
            <Typography sx={{ color: c.textMuted, fontWeight: 500 }}>
              No matches played yet.
            </Typography>
            <Typography sx={{ color: c.textSubtle, fontSize: '0.875rem', mt: 0.5 }}>
              Record a Week 1 fixture to see results here.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: c.cardBg,
              borderRadius: 2.5,
              border: `1px solid ${c.border}`,
              overflow: 'hidden',
            }}
          >
            {matches.map((match, i) => {
              const p1Won = match.score1 > match.score2;
              const p1 = match.player1Id;
              const p2 = match.player2Id;
              const date = new Date(match.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <Box
                  key={match.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    borderBottom: i < matches.length - 1 ? `1px solid ${c.border}` : 'none',
                    '&:hover': { bgcolor: c.border },
                  }}
                >
                  {/* Date */}
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      color: c.textSubtle,
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {date}
                  </Typography>

                  {/* Player 1 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, justifyContent: 'flex-end' }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: p1Won ? 700 : 400,
                        color: p1Won ? c.text : c.textMuted,
                        textAlign: 'right',
                      }}
                    >
                      {p1.firstName}
                    </Typography>
                    <PlayerAvatar firstName={p1.firstName} lastName={p1.lastName} size={26} />
                  </Box>

                  {/* Score */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: c.border,
                      borderRadius: 1.5,
                      minWidth: 64,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: c.text,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: 1,
                      }}
                    >
                      {match.score1}–{match.score2}
                    </Typography>
                  </Box>

                  {/* Player 2 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1 }}>
                    <PlayerAvatar firstName={p2.firstName} lastName={p2.lastName} size={26} />
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: !p1Won ? 700 : 400,
                        color: !p1Won ? c.text : c.textMuted,
                      }}
                    >
                      {p2.firstName}
                    </Typography>
                  </Box>

                  {/* Admin delete */}
                  {isAdminLoggedIn && (
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(match.id)}
                      sx={{ color: c.textSubtle, '&:hover': { color: c.lossColor }, ml: 'auto' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${c.border}`, py: 2.5, textAlign: 'center', mt: 4 }}>
        <Typography sx={{ fontSize: '0.68rem', color: c.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          SBP Summer League · Energy · Balance · Brotherhood
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: c.textSubtle, mt: 0.25 }}>
          Admin · Usman Danish
        </Typography>
      </Box>
    </Box>
  );
};

export default MatchesPage;
