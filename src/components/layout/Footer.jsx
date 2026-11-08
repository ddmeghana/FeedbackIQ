import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '../../config/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-border/60">
          {/* Brand Info */}
          <div className="space-y-1.5">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-extrabold text-base text-primary tracking-tight">
                Feedback<span className="text-accent">IQ</span>
              </span>
            </Link>
            <p className="text-xs text-muted max-w-sm">
              AI-Powered Feedback Analysis and Summarization System.
            </p>
          </div>

          {/* Clean Navigation Links + Subtle Give Feedback Link */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs text-muted">
            <a href="/#home" className="hover:text-primary transition-colors">
              Home
            </a>
            <a href="/#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </a>
            <Link to={ROUTES.DASHBOARD} className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="text-border">|</span>
            {/* Subtle Give Feedback link for respondents */}
            <Link
              to={ROUTES.SUBMIT}
              className="text-accent hover:underline flex items-center gap-1 font-medium"
            >
              Give Feedback <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>© {currentYear} FeedbackIQ. Low-Code/No-Code AI Architecture.</p>
          <p className="font-mono text-[11px]">Designed for Product Teams</p>
        </div>
      </div>
    </footer>
  );
}
