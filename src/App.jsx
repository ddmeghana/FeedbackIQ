/**
 * App.jsx — Root router
 *
 * Routes:
 *   /           → LandingPage              (public)
 *   /login      → AdminLoginPage           (public admin login)
 *   /dashboard  → DashboardPage            (protected — admin auth required)
 *   /import     → ImportDataPage           (protected — admin auth required)
 *   /products   → ManageProductsPage       (protected — admin auth required)
 *   /analysis   → ProductAnalysisPage      (protected)
 *   /history    → FeedbackHistoryPage      (protected)
 *   /insights   → AIInsightsPage           (protected)
 *   /reports    → ReportsPage              (protected)
 *   *           → Redirect to /
 *
 * SECURITY:
 * All dashboard & admin routes are wrapped with RequireAdminAuth.
 * RequireAdminAuth renders the AdminLoginPage instead of the protected content
 * if no valid session token is found in sessionStorage.
 * The actual security enforcement is done server-side by Apps Script.
 */

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './config/constants';

import LandingPage         from './pages/LandingPage';
import DashboardPage       from './pages/DashboardPage';
import ImportDataPage      from './pages/ImportDataPage';
import ManageProductsPage  from './pages/ManageProductsPage';
import ProductAnalysisPage from './pages/ProductAnalysisPage';
import FeedbackHistoryPage from './pages/FeedbackHistoryPage';
import AIInsightsPage      from './pages/AIInsightsPage';
import ReportsPage         from './pages/ReportsPage';
import SettingsPage        from './pages/SettingsPage';
import AdminProfilePage   from './pages/AdminProfilePage';
import AdminLoginPage      from './pages/AdminLoginPage';
import RequireAdminAuth    from './components/auth/RequireAdminAuth';
import { isAuthenticated } from './services/adminAuthService';

function AdminLoginRoute() {
  const navigate = useNavigate();
  if (isAuthenticated()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <AdminLoginPage onLoginSuccess={() => navigate(ROUTES.DASHBOARD, { replace: true })} />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME}  element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<AdminLoginRoute />} />

      {/* Protected admin routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={<RequireAdminAuth><DashboardPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.IMPORT}
        element={<RequireAdminAuth><ImportDataPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.PRODUCTS}
        element={<RequireAdminAuth><ManageProductsPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.PRODUCT_ANALYSIS}
        element={<RequireAdminAuth><ProductAnalysisPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.FEEDBACK_HISTORY}
        element={<RequireAdminAuth><FeedbackHistoryPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.AI_INSIGHTS}
        element={<RequireAdminAuth><AIInsightsPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.REPORTS}
        element={<RequireAdminAuth><ReportsPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.SETTINGS}
        element={<RequireAdminAuth><SettingsPage /></RequireAdminAuth>}
      />
      <Route
        path={ROUTES.PROFILE}
        element={<RequireAdminAuth><AdminProfilePage /></RequireAdminAuth>}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
