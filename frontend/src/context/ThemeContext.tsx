import React, { createContext, useContext, useState } from 'react';

export interface ThemeColors {
  bg: string;
  cardBg: string;
  surface: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  green: string;
  greenDark: string;
  greenMuted: string;
  tabBar: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabInactiveText: string;
  winColor: string;
  lossColor: string;
}

const light: ThemeColors = {
  bg: '#EDE8DC',
  cardBg: '#F5F1E8',
  surface: '#FAFAF5',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.15)',
  text: '#1A1A1A',
  textMuted: '#777777',
  textSubtle: '#BBBBBB',
  green: '#1B5E20',
  greenDark: '#155216',
  greenMuted: 'rgba(27,94,32,0.1)',
  tabBar: '#D9D4C8',
  tabActiveBg: '#1A1A1A',
  tabActiveText: '#FFFFFF',
  tabInactiveText: '#666666',
  winColor: '#2E7D32',
  lossColor: '#C62828',
};

const dark: ThemeColors = {
  bg: '#0F1A0F',
  cardBg: '#162116',
  surface: '#1E2E1E',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.18)',
  text: '#F0EDE6',
  textMuted: 'rgba(240,237,230,0.5)',
  textSubtle: 'rgba(240,237,230,0.25)',
  green: '#66BB6A',
  greenDark: '#4CAF50',
  greenMuted: 'rgba(76,175,80,0.15)',
  tabBar: '#1C2B1C',
  tabActiveBg: '#1A1A1A',
  tabActiveText: '#FFFFFF',
  tabInactiveText: 'rgba(240,237,230,0.45)',
  winColor: '#66BB6A',
  lossColor: '#EF5350',
};

interface ThemeCtx {
  darkMode: boolean;
  toggleDark: () => void;
  c: ThemeColors;
}

const Ctx = createContext<ThemeCtx>({ darkMode: false, toggleDark: () => {}, c: light });

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <Ctx.Provider value={{ darkMode, toggleDark: () => setDarkMode(d => !d), c: darkMode ? dark : light }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAppTheme = () => useContext(Ctx);
