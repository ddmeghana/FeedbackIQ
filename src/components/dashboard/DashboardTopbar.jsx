import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  Boxes,
  Calendar,
  ChevronDown,
  User,
} from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import { THEMES, ROUTES } from '../../config/constants';

export default function DashboardTopbar({
  onToggleSidebar,
  products = [],
  selectedProduct,
  onSelectProduct,
  dateRange,
  onSelectDateRange,
  pageTitle = 'Dashboard Overview',
  showProductSelector = true,
}) {
  const location = useLocation();
  const isAnalysisPage =
    location.pathname === ROUTES.PRODUCT_ANALYSIS || location.pathname.startsWith('/analysis');
  const shouldRenderProductSelector = showProductSelector && !isAnalysisPage;
  const { theme, setTheme } = useThemeContext();

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

  const dateOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <header className="sticky top-0 z-30 surface-card border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open sidebar navigation"
          className="p-2 rounded-xl text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
            FeedbackIQ Console
          </span>
          <span className="text-sm font-bold text-primary tracking-tight">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right: Dynamic Product Selector, Date Range, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Product Selector (Hidden on /analysis to prevent duplicate controls) */}
        {shouldRenderProductSelector && (
          <div className="relative">
            <label htmlFor="topbar-product-select" className="sr-only">
              Select Product
            </label>
            <div className="relative flex items-center">
              <Boxes className="w-3.5 h-3.5 text-accent absolute left-3 pointer-events-none" />
              <select
                id="topbar-product-select"
                value={selectedProduct}
                onChange={(e) => onSelectProduct(e.target.value)}
                className="appearance-none pl-8 pr-8 py-1.5 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              >
                <option value="ALL">All Products (Combined)</option>
                {products.map((p) => (
                  <option key={p.Product_ID} value={p.Product_ID}>
                    {p.Product_Name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Date Range Selector */}
        <div className="relative">
          <label htmlFor="topbar-date-select" className="sr-only">
            Select Date Range
          </label>
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
            <select
              id="topbar-date-select"
              value={dateRange}
              onChange={(e) => onSelectDateRange(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={cycleTheme}
          aria-label="Toggle theme mode"
          title="Toggle light/dark/system mode"
          className="p-2 rounded-xl text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {themeIcon}
        </button>

        {/* Profile Avatar Pill */}
        <Link
          to={ROUTES.PROFILE}
          aria-label="Admin Profile"
          title="Admin Profile"
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-accent hover:bg-amber-500/30 hover:border-amber-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          AD
        </Link>
      </div>
    </header>
  );
}
