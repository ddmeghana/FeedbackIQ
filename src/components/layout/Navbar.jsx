import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  LayoutDashboard,
  Layers,
  HelpCircle,
  Info,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import { THEMES, ROUTES } from '../../config/constants';
import Button from '../ui/Button';

export default function Navbar() {
  const location = useLocation();
  const { theme, setTheme } = useThemeContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Track scroll state for enhanced background blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section tracking when on the landing page
      if (location.pathname === '/') {
        const sections = ['home', 'features', 'how-it-works', 'about'];
        const scrollPos = window.scrollY + 120;
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { id: 'home', label: 'Home', href: '/#home', icon: Sparkles },
    { id: 'features', label: 'Features', href: '/#features', icon: Layers },
    { id: 'how-it-works', label: 'How It Works', href: '/#how-it-works', icon: HelpCircle },
    { id: 'about', label: 'About', href: '/#about', icon: Info },
  ];

  const cycleTheme = () => {
    if (theme === THEMES.SYSTEM) setTheme(THEMES.DARK);
    else if (theme === THEMES.DARK) setTheme(THEMES.LIGHT);
    else setTheme(THEMES.SYSTEM);
  };

  const themeIcon = {
    [THEMES.LIGHT]: <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />,
    [THEMES.DARK]: <Moon className="w-4 h-4 text-amber-400" aria-hidden="true" />,
    [THEMES.SYSTEM]: <Laptop className="w-4 h-4 text-muted" aria-hidden="true" />,
  }[theme];

  const themeLabel = {
    [THEMES.LIGHT]: 'Light mode',
    [THEMES.DARK]: 'Dark mode',
    [THEMES.SYSTEM]: 'System theme',
  }[theme];

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center p-3 sm:p-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-300 border ${
          scrolled
            ? 'glass-card border-border shadow-card-dark bg-card/90 backdrop-blur-md'
            : 'bg-card/70 border-border/80 backdrop-blur-sm shadow-sm'
        }`}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          aria-label="FeedbackIQ Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-zinc-950 fill-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-primary flex items-center gap-1.5">
              Feedback<span className="text-accent">IQ</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/15 text-accent font-medium uppercase tracking-wider hidden sm:inline-block">
                AI
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Dock Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/40 p-1 rounded-xl border border-border/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === '/' && activeSection === link.id;

            return (
              <a
                key={link.id}
                href={link.href}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive ? 'text-primary' : 'text-muted hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeDockPill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}

          {/* Quick link to Dashboard in nav dock */}
          <Link
            to={ROUTES.DASHBOARD}
            className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              location.pathname === ROUTES.DASHBOARD ? 'text-primary' : 'text-muted hover:text-primary'
            }`}
          >
            {location.pathname === ROUTES.DASHBOARD && (
              <motion.span
                layoutId="activeDockPill"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <LayoutDashboard className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
            <span className="relative z-10">Dashboard</span>
          </Link>
        </div>

        {/* Right Actions: Theme Selector + CTA */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Current theme: ${themeLabel}. Click to switch theme.`}
            title={`Switch theme (${themeLabel})`}
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border border-transparent hover:border-border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {themeIcon}
          </button>

          {/* CTA: Get Started / Explore */}
          <Link to={ROUTES.DASHBOARD} className="hidden sm:inline-flex">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore Platform
            </Button>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 md:hidden rounded-xl text-muted hover:text-primary hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border border-transparent hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-16 inset-x-3 sm:inset-x-4 max-w-5xl mx-auto surface-card border border-border rounded-2xl shadow-card-dark p-4 md:hidden z-50"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{link.label}</span>
                  </a>
                );
              })}

              <div className="my-2 border-t border-border" />

              <Link
                to={ROUTES.DASHBOARD}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-zinc-950 hover:bg-amber-400 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Explore Dashboard
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={ROUTES.SUBMIT}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border border-border text-primary hover:border-accent transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-accent" />
                  Submit Feedback Form
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
