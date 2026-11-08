/**
 * App.jsx — Root router
 *
 * Defines all application routes.
 * Each page is imported directly (no lazy loading yet — added in Phase 12).
 *
 * Routes:
 *   /           → LandingPage
 *   /dashboard  → DashboardPage
 *   /analysis   → ProductAnalysisPage
 *   /history    → FeedbackHistoryPage
 *   /insights   → AIInsightsPage
 *   /reports    → ReportsPage
 *   /submit     → FeedbackFormPage
 *   *           → 404 (redirects to /)
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/constants';

// Pages — will be built out in subsequent phases
import LandingPage         from './pages/LandingPage';
import DashboardPage       from './pages/DashboardPage';
import ProductAnalysisPage from './pages/ProductAnalysisPage';
import FeedbackHistoryPage from './pages/FeedbackHistoryPage';
import AIInsightsPage      from './pages/AIInsightsPage';
import ReportsPage         from './pages/ReportsPage';
import FeedbackFormPage    from './pages/FeedbackFormPage';

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME}             element={<LandingPage />}         />
      <Route path={ROUTES.DASHBOARD}        element={<DashboardPage />}       />
      <Route path={ROUTES.PRODUCT_ANALYSIS} element={<ProductAnalysisPage />} />
      <Route path={ROUTES.FEEDBACK_HISTORY} element={<FeedbackHistoryPage />} />
      <Route path={ROUTES.AI_INSIGHTS}      element={<AIInsightsPage />}      />
      <Route path={ROUTES.REPORTS}          element={<ReportsPage />}         />
      <Route path={ROUTES.SUBMIT}           element={<FeedbackFormPage />}    />
      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />}         />
    </Routes>
  );
}
