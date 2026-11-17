import { useState } from 'react';
import AdminLoginPage from '../../pages/AdminLoginPage';
import { isAuthenticated } from '../../services/adminAuthService';

/**
 * RequireAdminAuth — Route guard for admin-only dashboard pages.
 *
 * Renders the AdminLoginPage if no valid session token exists in sessionStorage.
 * On successful login, re-renders with the protected children.
 *
 * SECURITY NOTE:
 *   This is a UI-layer protection only. The actual security is enforced by the
 *   Apps Script backend which validates the session token on every admin API request.
 *   The frontend guard prevents the dashboard from loading and making API calls
 *   without a token, but it does not prevent someone from accessing the route URL
 *   directly — the backend still rejects any unauthenticated data requests.
 */
export default function RequireAdminAuth({ children }) {
  // Track auth state internally so the guard re-renders on login
  const [authed, setAuthed] = useState(() => isAuthenticated());

  if (!authed) {
    return <AdminLoginPage onLoginSuccess={() => setAuthed(true)} />;
  }

  return children;
}
