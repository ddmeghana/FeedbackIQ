import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile,
  GitCompare,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import RevealOnScroll from '../animations/RevealOnScroll';
import Badge from '../ui/Badge';

export default function InteractiveReveal() {
  const [activeTab, setActiveTab] = useState(0);

  const capabilities = [
    {
      id: 'sentiment',
      title: 'Sentiment Intelligence',
      icon: Smile,
      subtitle: 'Multidimensional classification beyond simple positive/negative',
      desc: 'Feedback is rarely black and white. FeedbackIQ classifies responses into Positive, Negative, Neutral, Mixed, or Unclear sentiment. For instance, a customer stating "The camera hardware is brilliant, but battery life drains in 3 hours" is accurately identified as Mixed sentiment with both drivers extracted.',
      details: [
        'Positive: Highlights delight and core strengths',
        'Negative: Detects friction, churn risks, and technical defects',
        'Mixed: Uncovers trade-offs and nuanced impressions',
        'Neutral: Informational statements and general suggestions',
      ],
      sampleOutput: {
        sentiment: 'Mixed',
        badgeVariant: 'mixed',
        comment: 'Screen is stunning, but keyboard travel feels shallow.',
        category: 'Usability',
      },
    },
    {
      id: 'compare',
      title: 'Product-Wise Comparison',
      icon: GitCompare,
      subtitle: 'Compare customer reception across your entire product catalogue',
      desc: 'Evaluate how Laptop X compares to Mobile Y or Headphones Z. The dashboard aggregates feedback independently per product, enabling side-by-side benchmarking of average ratings, issue frequencies, and category-level satisfaction scores.',
      details: [
        'Independent product registries managed in Google Sheets',
        'Direct side-by-side rating distributions',
        'Product-specific AI executive summaries',
        'Compare recurring complaint patterns between iterations',
      ],
      sampleOutput: {
        sentiment: 'Positive',
        badgeVariant: 'positive',
        comment: 'Headphones Z active noise cancellation beats competitors.',
        category: 'Product Quality',
      },
    },
    {
      id: 'summary',
      title: 'On-Demand AI Summaries',
      icon: Sparkles,
      subtitle: 'Synthesise hundreds of responses into concise executive briefings',
      desc: 'Instead of re-reading dozens of reviews, generate a comprehensive executive summary for any product on demand. Gemini synthesises common praise, recurring frustrations, and areas requiring immediate team attention without repetitive quota usage.',
      details: [
        'Generated on demand to conserve free-tier API quotas',
        'Highlights top 3 customer praise drivers',
        'Identifies top 3 recurring friction points',
        'Outlines immediate recommended focus areas',
      ],
      sampleOutput: {
        sentiment: 'Neutral',
        badgeVariant: 'neutral',
        comment: 'Packaging was crushed upon delivery, but internal product was unharmed.',
        category: 'Delivery',
      },
    },
    {
      id: 'actions',
      title: 'Actionable Next Steps',
      icon: CheckCircle2,
      subtitle: 'Turn customer voice into concrete development priorities',
      desc: 'Every analyzed feedback row concludes with a practical, contextual action recommendation. FeedbackIQ bridges the gap between customer words and engineering tickets so your team knows precisely what step to take next.',
      details: [
        'Concrete engineering, design, or operational tasks',
        'Assigned directly alongside each individual feedback row',
        'Included in downloadable PDF executive reports',
        'Zero human effort required to draft initial recommendations',
      ],
      sampleOutput: {
        sentiment: 'Negative',
        badgeVariant: 'negative',
        comment: 'Checkout page crashes on mobile Safari after entering CVV.',
        category: 'Usability',
      },
    },
  ];

  return (
    <section
      aria-label="Interactive Feature Capabilities"
      className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
          DEEP DIVE
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-primary tracking-tight">
          Explore Core Capabilities in Action
        </h2>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          Click through to preview how FeedbackIQ decomposes and processes real-world feedback scenarios.
        </p>
      </RevealOnScroll>

      {/* Accordion / Tabbed Morphing Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Selector Buttons */}
        <div className="lg:col-span-5 space-y-2">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeTab === idx;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                aria-expanded={isSelected}
                aria-controls={`capability-panel-${item.id}`}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'surface-card border-accent shadow-sm'
                    : 'bg-card/50 border-border hover:bg-card hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-accent text-zinc-950'
                        : 'bg-zinc-200/60 dark:bg-zinc-800/60 text-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-muted'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-1">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${
                    isSelected ? 'rotate-90 text-accent' : ''
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Morphing Detail Showcase Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`capability-panel-${capabilities[activeTab].id}`}
              role="region"
              aria-label={capabilities[activeTab].title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="surface-card rounded-2xl p-6 sm:p-8 border border-border space-y-6 shadow-card-dark"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
                    Capability Detail
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary">
                  {capabilities[activeTab].title}
                </h3>
                <p className="text-xs font-medium text-accent mt-0.5">
                  {capabilities[activeTab].subtitle}
                </p>
                <p className="text-sm text-muted mt-3 leading-relaxed">
                  {capabilities[activeTab].desc}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Key Specifications
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted">
                  {capabilities[activeTab].details.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Live Illustrative Mock Output */}
              <div className="p-4 rounded-xl bg-canvas/70 border border-border space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted font-mono">
                  <span>Simulated Analysis Result</span>
                  <span>Gemini Flash Output</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant={capabilities[activeTab].sampleOutput.badgeVariant} dot>
                    {capabilities[activeTab].sampleOutput.sentiment}
                  </Badge>
                  <Badge variant="outline">
                    {capabilities[activeTab].sampleOutput.category}
                  </Badge>
                </div>
                <p className="text-xs text-primary italic pt-1">
                  &ldquo;{capabilities[activeTab].sampleOutput.comment}&rdquo;
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
