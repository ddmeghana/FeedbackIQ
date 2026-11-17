import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Layers,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import { THEMES } from '../../config/constants';

export default function Navbar() {
  const location = useLocation();
  const { theme, setTheme } = useThemeContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (location.pathname === '/') {
        const sections = ['home', 'features', 'how-it-works'];
        const scrollPos = window.scrollY + 140;
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { id: 'home', label: 'Home', href: '/#home', icon: Sparkles },
    { id: 'features', label: 'Features', href: '/#features', icon: Layers },
    { id: 'how-it-works', label: 'How It Works', href: '/#how-it-works', icon: HelpCircle },
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
        className={`pointer-events-auto grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center w-full max-w-5xl px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-200 border ${
          scrolled
            ? 'glass-card border-border shadow-card-dark bg-card/95 backdrop-blur-md'
            : 'bg-card/80 border-border/80 backdrop-blur-sm shadow-sm'
        }`}
      >
        {/* Left: Prominent Brand Logo & Name */}
        <div className="justify-self-start flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
            aria-label="FeedbackIQ Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-zinc-950 fill-zinc-950" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-primary">
              Feedback<span className="text-accent">IQ</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav Links (Precisely Centered relative to entire navbar) */}
        <div className="hidden md:flex justify-self-center items-center gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl border border-border/50">
          {navLinks.map((link) => {
            const isActive = location.pathname === '/' && activeSection === link.id;

            return (
              <a
                key={link.id}
                href={link.href}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap ${
                  isActive ? 'text-primary' : 'text-muted hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeDockPill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </div>

        {/* Right: Theme Selector & Mobile Toggle */}
        <div className="justify-self-end flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Current theme: ${themeLabel}. Click to switch theme.`}
            title={`Switch theme (${themeLabel})`}
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {themeIcon}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 md:hidden rounded-xl text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto absolute top-16 inset-x-3 sm:inset-x-4 max-w-5xl mx-auto surface-card border border-border rounded-2xl shadow-card-dark p-4 md:hidden z-50"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
