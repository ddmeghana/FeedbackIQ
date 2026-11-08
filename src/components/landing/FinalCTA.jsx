import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import RevealOnScroll from '../animations/RevealOnScroll';
import { ROUTES } from '../../config/constants';

export default function FinalCTA() {
  return (
    <section
      aria-label="Call to Action"
      className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60"
    >
      <RevealOnScroll>
        <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden border border-amber-500/25 bg-gradient-to-b from-card to-card/60 shadow-xl">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">
              Every Response Has Something to Tell You.
            </h2>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Bring customer feedback together and discover the insights that help you improve.
              Monitor, analyse, and benchmark your products in one place.
            </p>

            <div className="pt-2 flex items-center justify-center">
              <Link to={ROUTES.DASHBOARD}>
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
