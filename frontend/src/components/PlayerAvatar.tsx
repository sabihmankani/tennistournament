import React from 'react';
import { Box } from '@mui/material';

const PALETTE = [
  '#8B6914', '#2E7D32', '#C62828', '#E65100', '#558B2F',
  '#1565C0', '#6A1B9A', '#00838F', '#AD1457', '#37474F',
  '#4E342E', '#0277BD', '#EF6C00', '#00695C', '#283593',
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ firstName, lastName, size = 32 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      bgcolor: avatarColor(firstName + lastName),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: '#fff',
      fontWeight: 700,
      fontSize: size * 0.375,
      letterSpacing: '0.02em',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      userSelect: 'none',
    }}
  >
    {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
  </Box>
);

export default PlayerAvatar;
