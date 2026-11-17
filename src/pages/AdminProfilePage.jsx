/**
 * FeedbackIQ — Admin Profile Page
 *
 * Route: /profile (protected — requires admin authentication)
 *
 * Implements a complete Admin Profile experience:
 *   1. Profile Overview (Initials avatar, display name, email, administrator role, active status)
 *   2. Personal Information (Editable display name and email with save/cancel & server persistence)
 *   3. Account Information (Role, single-tenant scope, auth method, session start time)
 *   4. Security Settings (Change Admin PIN with current/new/confirm fields, server-side validation)
 *   5. Preferences (Theme toggle light/dark/system, default reporting period)
 *   6. Session Management (Status, expiry, session token info, logout action)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  KeyRound,
  Clock,
  Sliders,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Calendar,
  Building,
  Check,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { useThemeContext } from '../context/ThemeContext';
import { THEMES, DEFAULT_PERIOD_STORAGE_KEY, ROUTES } from '../config/constants';
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPin,
  getAdminSessionInfo,
  adminLogout,
} from '../services/adminAuthService';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const {
    products: filterProducts,
    selectedProduct,
    setSelectedProduct,
    dateRange,
    setDateRange,
  } = useDashboardFilters();

  const { theme, setTheme } = useThemeContext();

  // ─── Profile State ────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    displayName: 'System Administrator',
    email: 'admin@feedbackiq.local',
    role: 'Administrator',
    status: 'Active',
    authMethod: 'Server-side PIN (Script Properties)',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Editable personal info form
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState(null);

  // ─── Security PIN Change State ────────────────────────────────────────────
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState(null);
  const [pinErrorMsg, setPinErrorMsg] = useState(null);

  // ─── Preferences State ────────────────────────────────────────────────────
  const [defaultPeriod, setDefaultPeriod] = useState(() => {
    try {
      return localStorage.getItem(DEFAULT_PERIOD_STORAGE_KEY) || '30d';
    } catch {
      return '30d';
    }
  });
  const [prefSuccessMsg, setPrefSuccessMsg] = useState(null);

  // ─── Session Metadata ─────────────────────────────────────────────────────
  const [sessionInfo, setSessionInfo] = useState({
    isAuthenticated: true,
    loginTime: null,
    expiryTime: null,
    tokenMasked: null,
  });

  // Load Profile and Session on mount
  const loadData = useCallback(async () => {
    setLoadingProfile(true);
    const data = await getAdminProfile();
    setProfile(data);
    setNameInput(data.displayName || '');
    setEmailInput(data.email || '');
    setSessionInfo(getAdminSessionInfo());
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive Avatar Initials
  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ─── Save Personal Information ────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedName) {
      setProfileErrorMsg('Display Name is required.');
      return;
    }

    setSavingProfile(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    const result = await updateAdminProfile({
      displayName: trimmedName,
      email: trimmedEmail,
    });

    setSavingProfile(false);

    if (!result.success) {
      setProfileErrorMsg(result.message || 'Failed to update profile.');
      return;
    }

    setProfile((prev) => ({
      ...prev,
      displayName: trimmedName,
      email: trimmedEmail,
    }));
    setProfileSuccessMsg(result.message || 'Profile saved successfully.');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  const handleCancelProfile = () => {
    setNameInput(profile.displayName || '');
    setEmailInput(profile.email || '');
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);
  };

  // ─── Change PIN ───────────────────────────────────────────────────────────
  const handleChangePin = async (e) => {
    e.preventDefault();
    setPinErrorMsg(null);
    setPinSuccessMsg(null);

    const curr = currentPin.trim();
    const np = newPin.trim();
    const cp = confirmPin.trim();

    if (!curr) {
      setPinErrorMsg('Current PIN is required.');
      return;
    }
    if (!np) {
      setPinErrorMsg('New PIN is required.');
      return;
    }
    if (np.length < 4) {
      setPinErrorMsg('New PIN must be at least 4 characters long.');
      return;
    }
    if (np !== cp) {
      setPinErrorMsg('New PIN and Confirmation PIN do not match.');
      return;
    }
    if (curr === np) {
      setPinErrorMsg('New PIN must be different from current PIN.');
      return;
    }

    setChangingPin(true);
    const result = await changeAdminPin({ currentPin: curr, newPin: np });
    setChangingPin(false);

    if (!result.success) {
      setPinErrorMsg(result.message || 'Failed to change PIN.');
      return;
    }

    setPinSuccessMsg(result.message || 'Admin PIN changed successfully.');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinSuccessMsg(null), 5000);
  };

  // ─── Preferences Handlers ─────────────────────────────────────────────────
  const handleDefaultPeriodChange = (val) => {
    setDefaultPeriod(val);
    try {
      localStorage.setItem(DEFAULT_PERIOD_STORAGE_KEY, val);
      setPrefSuccessMsg('Default reporting period preference saved.');
      setTimeout(() => setPrefSuccessMsg(null), 3000);
    } catch {}
  };

  // ─── Session Logout ───────────────────────────────────────────────────────
  const handleLogout = async () => {
    await adminLogout();
    navigate(ROUTES.HOME, { replace: true });
    window.location.reload();
  };

  const isProfileChanged =
    nameInput.trim() !== (profile.displayName || '').trim() ||
    emailInput.trim() !== (profile.email || '').trim();

  return (
    <DashboardLayout
      products={filterProducts}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Admin Profile"
    >
      <div className="space-y-8 max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/25">
            <User className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Admin Profile</h1>
            <p className="text-xs text-muted mt-0.5">
              Manage administrator credentials, security PIN, account preferences, and active session
            </p>
          </div>
        </div>

        {/* 1. Profile Overview Card */}
        <div className="surface-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-extrabold text-xl shadow-md shadow-amber-500/20">
                {getInitials(profile.displayName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-primary">
                    {profile.displayName || 'Administrator'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {profile.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {profile.email || 'admin@feedbackiq.local'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-border text-primary font-medium">
                    {profile.role || 'Administrator'}
                  </span>
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <Building className="w-3 h-3" /> Single-Tenant Scope
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer w-fit"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* 2. Personal Information Card */}
        <div className="surface-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <User className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-primary">Personal Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-canvas text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  maxLength={150}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-canvas text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                />
              </div>
            </div>

            {profileErrorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {profileSuccessMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelProfile}
                disabled={!isProfileChanged || savingProfile}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isProfileChanged || savingProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Security Settings Card (Change Admin PIN) */}
        <div className="surface-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-primary">Security & Access Control</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Server-Enforced
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            The administrator PIN protects all administrative operations (data imports, product registry modifications, report configurations).
            PIN verification is strictly executed server-side via Google Apps Script PropertiesService and is never stored on the client.
          </p>

          <form onSubmit={handleChangePin} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current PIN */}
              <div>
                <label
                  htmlFor="current-pin"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Current PIN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="current-pin"
                    type={showCurrentPin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    maxLength={32}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-border bg-canvas text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1"
                    aria-label="Toggle current PIN visibility"
                  >
                    {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New PIN */}
              <div>
                <label htmlFor="new-pin" className="block text-xs font-medium text-muted mb-1.5">
                  New PIN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="new-pin"
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Min 4 characters"
                    maxLength={32}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-border bg-canvas text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1"
                    aria-label="Toggle new PIN visibility"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New PIN */}
              <div>
                <label
                  htmlFor="confirm-pin"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Confirm New PIN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm-pin"
                    type={showConfirmPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repeat new PIN"
                    maxLength={32}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-border bg-canvas text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1"
                    aria-label="Toggle confirm PIN visibility"
                  >
                    {showConfirmPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {pinErrorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{pinErrorMsg}</span>
              </div>
            )}

            {pinSuccessMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{pinSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={changingPin || !currentPin.trim() || !newPin.trim() || !confirmPin.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {changingPin ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating PIN…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    Update Admin PIN
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 4. Preferences & Display Card */}
        <div className="surface-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Sliders className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-primary">Preferences & Appearance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted">Appearance Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(THEMES.LIGHT)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    theme === THEMES.LIGHT
                      ? 'border-accent bg-accent/10 text-accent font-semibold shadow-xs'
                      : 'border-border text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sun className="w-4 h-4 mb-1 text-amber-500" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(THEMES.DARK)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    theme === THEMES.DARK
                      ? 'border-accent bg-accent/10 text-accent font-semibold shadow-xs'
                      : 'border-border text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Moon className="w-4 h-4 mb-1 text-amber-400" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(THEMES.SYSTEM)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    theme === THEMES.SYSTEM
                      ? 'border-accent bg-accent/10 text-accent font-semibold shadow-xs'
                      : 'border-border text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1 text-muted" />
                  System
                </button>
              </div>
            </div>

            {/* Default Reporting Horizon */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted">
                Default Analytics Horizon
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: '7d', label: '7 Days' },
                  { value: '30d', label: '30 Days' },
                  { value: '90d', label: '90 Days' },
                  { value: 'all', label: 'All Time' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleDefaultPeriodChange(item.value)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all ${
                      defaultPeriod === item.value
                        ? 'border-accent bg-accent/10 text-accent font-semibold shadow-xs'
                        : 'border-border text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {prefSuccessMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{prefSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* 5. Account & Session Management Card */}
        <div className="surface-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-primary">Session & Account Details</h3>
            </div>
            <span className="text-[11px] font-mono text-muted">Single-Tenant Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-border">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Account Role
              </span>
              <p className="text-xs font-semibold text-primary mt-1">
                {profile.role || 'Administrator'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-border">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Authentication Scope
              </span>
              <p className="text-xs font-semibold text-primary mt-1">Single-Tenant Enterprise</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-border">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Session Established
              </span>
              <p className="text-xs font-mono text-primary mt-1 truncate">
                {sessionInfo.loginTime
                  ? new Date(sessionInfo.loginTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : 'Active'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-border">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Session Expiry
              </span>
              <p className="text-xs font-mono text-emerald-500 mt-1 truncate">
                {sessionInfo.expiryTime
                  ? new Date(sessionInfo.expiryTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Sliding (Auto-renewing)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
