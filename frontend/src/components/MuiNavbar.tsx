import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { useAppTheme } from '../context/ThemeContext';

interface MuiNavbarProps {
  isAdminLoggedIn: boolean;
  onLoginStatusChange: (status: boolean) => void;
}

const NAV_TABS = [
  { label: 'Home', path: '/', Icon: HomeOutlinedIcon },
  { label: 'Results', path: '/matches', Icon: FormatListBulletedIcon },
  { label: 'Stats', path: '/rankings', Icon: EmojiEventsOutlinedIcon },
];

const ADMIN_PATHS = ['/admin', '/players', '/add-match'];

const MuiNavbar: React.FC<MuiNavbarProps> = () => {
  const { darkMode, toggleDark, c } = useAppTheme();
  const location = useLocation();

  const isAdminArea = ADMIN_PATHS.some(p => location.pathname.startsWith(p));
  const activeTab = NAV_TABS.find(t => location.pathname === t.path)?.path ?? '/';

  return (
    <Box
      sx={{
        bgcolor: c.bg,
        borderBottom: `1px solid ${c.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Agency banner */}
      <Box
        sx={{
          py: 1,
          px: 2,
          textAlign: 'center',
          borderBottom: `1px solid ${c.border}`,
          bgcolor: c.surface,
        }}
      >
        <Typography sx={{ color: c.textMuted, fontSize: '0.75rem', letterSpacing: '0.04em' }}>
          Designed and Developed by{' '}
          <Box
            component="a"
            href="https://magency.co"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: c.green,
              textDecoration: 'none',
              fontWeight: 700,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Magency Consultants
          </Box>
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 680, mx: 'auto', px: 2, pt: 1.5, pb: isAdminArea ? 1.5 : 1.25 }}>
        {/* Logo row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isAdminArea ? 0 : 1.5 }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#1B5E20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '-0.5px' }}>
                SB
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: c.text, lineHeight: 1.2 }}>
                Soul Brothers
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: c.textMuted, lineHeight: 1 }}>
                Tennis Cup · 2026
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={toggleDark} sx={{ color: c.textMuted }}>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Box>

        {/* Pill tab bar — only on public pages */}
        {!isAdminArea && (
          <Box
            sx={{
              display: 'flex',
              bgcolor: c.tabBar,
              borderRadius: 50,
              p: '4px',
              gap: '3px',
            }}
          >
            {NAV_TABS.map(tab => {
              const active = activeTab === tab.path;
              return (
                <Box
                  key={tab.path}
                  component={Link}
                  to={tab.path}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    py: '8px',
                    px: 1,
                    borderRadius: 50,
                    bgcolor: active ? c.tabActiveBg : 'transparent',
                    color: active ? c.tabActiveText : c.tabInactiveText,
                    textDecoration: 'none',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.825rem',
                    transition: 'background-color 0.15s, color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    userSelect: 'none',
                  }}
                >
                  <tab.Icon sx={{ fontSize: 14 }} />
                  {tab.label}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MuiNavbar;
