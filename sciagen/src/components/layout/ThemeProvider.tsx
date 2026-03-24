'use client';
// ─────────────────────────────────────────────────────────────────────────────
// THEME PROVIDER
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'sepia';

interface ThemeContextValue {
  theme:     Theme;
  setTheme:  (t: Theme) => void;
  toggle:    () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark', setTheme: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('sg_theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const resolved  = saved ?? preferred;
    setThemeState(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('sg_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const toggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
