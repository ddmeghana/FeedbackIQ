/**
 * main.jsx — Application entry point
 *
 * Renders the React app into #root.
 * Wraps everything with:
 *   - ThemeProvider: manages light/dark/system theme
 *   - BrowserRouter: enables client-side routing
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
