import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import Button from '../ui/Button';
import MagneticButton from '../animations/MagneticButton';
import RevealOnScroll from '../animations/RevealOnScroll';
import { ROUTES } from '../../config/constants';

export default function FinalCTA() {
  return (
    <section
      aria-label="Call to Action"
      className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <RevealOnScroll>
        <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden border border-amber-500/30 bg-gradient-to-b from-card via-card to-card/60 shadow-2xl">
          {/* Ambient Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              INTELLIGENT FEEDBACK OPERATIONS
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight leading-tight">
              Every Response Has Something to Tell You.
            </h2>

            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Bring customer feedback together and discover the insights that help you improve.
              Deploy a zero-cost, intelligent analytics workflow for your organization today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton strength={0.3}>
                <Link to={ROUTES.DASHBOARD}>
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore Dashboard
                  </Button>
                </Link>
              </MagneticButton>

              <Link to={ROUTES.SUBMIT}>
                <Button size="lg" variant="secondary" leftIcon={<Send className="w-4 h-4 text-accent" />}>
                  Submit Live Feedback
                </Button>
              </Link>
            </div>

            <p className="text-[11px] font-mono text-muted pt-2">
              Free Community Tier · No Credit Card Required · Open Architecture
            </p>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
