import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Tooltip } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { api } from '../apiConfig';
import { useAppTheme } from '../context/ThemeContext';
import PlayerAvatar from '../components/PlayerAvatar';

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

interface H2HEntry { wins: number; losses: number; scores: { s1: number; s2: number }[]; }
interface H2HData { players: Player[]; h2h: Record<string, Record<string, H2HEntry | null>>; }

const RankingsPage: React.FC = () => {
  const { c } = useAppTheme();
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [h2hData, setH2HData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PlayerRanking[]>('/rankings/overall'),
      api.get<H2HData>('/rankings/head-to-head'),
    ])
      .then(([rankRes, h2hRes]) => {
        setRankings(rankRes.data);
        setH2HData(h2hRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg, transition: 'background-color 0.2s' }}>
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress sx={{ color: c.green }} size={32} />
          </Box>
        ) : (
          <>
            {/* ── Standings ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsOutlinedIcon sx={{ color: c.text, fontSize: 22 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: c.text }}>
                  Standings
                </Typography>
                {rankings.length > 0 && (
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
                    {rankings.length}
                  </Box>
                )}
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: c.textMuted, letterSpacing: '0.06em' }}>
                WIN = 3PTS
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: c.cardBg,
                borderRadius: 2.5,
                border: `1px solid ${c.border}`,
                overflow: 'hidden',
                mb: 4,
              }}
            >
              {/* Table header */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr 48px 48px 48px 60px 60px',
                  px: 2,
                  py: 1.25,
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                {['#', 'PLAYER', 'P', 'W', 'L', '+/−', 'PTS'].map(h => (
                  <Typography key={h} sx={{ fontSize: '0.62rem', fontWeight: 700, color: c.textMuted, letterSpacing: '0.1em' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              {rankings.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography sx={{ color: c.textMuted }}>No matches yet.</Typography>
                </Box>
              ) : (
                rankings.map((r, i) => (
                  <Box
                    key={r.player.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '44px 1fr 48px 48px 48px 60px 60px',
                      px: 2,
                      py: 1.35,
                      alignItems: 'center',
                      borderBottom: i < rankings.length - 1 ? `1px solid ${c.border}` : 'none',
                      '&:hover': { bgcolor: c.border },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: i === 0 ? c.green : c.textMuted,
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayerAvatar firstName={r.player.firstName} lastName={r.player.lastName} size={28} />
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: i < 3 ? 600 : 400, color: c.text }}>
                        {r.player.firstName} {r.player.lastName}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: c.textMuted }}>
                      {r.matchesPlayed}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: c.winColor }}>
                      {r.wins}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: r.losses > 0 ? c.lossColor : c.textMuted }}>
                      {r.losses}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: r.gameDiff > 0 ? c.winColor : r.gameDiff < 0 ? c.lossColor : c.textMuted,
                      }}
                    >
                      {r.gameDiff > 0 ? '+' : ''}{r.gameDiff}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: c.text }}>
                      {r.points}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>

            {/* ── Head-to-Head ── */}
            {h2hData && h2hData.players.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: c.text }}>
                    Head-to-head
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: c.textMuted, letterSpacing: '0.08em' }}>
                    ROW VS COLUMN · HOME / AWAY
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: c.cardBg,
                    borderRadius: 2.5,
                    border: `1px solid ${c.border}`,
                    overflow: 'auto',
                  }}
                >
                  <Box sx={{ minWidth: 'max-content' }}>
                    {/* Header row */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: `120px repeat(${h2hData.players.length}, 62px)`,
                        borderBottom: `1px solid ${c.border}`,
                      }}
                    >
                      <Box sx={{ p: 1 }} />
                      {h2hData.players.map(p => (
                        <Tooltip key={p.id} title={`${p.firstName} ${p.lastName}`} arrow>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              py: 1,
                            }}
                          >
                            <PlayerAvatar firstName={p.firstName} lastName={p.lastName} size={24} />
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>

                    {/* Data rows */}
                    {h2hData.players.map((rowP, ri) => (
                      <Box
                        key={rowP.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: `120px repeat(${h2hData.players.length}, 62px)`,
                          borderBottom: ri < h2hData.players.length - 1 ? `1px solid ${c.border}` : 'none',
                          '&:hover': { bgcolor: c.border },
                        }}
                      >
                        {/* Row label */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 1,
                            borderRight: `1px solid ${c.border}`,
                          }}
                        >
                          <Typography sx={{ fontSize: '0.8rem', color: c.text, fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {rowP.firstName}
                          </Typography>
                        </Box>

                        {/* Cells — each shows up to 2 scores (home + away) stacked */}
                        {h2hData.players.map(colP => {
                          if (rowP.id === colP.id) {
                            return (
                              <Box key={colP.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: c.border }}>
                                <Typography sx={{ color: c.textSubtle, fontSize: '0.875rem' }}>—</Typography>
                              </Box>
                            );
                          }

                          const result = h2hData.h2h[rowP.id]?.[colP.id];
                          const scores = result?.scores ?? [];
                          // Cell bg: green tint if overall winning record, red if losing, neutral otherwise
                          const allWins = scores.length > 0 && scores.every(s => s.s1 > s.s2);
                          const allLosses = scores.length > 0 && scores.every(s => s.s1 < s.s2);
                          const cellBg = allWins ? `${c.winColor}15` : allLosses ? `${c.lossColor}10` : 'transparent';

                          return (
                            <Box
                              key={colP.id}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.25,
                                py: 0.75,
                                bgcolor: cellBg,
                              }}
                            >
                              {[0, 1].map(i => {
                                const s = scores[i];
                                if (!s) {
                                  return (
                                    <Typography key={i} sx={{ color: c.textSubtle, fontSize: '0.65rem', lineHeight: 1.4 }}>·</Typography>
                                  );
                                }
                                const won = s.s1 > s.s2;
                                return (
                                  <Typography
                                    key={i}
                                    sx={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: won ? c.winColor : c.lossColor,
                                      fontVariantNumeric: 'tabular-nums',
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {s.s1}–{s.s2}
                                  </Typography>
                                );
                              })}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${c.border}`, py: 2.5, textAlign: 'center', mt: 4 }}>
        <Typography sx={{ fontSize: '0.68rem', color: c.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          SBP Summer League · Energy · Balance · Brotherhood
        </Typography>
      </Box>
    </Box>
  );
};

export default RankingsPage;
