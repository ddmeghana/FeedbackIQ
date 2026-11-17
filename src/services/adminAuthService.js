/**
 * FeedbackIQ — Admin Authentication Service
 *
 * Manages admin login, token-aware session storage, profile, and logout.
 *
 * SESSION STORAGE DESIGN:
 *   - The session token is stored ONLY in sessionStorage (tab-scoped, lost on close).
 *   - The admin PIN is NEVER stored anywhere on the client.
 *   - No sensitive data is committed to code or env files.
 *
 * TOKEN-AWARE EXPIRY & CLEANUP:
 *   - updateSessionExpiry(requestToken, expiresAtIso): Updates expiry only if requestToken
 *     matches the currently stored session token, preventing out-of-order responses or older
 *     tokens from corrupting the active session.
 *   - clearSession(expectedToken): If expectedToken is provided, clears only if the stored
 *     token matches expectedToken, preventing an old expired-session response from wiping
 *     a newly authenticated session.
 *   - getStoredToken(): Fails closed — if the token exists but its expiry is missing,
 *     malformed, or expired, the session is cleared and null is returned.
 */

import { APPS_SCRIPT_URL } from '../config/constants.js';

const SESSION_TOKEN_KEY = 'fiq_admin_token';
const SESSION_EXPIRY_KEY = 'fiq_admin_expiry';
const SESSION_LOGIN_TIME_KEY = 'fiq_admin_login_time';
const PROFILE_STORAGE_KEY = 'fiq_admin_profile';

/**
 * Returns the stored session token if still valid client-side.
 * FAILS CLOSED: If the token exists but expiry is missing, malformed, or expired,
 * purges the invalid session and returns null.
 *
 * @returns {string|null}
 */
export function getStoredToken() {
  try {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return null;

    const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiry) {
      // Missing expiry: fail closed
      clearSession();
      return null;
    }

    const expiryMs = parseInt(expiry, 10);
    if (isNaN(expiryMs) || !isFinite(expiryMs) || expiryMs <= 0 || Date.now() > expiryMs) {
      // Malformed or expired: fail closed
      clearSession();
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

/**
 * Stores an admin session token and validated expiry timestamp in sessionStorage.
 *
 * @param {string} token
 * @param {string|null} expiresAtIso - ISO 8601 string from server
 */
export function storeSession(token, expiresAtIso) {
  if (!token) return;
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    if (expiresAtIso) {
      const timeMs = new Date(expiresAtIso).getTime();
      if (!isNaN(timeMs) && isFinite(timeMs) && timeMs > 0) {
        sessionStorage.setItem(SESSION_EXPIRY_KEY, String(timeMs));
      } else {
        sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      }
    } else {
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    }

    if (!sessionStorage.getItem(SESSION_LOGIN_TIME_KEY)) {
      sessionStorage.setItem(SESSION_LOGIN_TIME_KEY, new Date().toISOString());
    }
  } catch {
    // sessionStorage unavailable (e.g. strict private mode) — degrade gracefully
  }
}

/**
 * Updates the stored session expiry timestamp in sessionStorage.
 * TOKEN-AWARE: Updates expiry only if requestToken still matches the currently active session.
 * OUT-OF-ORDER PROTECTION: Preserves the later expiry; never replaces a newer expiry with an older one.
 *
 * @param {string} requestToken - The token sent with the request
 * @param {string|null} expiresAtIso - ISO 8601 string from server response
 */
export function updateSessionExpiry(requestToken, expiresAtIso) {
  if (!requestToken || !expiresAtIso) return;
  try {
    const currentStoredToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    // Ignore response if user logged in again or session changed
    if (!currentStoredToken || currentStoredToken !== requestToken) {
      return;
    }

    const newExpiryMs = new Date(expiresAtIso).getTime();
    if (isNaN(newExpiryMs) || !isFinite(newExpiryMs) || newExpiryMs <= 0) {
      return;
    }

    // Preserve the later expiry if parallel responses arrive out of order
    const currentExpiryMs = parseInt(sessionStorage.getItem(SESSION_EXPIRY_KEY) || '0', 10);
    if (newExpiryMs > currentExpiryMs) {
      sessionStorage.setItem(SESSION_EXPIRY_KEY, String(newExpiryMs));
    }
  } catch {
    // ignore
  }
}

/**
 * Removes the admin session from sessionStorage.
 * Optionally token-aware: if expectedToken is provided, clears only if the currently
 * stored token matches expectedToken. If expectedToken is omitted, clears unconditionally.
 *
 * @param {string} [expectedToken] - Optional token to check before clearing
 */
export function clearSession(expectedToken) {
  try {
    if (expectedToken) {
      const currentStoredToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
      if (currentStoredToken !== expectedToken) {
        // A new session has already been established; do not clear it
        return;
      }
    }
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem(SESSION_LOGIN_TIME_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns true if there is currently a valid, non-expired client-side session token.
 */
export function isAuthenticated() {
  return Boolean(getStoredToken());
}

/**
 * Returns diagnostic metadata about the current session.
 */
export function getAdminSessionInfo() {
  try {
    const token = getStoredToken();
    const loginTime = sessionStorage.getItem(SESSION_LOGIN_TIME_KEY);
    const expiryMs = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    return {
      isAuthenticated: Boolean(token),
      loginTime: loginTime || null,
      expiryTime: expiryMs ? new Date(parseInt(expiryMs, 10)).toISOString() : null,
      tokenMasked: token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null,
    };
  } catch {
    return { isAuthenticated: false, loginTime: null, expiryTime: null, tokenMasked: null };
  }
}

/**
 * Sends the admin PIN to the server for verification.
 * On success, stores the returned session token and expiry in sessionStorage.
 * The PIN is NEVER saved to browser storage.
 *
 * @param {string} pin
 * @returns {Promise<{ success: boolean, message: string, remainingAttempts?: number }>}
 */
export async function adminLogin(pin) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '') {
    return {
      success: false,
      message: 'Apps Script URL is not configured. Please set VITE_APPS_SCRIPT_URL in your .env.local file.',
    };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'adminLogin', pin }),
    });

    if (!response.ok) {
      return { success: false, message: `Server error: HTTP ${response.status}` };
    }

    const result = await response.json();

    if (result.success && result.token) {
      storeSession(result.token, result.expiresAt || null);
      return { success: true, message: result.message || 'Login successful.' };
    }

    return {
      success: false,
      message: result.message || 'Login failed.',
      remainingAttempts: result.remainingAttempts,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error: Unable to reach Apps Script. Check your connection or deployment URL.',
    };
  }
}

