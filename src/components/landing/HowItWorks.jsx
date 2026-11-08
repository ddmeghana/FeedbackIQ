import { FormInput, Database, Cpu, PieChart } from 'lucide-react';
import RevealOnScroll from '../animations/RevealOnScroll';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Collect Feedback',
      subtitle: 'Accessible Web Submission',
      desc: 'Users access a clean, responsive form to submit 1–5 star ratings and detailed comments, with complete support for anonymous submissions.',
      icon: FormInput,
    },
    {
      num: '02',
      title: 'Store Responses',
      subtitle: 'Google Sheets Bridge',
      desc: 'Google Apps Script securely accepts the submission, assigns a unique response identifier (e.g. FB-20261108-A9C1), and marks it as Pending.',
      icon: Database,
    },
    {
      num: '03',
      title: 'Analyse With AI',
      subtitle: 'Automated n8n & Gemini',
      desc: 'The n8n automation engine picks up pending rows, requests structured JSON from Gemini Flash, and updates the row with sentiment, category, and action.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Discover Insights',
      subtitle: 'Interactive Dashboard & Reports',
      desc: 'The admin explores real-time product metrics, generates on-demand comprehensive AI summaries, and downloads styled PDF analysis reports.',
      icon: PieChart,
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label="How FeedbackIQ Works"
      className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
          WORKFLOW AUTOMATION
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-primary tracking-tight">
          How FeedbackIQ Works in Four Steps
        </h2>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          From customer response to executive action plan. Visual automation removes repetitive
          manual analysis without incurring recurring subscription costs.
        </p>
      </RevealOnScroll>

      {/* Step Cards Grid with Connecting Visual Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <RevealOnScroll key={step.num} delay={idx * 0.1} className="relative">
              <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col justify-between hover:border-accent/40 transition-colors">
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-extrabold text-accent">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-primary">{step.title}</h3>
                    <p className="text-xs font-medium text-accent mt-0.5">{step.subtitle}</p>
                  </div>

                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-border text-[11px] font-mono text-muted flex items-center justify-between">
                  <span>Step {idx + 1} of 4</span>
                  <span className="text-emerald-500 font-medium">Automated</span>
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
