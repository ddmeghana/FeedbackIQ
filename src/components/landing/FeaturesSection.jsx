import {
  Sparkles,
  Layers,
  Lightbulb,
  FileText,
} from 'lucide-react';
import RevealOnScroll from '../animations/RevealOnScroll';

export default function FeaturesSection() {
  const features = [
    {
      id: 'analysis',
      title: 'Smart Feedback Analysis',
      desc: 'Automatically evaluate individual customer responses. Identify positive, negative, neutral, or mixed sentiment and extract concise summaries for rapid review.',
      icon: Sparkles,
      tag: 'AI Intelligence',
    },
    {
      id: 'products',
      title: 'Product-Wise Analytics',
      desc: 'Isolate and examine feedback for specific products or services. Compare customer satisfaction metrics across your entire portfolio from a single dashboard.',
      icon: Layers,
      tag: 'Multi-Product',
    },
    {
      id: 'insights',
      title: 'Actionable AI Insights',
      desc: 'Uncover recurring complaints and notable praise patterns. Receive practical, automated improvement suggestions your engineering or support teams can act on.',
      icon: Lightbulb,
      tag: 'Executive Value',
    },
    {
      id: 'reports',
      title: 'Reports & Feedback History',
      desc: 'Filter and search through historical customer responses. Generate and download styled, product-specific PDF analysis reports entirely within your browser.',
      icon: FileText,
      tag: 'Export & Audit',
    },
  ];

  return (
    <section
      id="features"
      aria-label="Key Features Section"
      className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll className="text-center space-y-2 mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Everything You Need to Understand Feedback
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
          Four essential capabilities designed to turn unstructured customer responses into
          structured, high-impact decisions.
        </p>
      </RevealOnScroll>

      {/* Elegant 4-Card Bento Grid (2x2 on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;

          return (
            <RevealOnScroll key={feature.id} delay={idx * 0.08}>
              <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col justify-between hover:border-accent/40 hover:shadow-card-dark transition-all duration-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted font-medium">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-primary">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-mono text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Integrated workflow</span>
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