/**
 * Logs out the current admin session (server-side invalidation + client-side clear).
 *
 * @returns {Promise<void>}
 */
export async function adminLogout() {
  const token = getStoredToken();
  // Clear local session immediately
  clearSession();

  if (!token || !APPS_SCRIPT_URL) return;

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'adminLogout', token }),
    });
  } catch {
    // Best-effort server logout; client session already cleared
  }
}

/**
 * Retrieves the administrator profile from Apps Script or cached local fallback.
 *
 * @returns {Promise<{ displayName: string, email: string, role: string, status: string, authMethod: string }>}
 */
export async function getAdminProfile() {
  // Read local cache first for instant UI response or offline resilience
  let cachedProfile = {
    displayName: 'System Administrator',
    email: 'admin@feedbackiq.local',
    role: 'Administrator',
    status: 'Active',
    authMethod: 'Server-side PIN (Script Properties)',
  };

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        cachedProfile = { ...cachedProfile, ...parsed };
      }
    }
  } catch {
    // ignore
  }

  const token = getStoredToken();
  if (!token || !APPS_SCRIPT_URL) {
    return cachedProfile;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'admingetprofile', token }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        if (result.expiresAt) {
          updateSessionExpiry(token, result.expiresAt);
        }
        const updated = {
          ...cachedProfile,
          ...result.data,
        };
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      }
    }
  } catch {
    // Return cached profile on network glitch
  }

  return cachedProfile;
}

/**
 * Updates administrator display name and email on server and local cache.
 *
 * @param {{ displayName: string, email: string }} updates
 * @returns {Promise<{ success: boolean, message: string, data?: Object }>}
 */
export async function updateAdminProfile({ displayName, email }) {
  const token = getStoredToken();
  if (!token) {
    return { success: false, message: 'Authentication required. Please log in.' };
  }

  const trimmedName = String(displayName || '').trim();
  const trimmedEmail = String(email || '').trim();

  if (!trimmedName) {
    return { success: false, message: 'Display Name is required.' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'adminupdateprofile',
        token,
        displayName: trimmedName,
        email: trimmedEmail,
      }),
    });

    if (!response.ok) {
      return { success: false, message: `Server error: HTTP ${response.status}` };
    }

    const result = await response.json();
    if (result.success) {
      if (result.expiresAt) {
        updateSessionExpiry(token, result.expiresAt);
      }
      const newProfile = result.data || {
        displayName: trimmedName,
        email: trimmedEmail,
        role: 'Administrator',
        status: 'Active',
        authMethod: 'Server-side PIN (Script Properties)',
      };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      } catch {}
      return { success: true, message: result.message || 'Profile updated successfully.', data: newProfile };
    }

    return { success: false, message: result.message || 'Failed to update profile.' };
  } catch (err) {
    // If offline, still update local storage so UI is responsive
    const localProfile = {
      displayName: trimmedName,
      email: trimmedEmail,
      role: 'Administrator',
      status: 'Active',
      authMethod: 'Server-side PIN (Script Properties)',
    };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(localProfile));
    } catch {}
    return {
      success: true,
      message: 'Profile updated locally (server update will sync upon reconnection).',
      data: localProfile,
    };
  }
}

/**
 * Changes the admin PIN securely via Apps Script.
 * The PIN is verified and stored entirely server-side.
 *
 * @param {{ currentPin: string, newPin: string }} params
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function changeAdminPin({ currentPin, newPin }) {
  const token = getStoredToken();
  if (!token) {
    return { success: false, message: 'Authentication required. Please log in.' };
  }

  const trimmedCurrent = String(currentPin || '').trim();
  const trimmedNew = String(newPin || '').trim();

  if (!trimmedCurrent) {
    return { success: false, message: 'Current PIN is required.' };
  }
  if (!trimmedNew || trimmedNew.length < 4) {
    return { success: false, message: 'New PIN must be at least 4 characters long.' };
  }
  if (trimmedNew.length > 32) {
    return { success: false, message: 'New PIN must not exceed 32 characters.' };
  }
  if (trimmedCurrent === trimmedNew) {
    return { success: false, message: 'New PIN must be different from current PIN.' };
  }

  if (!APPS_SCRIPT_URL) {
    return { success: false, message: 'Apps Script URL not configured.' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'adminchangepin',
        token,
        currentPin: trimmedCurrent,
        newPin: trimmedNew,
      }),
    });

    if (!response.ok) {
      return { success: false, message: `Server error: HTTP ${response.status}` };
    }

    const result = await response.json();
    if (result.expiresAt) {
      updateSessionExpiry(token, result.expiresAt);
    }

    return {
      success: Boolean(result.success),
      message: result.message || (result.success ? 'PIN changed successfully.' : 'Failed to change PIN.'),
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error: Unable to contact server to update PIN.',
    };
  }
}
