import {
  MessageSquarePlus,
  SmilePlus,
  Tag,
  Lightbulb,
  Boxes,
  BarChart3,
  History,
  FileDown,
} from 'lucide-react';
import SpotlightCard from '../animations/SpotlightCard';
import TiltCard from '../animations/TiltCard';
import RevealOnScroll from '../animations/RevealOnScroll';
import Badge from '../ui/Badge';

export default function FeaturesSection() {
  const features = [
    {
      id: 'collection',
      title: 'Smart Feedback Collection',
      desc: 'Clean, responsive feedback forms supporting 1–5 star ratings, rich written comments, and full anonymous submission options.',
      icon: MessageSquarePlus,
      colSpan: 'lg:col-span-2',
      tag: 'Respondent Facing',
      variant: 'spotlight',
    },
    {
      id: 'sentiment',
      title: 'AI Sentiment Analysis',
      desc: 'Classifies every comment into Positive, Negative, Neutral, Mixed, or Unclear with calibrated nuances using Gemini Flash.',
      icon: SmilePlus,
      colSpan: 'lg:col-span-1',
      tag: 'AI Intelligence',
      variant: 'tilt',
    },
    {
      id: 'categories',
      title: 'Intelligent Categorisation',
      desc: 'Automatically tags responses into Product Quality, Pricing, Delivery, Customer Support, Usability, Performance, or Features.',
      icon: Tag,
      colSpan: 'lg:col-span-1',
      tag: 'Taxonomy',
      variant: 'spotlight',
    },
    {
      id: 'insights',
      title: 'Actionable AI Insights',
      desc: 'Transforms comments into single-sentence summaries and generates concrete, realistic improvement recommendations for engineers and product teams.',
      icon: Lightbulb,
      colSpan: 'lg:col-span-2',
      tag: 'Executive Value',
      variant: 'spotlight',
    },
    {
      id: 'products',
      title: 'Product-Wise Multi-Item Scope',
      desc: 'Seamlessly isolate metrics for Laptop X, Mobile Y, or Headphones Z. Manage multiple product lines from one unified organization view.',
      icon: Boxes,
      colSpan: 'lg:col-span-1',
      tag: 'Product Scope',
      variant: 'tilt',
    },
    {
      id: 'dashboard',
      title: 'Interactive Analytics Dashboard',
      desc: 'Visualise average ratings, distribution bar charts, sentiment shares, and recent responses with instant date & category filtering.',
      icon: BarChart3,
      colSpan: 'lg:col-span-2',
      tag: 'Admin Interface',
      variant: 'spotlight',
    },
    {
      id: 'history',
      title: 'Searchable Feedback History',
      desc: 'Full-text search, multi-condition filtering, and status monitoring to review raw responses and AI processing outcomes.',
      icon: History,
      colSpan: 'lg:col-span-1',
      tag: 'Auditing',
      variant: 'spotlight',
    },
    {
      id: 'reports',
      title: 'Client-Side PDF Reports',
      desc: 'Generate executive summary reports downloadable as formatted PDFs directly from your browser with zero external reporting costs.',
      icon: FileDown,
      colSpan: 'lg:col-span-2',
      tag: 'Export Ready',
      variant: 'spotlight',
    },
  ];

  return (
    <section
      id="features"
      aria-label="Features Section"
      className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
          CAPABILITIES
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-primary tracking-tight">
          Engineered for Deep Product Understanding
        </h2>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          Every component in FeedbackIQ works in harmony: from respondent submission to automated
          Gemini classification and executive PDF reporting.
        </p>
      </RevealOnScroll>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;

          const CardContent = (
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" size="sm">
                    {feature.tag}
                  </Badge>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-primary">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-accent">
                <span>Phase-ready</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span className="text-muted">Zero-cost pipeline</span>
              </div>
            </div>
          );

          if (feature.variant === 'tilt') {
            return (
              <RevealOnScroll key={feature.id} delay={idx * 0.05} className={feature.colSpan}>
                <TiltCard className="h-full">
                  {CardContent}
                </TiltCard>
              </RevealOnScroll>
            );
          }

          return (
            <RevealOnScroll key={feature.id} delay={idx * 0.05} className={feature.colSpan}>
              <SpotlightCard className="h-full">
                {CardContent}
              </SpotlightCard>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
