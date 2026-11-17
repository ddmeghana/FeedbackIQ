import {
  Sparkles,
  Star,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import Badge from '../ui/Badge';
import RevealOnScroll from '../animations/RevealOnScroll';

export default function ProductPreview() {
  return (
    <section
      id="product-preview"
      aria-label="Product Interface Preview"
      className="py-12 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <RevealOnScroll className="text-center space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Unified Analytics Across All Products
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
          Explore individual product performance, sentiment metrics, and automated AI summaries
          from one centralized administrative interface.
        </p>
      </RevealOnScroll>

      {/* Mockup Frame Container */}
      <RevealOnScroll delay={0.1}>
        <div className="relative rounded-2xl p-1 bg-gradient-to-b from-border/80 via-border/40 to-transparent shadow-xl">
          <div className="surface-card rounded-xl border border-border overflow-hidden">
            {/* Mockup Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-[11px] font-mono text-muted ml-3 hidden sm:inline-block">
                  feedbackiq.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold tracking-wider uppercase">
                  Sample Data · UI Preview
                </span>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-4 sm:p-6 space-y-5 bg-canvas/30">
              {/* Product Selector Filter Bar Simulation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">Selected Product:</span>
                  <div className="px-3 py-1.5 rounded-lg bg-card border border-accent/40 text-xs font-medium text-primary flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Laptop X (Flagship Model)
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="px-2.5 py-1 rounded-md bg-card border border-border flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-muted" /> All Sentiments
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-card border border-border">
                    Last 30 Days
                  </span>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="surface-card rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Total Responses</span>
                    <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">142</div>
                  <div className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="w-3 h-3" /> +18% this month
                  </div>
                </div>

                <div className="surface-card rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Average Rating</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">4.3 / 5.0</div>
                  <div className="text-[11px] text-muted mt-1 font-mono">★★★★☆ (89% 4+ ★)</div>
                </div>

                <div className="surface-card rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Positive Sentiment</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-500">68%</div>
                  <div className="text-[11px] text-muted mt-1">96 responses</div>
                </div>

                <div className="surface-card rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between text-muted text-xs mb-1">
                    <span>Negative Issues</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-red-500">18%</div>
                  <div className="text-[11px] text-muted mt-1">26 critical flags</div>
                </div>
              </div>

              {/* Two Column Layout: AI Summary & Sentiment Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* AI Executive Summary Card */}
                <div className="lg:col-span-2 surface-card rounded-xl p-4 sm:p-5 border border-amber-500/25 relative">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center text-accent">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                      AI Executive Summary Preview
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-primary leading-relaxed">
                    &ldquo;Customers praise Laptop X for display clarity and chassis quality. However, reviews
                    consistently highlight thermal throttling under extended multi-tasking workloads.
                    Recommend firmware fan-curve update.&rdquo;
                  </p>
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2 text-xs">
                    <span className="text-muted text-[11px]">Identified Categories:</span>
                    <Badge variant="positive" size="sm">Display Quality</Badge>
                    <Badge variant="positive" size="sm">Keyboard</Badge>
                    <Badge variant="negative" size="sm">Thermal Management</Badge>
                  </div>
                </div>

                {/* Sentiment Distribution Visual */}
                <div className="surface-card rounded-xl p-4 sm:p-5 border border-border flex flex-col justify-between">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    Sentiment Breakdown
                  </div>
                  <div className="space-y-2 my-auto">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-emerald-500 font-medium">Positive</span>
                        <span className="text-muted font-mono">68%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-amber-500 font-medium">Neutral</span>
                        <span className="text-muted font-mono">14%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '14%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-red-500 font-medium">Negative</span>
                        <span className="text-muted font-mono">18%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted text-center pt-2 font-mono">
                    Product-Specific Aggregate View
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
