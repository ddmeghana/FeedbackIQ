import { FormInput, Database, Cpu, PieChart } from 'lucide-react';
import RevealOnScroll from '../animations/RevealOnScroll';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Collect Feedback',
      desc: 'Respondents submit ratings and comments through a clean, responsive web form with optional anonymity.',
      icon: FormInput,
    },
    {
      num: '02',
      title: 'Store Responses',
      desc: 'Each response is securely stored with a unique identifier and tagged to its corresponding product.',
      icon: Database,
    },
    {
      num: '03',
      title: 'Analyse With AI',
      desc: 'The AI model evaluates sentiment, categorises the topic, and generates an actionable next step.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Discover Insights',
      desc: 'Your team accesses central analytics, reviews overall summaries, and exports PDF reports.',
      icon: PieChart,
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label="How FeedbackIQ Works"
      className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll className="text-center space-y-2 mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          How FeedbackIQ Works
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
          A straightforward four-step workflow from customer response to executive decisions.
        </p>
      </RevealOnScroll>

      {/* 4-Step Process Visual: Horizontal on desktop, Vertical on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <RevealOnScroll key={step.num} delay={idx * 0.08}>
              <div className="surface-card rounded-2xl p-5 border border-border h-full flex flex-col justify-between hover:border-accent/30 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono font-extrabold text-accent">
                      {step.num}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-primary">
                    {step.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-muted">
                  Step {idx + 1} of 4
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
