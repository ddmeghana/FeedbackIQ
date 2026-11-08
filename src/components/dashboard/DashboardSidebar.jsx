import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  Layers,
  History,
  Lightbulb,
  FileText,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react';
import { ROUTES } from '../../config/constants';

export default function DashboardSidebar({ mobileOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Product Analysis', path: ROUTES.PRODUCT_ANALYSIS, icon: Layers },
    { label: 'Feedback History', path: ROUTES.FEEDBACK_HISTORY, icon: History },
    { label: 'AI Insights', path: ROUTES.AI_INSIGHTS, icon: Lightbulb },
    { label: 'Reports', path: ROUTES.REPORTS, icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 surface-card border-r border-border flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Brand Logo & Close Button (Mobile) */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
              aria-label="FeedbackIQ Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
                <Sparkles className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-primary">
                Feedback<span className="text-accent">IQ</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-primary lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Dashboard Navigation" className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
              Analytics Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-accent/15 text-accent font-semibold border border-accent/25'
                      : 'text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Settings (Placeholder) */}
            <div className="pt-2">
              <button
                type="button"
                disabled
                title="Settings will be enabled in future releases"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted/50 cursor-not-allowed select-none"
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-muted">
                  Soon
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer — Return to Landing */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-border/60 text-[11px] font-mono text-muted flex items-center justify-between">
            <span>Org Mode</span>
            <span className="text-emerald-500 font-medium">Single-Tenant</span>
          </div>

          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
