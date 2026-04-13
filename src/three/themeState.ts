// Reactive theme state shared between React components and Three.js
// Uses the same direct-mutation pattern as powerState for frame-level reads

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gold: string;
  background: string;
  fogColor: string;
  // CSS HSL values
  cssPrimary: string;
  cssSecondary: string;
  cssAccent: string;
  cssBackground: string;
  cssMuted: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const themes: Theme[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      primary: '#ff2a6d',
      secondary: '#b743e8',
      accent: '#05d9e8',
      gold: '#ffb800',
      background: '#04000a',
      fogColor: '#06020a',
      cssPrimary: '330 100% 58%',
      cssSecondary: '270 80% 59%',
      cssAccent: '185 97% 46%',
      cssBackground: '270 100% 2%',
      cssMuted: '260 20% 15%',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#22d3ee',
      gold: '#93c5fd',
      background: '#020617',
      fogColor: '#020617',
      cssPrimary: '217 92% 68%',
      cssSecondary: '258 90% 76%',
      cssAccent: '188 94% 53%',
      cssBackground: '222 84% 5%',
      cssMuted: '217 33% 17%',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fbbf24',
      gold: '#fb923c',
      background: '#0c0400',
      fogColor: '#0a0300',
      cssPrimary: '25 95% 53%',
      cssSecondary: '0 84% 60%',
      cssAccent: '45 93% 56%',
      cssBackground: '30 100% 2%',
      cssMuted: '20 20% 15%',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    colors: {
      primary: '#22c55e',
      secondary: '#10b981',
      accent: '#84cc16',
      gold: '#4ade80',
      background: '#000a02',
      fogColor: '#000a02',
      cssPrimary: '142 71% 45%',
      cssSecondary: '160 60% 39%',
      cssAccent: '84 81% 44%',
      cssBackground: '140 100% 2%',
      cssMuted: '140 20% 12%',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#818cf8',
      secondary: '#6366f1',
      accent: '#2dd4bf',
      gold: '#a5b4fc',
      background: '#030014',
      fogColor: '#030014',
      cssPrimary: '235 82% 74%',
      cssSecondary: '239 84% 67%',
      cssAccent: '170 77% 50%',
      cssBackground: '253 100% 4%',
      cssMuted: '240 20% 15%',
    },
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#6d28d9',
      secondary: '#db2777',
      accent: '#0891b2',
      gold: '#d97706',
      background: '#f8fafc',
      fogColor: '#e2e8f0',
      cssPrimary: '263 70% 50%',
      cssSecondary: '330 81% 50%',
      cssAccent: '192 91% 37%',
      cssBackground: '210 40% 98%',
      cssMuted: '210 20% 88%',
    },
  },
];

export const themeState = {
  currentId: 'cyberpunk',
  colors: { ...themes[0].colors },
};

export function setTheme(id: string) {
  const theme = themes.find(t => t.id === id);
  if (!theme) return;

  themeState.currentId = id;
  Object.assign(themeState.colors, theme.colors);

  const isLight = id === 'light';

  // Update CSS variables on :root
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.colors.cssPrimary);
  root.style.setProperty('--secondary', theme.colors.cssSecondary);
  root.style.setProperty('--accent', theme.colors.cssAccent);
  root.style.setProperty('--background', theme.colors.cssBackground);
  root.style.setProperty('--muted', theme.colors.cssMuted);
  root.style.setProperty('--card', theme.colors.cssBackground);
  root.style.setProperty('--popover', theme.colors.cssBackground);
  root.style.setProperty('--ring', theme.colors.cssPrimary);

  // Light/dark text contrast
  root.style.setProperty('--foreground', isLight ? '222 47% 11%' : '210 40% 98%');
  root.style.setProperty('--card-foreground', isLight ? '222 47% 11%' : '210 40% 98%');
  root.style.setProperty('--popover-foreground', isLight ? '222 47% 11%' : '210 40% 98%');
  root.style.setProperty('--muted-foreground', isLight ? '215 16% 47%' : '260 20% 65%');
  root.style.setProperty('--border', isLight ? '214 32% 91%' : '260 40% 15%');
  root.style.setProperty('--input', isLight ? '214 32% 91%' : '260 40% 15%');

  // Theme-aware card surface color
  root.style.setProperty('--surface', isLight ? '0 0% 100%' : '260 50% 6%');
  root.style.setProperty('--surface-alpha', isLight ? 'rgba(255,255,255,0.85)' : 'rgba(10,5,20,0.85)');

  // Set data attribute for CSS overrides
  root.setAttribute('data-theme', id);

  // Background color on body
  document.body.style.backgroundColor = theme.colors.background;
}
