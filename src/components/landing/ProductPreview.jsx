import { Link } from 'react-router-dom';
import {
  Sparkles,
  Star,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { ROUTES } from '../../config/constants';
import RevealOnScroll from '../animations/RevealOnScroll';

export default function ProductPreview() {
  return (
    <section
      id="product-preview"
      aria-label="Product Interface Preview"
      className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <RevealOnScroll className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
          UI PREVIEW
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-primary tracking-tight">
          Designed for Clear, Actionable Decisions
        </h2>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          Experience the central analytics dashboard. Visualise ratings, sentiment breakdown,
          and automated AI recommendations across your entire product line.
        </p>
      </RevealOnScroll>

      {/* Mockup Frame Container */}
      <RevealOnScroll delay={0.15}>
        <div className="relative rounded-2xl p-1 sm:p-2 bg-gradient-to-b from-amber-500/25 via-border/50 to-transparent shadow-2xl">
          <div className="surface-card rounded-xl border border-border overflow-hidden">
            {/* Mockup Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-900/80 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-muted ml-3 hidden sm:inline-block">
                  https://feedbackiq.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                  SAMPLE ILLUSTRATIVE DATA
                </span>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-xs font-medium text-accent hover:underline flex items-center gap-1 ml-2"
                >
                  Open Live <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-canvas/40">
              {/* Product Selector Filter Bar Simulation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">Active Product:</span>
                  <div className="px-3 py-1.5 rounded-lg bg-card border border-accent/40 text-xs font-medium text-primary flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Laptop X (Flagship Ultrabook)
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="px-2.5 py-1 rounded-md bg-card border border-border flex items-center gap-1.5">
                    <Filter className="w-3 h-3" /> All Sentiments
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-card border border-border">
                    Last 30 Days
                  </span>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="surface-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Total Feedback</span>
                    <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">142</div>
                  <div className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="w-3 h-3" /> +18% this month
                  </div>
                </div>

                <div className="surface-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Average Rating</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">4.3 / 5.0</div>
                  <div className="text-[11px] text-muted mt-1 font-mono">★★★★☆ (89% 4+ ★)</div>
                </div>

                <div className="surface-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Positive Sentiment</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-500">68%</div>
                  <div className="text-[11px] text-muted mt-1">96 responses</div>
                </div>

                <div className="surface-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Negative Sentiment</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-red-500">18%</div>
                  <div className="text-[11px] text-muted mt-1">26 critical flags</div>
                </div>
              </div>

              {/* Two Column Layout: AI Summary & Sentiment Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* AI Executive Summary Card */}
                <div className="lg:col-span-2 surface-card rounded-xl p-5 border border-amber-500/25 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-accent">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                      Gemini AI Overall Executive Summary
                    </span>
                  </div>
                  <p className="text-sm text-primary leading-relaxed">
                    &ldquo;Customers overwhelmingly praise Laptop X for its color-accurate OLED display,
                    chassis build quality, and keyboard tactility. However, 18% of negative reviews consistently
                    highlight thermal throttling under extended video encoding workloads. Recommend firmware
                    fan-curve optimization.&rdquo;
                  </p>
                  <div className="mt-4 pt-3 border-t border-border/80 flex flex-wrap gap-2 text-xs">
                    <span className="text-muted">Key Drivers:</span>
                    <Badge variant="positive">Display Quality</Badge>
                    <Badge variant="positive">Keyboard</Badge>
                    <Badge variant="negative">Thermal Throttling</Badge>
                  </div>
                </div>

                {/* Sentiment Distribution Visual */}
                <div className="surface-card rounded-xl p-5 border border-border flex flex-col justify-between">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    Sentiment Breakdown
                  </div>
                  <div className="space-y-2.5 my-auto">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-500 font-medium">Positive</span>
                        <span className="text-muted font-mono">68%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-500 font-medium">Neutral</span>
                        <span className="text-muted font-mono">14%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '14%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-500 font-medium">Negative</span>
                        <span className="text-muted font-mono">18%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted text-center pt-2 font-mono">
                    Updated automatically via n8n pipeline
                  </div>
                </div>
              </div>

              {/* Sample Feed Table Row Preview */}
              <div className="surface-card rounded-xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-primary">Recent Feedback Record (Sample)</span>
                  <span className="font-mono">ID: FB-20261108-A9C1</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100/60 dark:bg-zinc-800/40 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="positive" dot>Positive</Badge>
                      <Badge variant="outline">Product Quality</Badge>
                      <span className="text-amber-400 font-mono">★★★★★ (5/5)</span>
                    </div>
                    <p className="text-primary font-medium">
                      &ldquo;The battery life on Laptop X easily surpasses 14 hours during college lectures. Best machine I&apos;ve owned.&rdquo;
                    </p>
                  </div>
                  <div className="shrink-0 p-2 rounded-md bg-card border border-border text-[11px] text-muted max-w-xs">
                    <span className="text-accent font-semibold block">Suggested Action:</span>
                    Feature long battery life testimonials in upcoming student marketing campaign.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* Caption note */}
      <div className="text-center mt-6">
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent font-medium transition-colors"
        >
          <span>Explore the actual application dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
