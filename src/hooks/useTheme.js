/**
 * useTheme — Theme management hook
 *
 * Manages light / dark / system theme preference.
 * Persists the choice to localStorage.
 * Updates the 'dark' class on <html> immediately (no flash).
 *
 * Usage:
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 *
 *   theme          → 'light' | 'dark' | 'system'  (what the user chose)
 *   resolvedTheme  → 'light' | 'dark'              (what is actually applied)
 *   setTheme(val)  → update and persist the choice
 */

import { useState, useEffect, useCallback } from 'react';
import { THEMES, THEME_STORAGE_KEY } from '../config/constants';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

function applyTheme(resolved) {
  const root = document.documentElement;
  if (resolved === THEMES.DARK) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || THEMES.SYSTEM;
    } catch {
      return THEMES.SYSTEM;
    }
  });

  // The actual applied theme (light or dark — never 'system')
  const resolvedTheme =
    theme === THEMES.SYSTEM ? getSystemTheme() : theme;

  // Apply class on first render and whenever theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for OS preference changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // localStorage unavailable — theme will not persist across sessions
    }
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme, resolvedTheme };
}
