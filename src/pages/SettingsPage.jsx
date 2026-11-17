/**
 * FeedbackIQ — Settings & Preferences Page
 *
 * Provides straightforward, useful administrative preferences:
 *   1. Default Analytics & Reporting Period (All Time, 7d, 30d, 90d)
 *   2. Theme & Appearance (Light, Dark, System) via global useTheme
 *   3. Reset Preferences to Defaults
 *
 * Zero sensitive data or credentials stored.
 */

import { useState } from 'react';
import {
  Settings,
  Calendar,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Shield,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Button from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';
import { THEMES, DEFAULT_PERIOD_STORAGE_KEY } from '../config/constants';
import { useDashboardFilters } from '../hooks/useDashboardFilters';

export default function SettingsPage() {
  const { products, selectedProduct, setSelectedProduct, dateRange, setDateRange } =
    useDashboardFilters();

  const { theme, setTheme } = useTheme();

  const [defaultPeriod, setDefaultPeriod] = useState(() => {
    try {
      return localStorage.getItem(DEFAULT_PERIOD_STORAGE_KEY) || '30d';
    } catch {
      return '30d';
    }
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handlePeriodChange = (period) => {
    setDefaultPeriod(period);
    try {
      localStorage.setItem(DEFAULT_PERIOD_STORAGE_KEY, period);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch {
      // localStorage unavailable
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleResetPreferences = () => {
    try {
      localStorage.removeItem(DEFAULT_PERIOD_STORAGE_KEY);
    } catch {}
    setDefaultPeriod('30d');
    setTheme(THEMES.SYSTEM);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <DashboardLayout
      products={products}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Settings & Preferences"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-primary tracking-tight flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-accent" />
              <span>Application Preferences</span>
            </h1>
            <p className="text-xs text-muted">
              Configure your local administrative experience, default reporting horizons, and interface appearance.
            </p>
          </div>

          {savedNotification && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preferences saved</span>
            </div>
          )}
        </div>

        {/* Setting 1: Default Reporting Period */}
        <div className="surface-card rounded-2xl border border-border p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-primary">Default Analytics & Reporting Horizon</h2>
            </div>
            <p className="text-xs text-muted">
              Sets the initial time window applied across the Dashboard, Product Analysis, AI Insights, and Report configuration upon launch.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { id: '7d',  label: 'Last 7 Days',  sub: 'Recent weekly activity' },
              { id: '30d', label: 'Last 30 Days', sub: 'Standard monthly view' },
              { id: '90d', label: 'Last 90 Days', sub: 'Quarterly trend view' },
              { id: 'all', label: 'All Time',     sub: 'Complete feedback history' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePeriodChange(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  defaultPeriod === opt.id
                    ? 'border-accent bg-accent/10 shadow-xs'
                    : 'border-border hover:border-border/80 bg-zinc-50/50 dark:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${defaultPeriod === opt.id ? 'text-accent' : 'text-primary'}`}>
                    {opt.label}
                  </span>
                  {defaultPeriod === opt.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  )}
                </div>
                <span className="text-[10px] text-muted block leading-tight">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Appearance & Theme */}
        <div className="surface-card rounded-2xl border border-border p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-primary">Interface Theme & Appearance</h2>
            </div>
            <p className="text-xs text-muted">
              Choose your preferred visual presentation. Nordic Obsidian dark mode is engineered for low-light analytics environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: THEMES.LIGHT,  label: 'Light Mode',   icon: Sun,     desc: 'Clean paper-white surface styling' },
              { id: THEMES.DARK,   label: 'Dark Mode',    icon: Moon,    desc: 'Nordic Obsidian high-contrast theme' },
              { id: THEMES.SYSTEM, label: 'System Default', icon: Monitor, desc: 'Syncs automatically with operating system' },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-xs'
                      : 'border-border hover:border-border/80 bg-zinc-50/50 dark:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-accent' : 'text-primary'}`}>
                        {t.label}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                  </div>
                  <span className="text-[10px] text-muted block leading-tight">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Setting 3: Reset Preferences */}
        <div className="surface-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary">Reset Preferences</h3>
            <p className="text-xs text-muted">
              Restore default analytics horizon (Last 30 Days) and system appearance preference.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleResetPreferences}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restore Defaults
          </Button>
        </div>

        {/* Security & Architecture Note */}
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-border/60 text-xs text-muted flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-primary block">Client-Side Preferences Architecture</span>
            <p className="text-[11px] leading-relaxed">
              Preferences are stored exclusively in your browser&apos;s local storage. FeedbackIQ never transmits local preferences, admin credentials, or tokens across untrusted networks.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
