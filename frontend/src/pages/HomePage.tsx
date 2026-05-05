import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { api } from '../apiConfig';

interface StatsData {
  matchesPlayed: number;
  topPlayer: string | null;
  totalPlayers: number;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState<StatsData>({ matchesPlayed: 0, topPlayer: null, totalPlayers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [matchesRes, rankingsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/rankings/overall'),
        ]);
        const topRanking = rankingsRes.data[0];
        const topPlayer = topRanking
          ? `${topRanking.player.firstName} ${topRanking.player.lastName}`
          : null;
        setStats({
          matchesPlayed: matchesRes.data.length,
          topPlayer,
          totalPlayers: rankingsRes.data.length,
        });
      } catch {
        // silently fail — stats are non-critical
      }
    };
    fetchStats();
  }, []);

  const heroStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(0,60,30,0.85) 0%, rgba(0,100,50,0.75) 100%), url(${process.env.PUBLIC_URL}/images/tennis-court.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: `calc(100vh - ${isSmall ? '56px' : '64px'})`,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
    padding: '32px 20px',
    textAlign: 'center' as const,
  };

  return (
    <Box>
      {/* Hero */}
      <Box sx={heroStyle}>
        <Container maxWidth="md">
          <Typography
            variant={isSmall ? 'h3' : 'h2'}
            component="h1"
            sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}
          >
            Soul Brothers Pakistan
          </Typography>
          <Typography variant={isSmall ? 'h6' : 'h5'} sx={{ mb: 0.5, opacity: 0.9, fontWeight: 400 }}>
            Tennis Championship 2025
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.75 }}>
            Organized by Osman Danish &nbsp;•&nbsp; Round Robin &nbsp;•&nbsp; 10 Players
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 5 }}>
            {[
              { label: 'Matches Played', value: stats.matchesPlayed },
              { label: 'Total Players', value: stats.totalPlayers },
              { label: 'Current Leader', value: stats.topPlayer || '—' },
            ].map(({ label, value }) => (
              <Grid item xs={12} sm={4} key={label}>
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/add-match"
              sx={{
                bgcolor: '#FFD700',
                color: '#1a3a1a',
                fontWeight: 700,
                '&:hover': { bgcolor: '#FFC200' },
                px: 4,
              }}
            >
              Submit Score
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/rankings"
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: '#FFD700', color: '#FFD700' }, px: 4 }}
            >
              View Leaderboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Feature Cards */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 1 }}>
            Track Every Match
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Round robin format — every player faces every other player
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <SportsIcon sx={{ fontSize: 48, color: 'success.main' }} />,
                title: 'Submit Scores',
                desc: 'Record match results instantly. One set, six games — pick your players and enter the score.',
                link: '/add-match',
                label: 'Submit a Score',
              },
              {
                icon: <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
                title: 'Match Results',
                desc: 'Browse all played matches with full scores, dates, and player details.',
                link: '/matches',
                label: 'See All Results',
              },
              {
                icon: <LeaderboardIcon sx={{ fontSize: 48, color: 'info.main' }} />,
                title: 'Leaderboard',
                desc: 'Live rankings with wins, losses, games won, and a full head-to-head matrix.',
                link: '/rankings',
                label: 'View Rankings',
              },
            ].map(({ icon, title, desc, link, label }) => (
              <Grid item xs={12} md={4} key={title}>
                <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {desc}
                    </Typography>
                    <Button variant="outlined" component={Link} to={link} size="small">
                      {label}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'grey.400', py: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Soul Brothers Pakistan Tennis Championship 2025 &nbsp;•&nbsp; Organized by Osman Danish
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
