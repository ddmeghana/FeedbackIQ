import { XCircle, CheckCircle, ArrowRight } from 'lucide-react';
import RevealOnScroll from '../animations/RevealOnScroll';

export default function ProblemSolution() {
  const problems = [
    {
      title: 'Scattered & Fragmented Input',
      desc: 'Customer feedback pours in across surveys and forms without a centralized, unified repository.',
    },
    {
      title: 'Manual Reading Bottleneck',
      desc: 'Going through hundreds of raw paragraphs manually drains hours of team bandwidth every week.',
    },
    {
      title: 'Overlooked Critical Complaints',
      desc: 'Recurring bugs, delivery failures, or usability pain-points get buried beneath generic comments.',
    },
    {
      title: 'No Concrete Action Plan',
      desc: 'Teams possess raw sentiment but lack specific, practical next steps to address the root causes.',
    },
  ];

  const solutions = [
    {
      title: 'Unified Product-Wise Storage',
      desc: 'Store and track every customer response in Google Sheets with unique identifiers and product tags.',
    },
    {
      title: 'Automated AI Classification',
      desc: 'Gemini AI classifies sentiment, extracts key categories, and drafts a concise summary in seconds.',
    },
    {
      title: 'Instant Trend Discovery',
      desc: 'Identify recurring positive drivers and complaint clusters immediately on intuitive visual charts.',
    },
    {
      title: 'Automated Action Recommendations',
      desc: 'Every single response receives an AI-suggested practical intervention your team can execute.',
    },
  ];

  return (
    <section
      id="about"
      aria-label="Problem and Solution"
      className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
          THE CHALLENGE & THE FIX
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-primary tracking-tight">
          Why Manual Feedback Processing Fails
        </h2>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          Reading raw responses in spreadsheets does not scale. FeedbackIQ automates the heavy lifting so
          you can focus on improving your product.
        </p>
      </RevealOnScroll>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* The Old / Manual Way */}
        <RevealOnScroll direction="left" className="h-full">
          <div className="h-full surface-card rounded-2xl p-6 sm:p-8 border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent relative">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">The Manual Feedback Grind</h3>
                <p className="text-xs text-muted">Spreadsheets, guesswork, and delayed action</p>
              </div>
            </div>

            <ul className="space-y-5">
              {problems.map((p, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold">
                    ✕
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-primary">{p.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>

        {/* The FeedbackIQ Way */}
        <RevealOnScroll direction="right" className="h-full">
          <div className="h-full surface-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-transparent relative">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">The FeedbackIQ Automation</h3>
                <p className="text-xs text-accent font-medium">Visual workflows, Gemini AI, instant clarity</p>
              </div>
            </div>

            <ul className="space-y-5">
              {solutions.map((s, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-primary">{s.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
