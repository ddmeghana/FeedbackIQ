/**
 * ThemeContext — Makes the theme available to all components
 * without prop-drilling.
 *
 * Wrap your app with <ThemeProvider> and use useThemeContext()
 * anywhere inside it to get { theme, setTheme, resolvedTheme }.
 */

import { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const themeValue = useTheme();
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used inside <ThemeProvider>');
  }
  return ctx;
}
