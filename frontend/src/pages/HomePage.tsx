import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Divider, Button } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { api } from '../apiConfig';
import { useAppTheme } from '../context/ThemeContext';
import PlayerAvatar from '../components/PlayerAvatar';

interface Player { id: string; firstName: string; lastName: string; }

interface WeeklyMatchEntry {
  id: string;
  player1Id: Player;
  player2Id: Player;
  weekLabel: string;
  isCompleted: boolean;
  completedMatch: { player1Id: Player; player2Id: Player; score1: number; score2: number } | null;
}

interface Ranking {
  player: Player;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  gameDiff: number;
  gamesWon: number;
}

function getDisplayScore(wm: WeeklyMatchEntry) {
  if (!wm.isCompleted || !wm.completedMatch) return null;
  const m = wm.completedMatch;
  if (m.player1Id.id === wm.player1Id.id) return { s1: m.score1, s2: m.score2 };
  return { s1: m.score2, s2: m.score1 };
}

const HomePage: React.FC = () => {
  const { c } = useAppTheme();
  const navigate = useNavigate();
  const [weekly, setWeekly] = useState<WeeklyMatchEntry[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<WeeklyMatchEntry[]>('/weekly-matches'),
      api.get<Ranking[]>('/rankings/overall'),
    ])
      .then(([wmRes, rankRes]) => {
        setWeekly(wmRes.data);
        setRankings(rankRes.data);
        // Default to latest week
        const seen = new Set<string>();
        const labels: string[] = wmRes.data.map((w: WeeklyMatchEntry) => w.weekLabel).filter((l: string) => seen.has(l) ? false : seen.add(l) && true);
        if (labels.length > 0) setSelectedWeek(labels[labels.length - 1] as string);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Unique week labels in chronological order (API returns sorted by createdAt)
  const weekLabels = weekly.reduce<string[]>((acc, w) => acc.includes(w.weekLabel) ? acc : [...acc, w.weekLabel], []);
  const weekFixtures = weekly.filter(w => w.weekLabel === selectedWeek);

  const completedWeekly = weekFixtures.filter(w => w.isCompleted).length;
  const totalWeekly = weekFixtures.length;
  // Use all-match stats from rankings so non-weekly matches are included
  const totalMatchesPlayed = rankings.reduce((sum, r) => sum + r.wins, 0);
  const gamesContested = rankings.reduce((sum, r) => sum + r.gamesWon, 0);
  const leadScore = rankings.length > 0 ? rankings[0].points : 0;

  const weekNum = selectedWeek.match(/\d+/)?.[0] ?? '1';
  const playerCount = rankings.length > 0 ? rankings.length : 9;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg, transition: 'background-color 0.2s' }}>
      <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
            <CircularProgress sx={{ color: c.green }} size={32} />
          </Box>
        ) : (
          <>
            {/* ── Hero Card ── */}
            <Box
              sx={{
                bgcolor: c.cardBg,
                borderRadius: 3,
                p: 3,
                mb: 3,
                border: `1px solid ${c.border}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circle top-right */}
              <Box
                sx={{
                  position: 'absolute',
                  right: -24,
                  top: -24,
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  bgcolor: '#1B5E20',
                  opacity: 0.9,
                }}
              />

              {/* League label */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, position: 'relative' }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: c.green, flexShrink: 0 }} />
                <Typography
                  sx={{
                    color: c.textMuted,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  SBP Summer League · Tennis Cup 2026
                </Typography>
              </Box>

              {/* Headline */}
              <Typography
                sx={{
                  fontSize: { xs: '2rem', sm: '2.4rem' },
                  fontWeight: 800,
                  color: c.text,
                  lineHeight: 1.05,
                  mb: 1,
                  position: 'relative',
                  letterSpacing: '-0.5px',
                }}
              >
                Where{' '}
                <Box
                  component="span"
                  sx={{ color: c.green, fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  brothers
                </Box>
                {' '}compete.
              </Typography>

              <Typography sx={{ color: c.textMuted, fontSize: '0.875rem', mb: 2.5, position: 'relative' }}>
                Round-robin · {playerCount} players · home &amp; away · most points wins.
              </Typography>

              <Divider sx={{ borderColor: c.border, mb: 2.5 }} />

              {/* Stats row */}
              <Box sx={{ display: 'flex', gap: { xs: 3, sm: 4 } }}>
                <Box>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {totalMatchesPlayed}
                  </Typography>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: c.textMuted, textTransform: 'uppercase', mt: 0.25 }}>
                    Matches Played
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {gamesContested}
                  </Typography>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: c.textMuted, textTransform: 'uppercase', mt: 0.25 }}>
                    Games Contested
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {leadScore}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: c.textMuted }}>pts</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: c.textMuted, textTransform: 'uppercase', mt: 0.25 }}>
                    Lead Score
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ── Weekly Fixtures ── */}
            {weekly.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {/* Section header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CalendarTodayIcon sx={{ color: c.textMuted, fontSize: 16 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: c.text }}>
                      Week {weekNum} fixtures
                    </Typography>
                    <Box
                      sx={{
                        px: 1, py: 0.2, borderRadius: 50, bgcolor: c.border,
                        fontSize: '0.7rem', color: c.textMuted, fontWeight: 600, lineHeight: 1.6,
                      }}
                    >
                      {completedWeekly}/{totalWeekly}
                    </Box>
                  </Box>

                  {/* Week selector */}
                  {weekLabels.length > 1 && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {weekLabels.map(label => {
                        const num = label.match(/\d+/)?.[0] ?? label;
                        const active = label === selectedWeek;
                        return (
                          <Box
                            key={label}
                            onClick={() => setSelectedWeek(label)}
                            sx={{
                              px: 1.25, py: 0.35, borderRadius: 50,
                              border: `1px solid ${active ? c.green : c.borderStrong}`,
                              bgcolor: active ? c.green : 'transparent',
                              color: active ? '#fff' : c.textMuted,
                              fontSize: '0.72rem', fontWeight: active ? 700 : 500,
                              cursor: 'pointer', userSelect: 'none',
                              transition: 'all 0.1s',
                              '&:hover': { borderColor: c.green, color: active ? '#fff' : c.green },
                            }}
                          >
                            W{num}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                {/* Match cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {weekFixtures.map((wm, idx) => {
                    const score = getDisplayScore(wm);
                    const homeWon = score ? score.s1 > score.s2 : false;
                    return (
                      <Box
                        key={wm.id}
                        sx={{
                          bgcolor: c.cardBg,
                          borderRadius: 2.5,
                          p: 2,
                          border: `1px solid ${wm.isCompleted ? c.greenMuted : c.border}`,
                          transition: 'border-color 0.15s',
                        }}
                      >
                        {/* Match label */}
                        <Typography
                          sx={{
                            fontSize: '0.63rem',
                            color: c.textMuted,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            mb: 1,
                          }}
                        >
                          Match {idx + 1} · @ {wm.player1Id.firstName}'s
                        </Typography>

                        {/* Players row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <PlayerAvatar firstName={wm.player1Id.firstName} lastName={wm.player1Id.lastName} size={30} />
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: wm.isCompleted && homeWon ? c.green : c.text,
                            }}
                          >
                            {wm.player1Id.firstName}
                          </Typography>

                          <Typography sx={{ color: c.textSubtle, fontSize: '0.78rem', mx: 0.5 }}>vs</Typography>

                          <PlayerAvatar firstName={wm.player2Id.firstName} lastName={wm.player2Id.lastName} size={30} />
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: wm.isCompleted && !homeWon ? c.green : c.text,
                              flex: 1,
                            }}
                          >
                            {wm.player2Id.firstName}
                          </Typography>

                          {/* Action / score */}
                          {wm.isCompleted && score ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <CheckCircleOutlineIcon sx={{ color: c.green, fontSize: 16 }} />
                              <Typography sx={{ fontWeight: 700, color: c.green, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                                {score.s1}–{score.s2}
                              </Typography>
                            </Box>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<DriveFileRenameOutlineIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => navigate(`/add-match?player1=${wm.player1Id.id}&player2=${wm.player2Id.id}`)}
                              sx={{
                                bgcolor: '#1B5E20',
                                color: '#fff',
                                borderRadius: 50,
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                                '&:hover': { bgcolor: '#155216' },
                                boxShadow: 'none',
                              }}
                            >
                              Record
                            </Button>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Add custom match */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Box
                    component={Link}
                    to="/add-match"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: c.textMuted,
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': { color: c.green },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                    Add a custom match
                  </Box>
                </Box>
              </Box>
            )}

            {/* Empty weekly state */}
            {weekly.length === 0 && (
              <Box
                sx={{
                  bgcolor: c.cardBg,
                  borderRadius: 2.5,
                  p: 3,
                  mb: 3,
                  border: `1px solid ${c.border}`,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ color: c.textMuted, mb: 1 }}>No fixtures scheduled yet.</Typography>
                <Box component={Link} to="/add-match" sx={{ color: c.green, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                  + Record a custom match
                </Box>
              </Box>
            )}

            {/* ── Leaderboard ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <EmojiEventsOutlinedIcon sx={{ color: c.text, fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: c.text }}>
                    Leaderboard
                  </Typography>
                </Box>
                <Box
                  component={Link}
                  to="/rankings"
                  sx={{ color: c.textMuted, textDecoration: 'none', fontSize: '0.8rem', '&:hover': { color: c.green } }}
                >
                  Full table →
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: c.cardBg,
                  borderRadius: 2.5,
                  border: `1px solid ${c.border}`,
                  overflow: 'hidden',
                }}
              >
                {/* Table header */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 40px 40px 40px 52px',
                    px: 2,
                    py: 1,
                    borderBottom: `1px solid ${c.border}`,
                    alignItems: 'center',
                  }}
                >
                  {['#', 'PLAYER', 'P', 'W', 'L', 'PTS'].map(h => (
                    <Typography key={h} sx={{ fontSize: '0.62rem', fontWeight: 700, color: c.textMuted, letterSpacing: '0.1em' }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {rankings.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ color: c.textMuted, fontSize: '0.875rem' }}>
                      No matches yet — check back soon.
                    </Typography>
                  </Box>
                ) : (
                  rankings.map((r, i) => (
                    <Box
                      key={r.player.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '36px 1fr 40px 40px 40px 52px',
                        px: 2,
                        py: 1.25,
                        alignItems: 'center',
                        borderBottom: i < rankings.length - 1 ? `1px solid ${c.border}` : 'none',
                        '&:hover': { bgcolor: c.border },
                      }}
                    >
                      <Typography
                        sx={{ fontSize: '0.875rem', fontWeight: 700, color: i === 0 ? c.green : c.textMuted }}
                      >
                        {i + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayerAvatar firstName={r.player.firstName} lastName={r.player.lastName} size={26} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: i < 3 ? 600 : 400, color: c.text }}>
                          {r.player.firstName}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.875rem', color: c.textMuted }}>
                        {r.matchesPlayed}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: c.winColor }}>
                        {r.wins}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: r.losses > 0 ? c.lossColor : c.textMuted }}>
                        {r.losses}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: c.text }}>
                        {r.points}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${c.border}`, py: 2.5, textAlign: 'center', mt: 4 }}>
        <Typography sx={{ fontSize: '0.68rem', color: c.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          SBP Summer League · Energy · Balance · Brotherhood
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: c.textSubtle, mt: 0.5 }}>
          Admin ·{' '}
          <Box
            component={Link}
            to="/admin"
            sx={{ color: c.textSubtle, textDecoration: 'none', '&:hover': { color: c.textMuted } }}
          >
            Usman Danish
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
