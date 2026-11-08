import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '../../config/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-sm mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-bold text-lg text-primary tracking-tight">
                Feedback<span className="text-accent">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              AI-Powered Feedback Analysis and Summarization System. Collect feedback,
              classify sentiment, extract actionable insights, and elevate customer experiences.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Low-Code/No-Code AI Architecture
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to={ROUTES.DASHBOARD} className="hover:text-accent transition-colors flex items-center gap-1">
                  Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRODUCT_ANALYSIS} className="hover:text-accent transition-colors">
                  Product Analysis
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FEEDBACK_HISTORY} className="hover:text-accent transition-colors">
                  Feedback History
                </Link>
              </li>
              <li>
                <Link to={ROUTES.AI_INSIGHTS} className="hover:text-accent transition-colors">
                  AI Summaries
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REPORTS} className="hover:text-accent transition-colors">
                  PDF Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Respondents
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to={ROUTES.SUBMIT} className="hover:text-accent transition-colors flex items-center gap-1">
                  Submit Feedback Form <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-accent transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-accent transition-colors">
                  Feature Overview
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {currentYear} FeedbackIQ. Academic Low-Code/No-Code Software Architecture.</p>
          <p className="text-center sm:text-right font-mono">
            Zero-Cost Architecture · Google Sheets + n8n + Gemini API
          </p>
        </div>
      </div>
    </footer>
  );
}
