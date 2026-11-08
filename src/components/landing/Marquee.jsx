import { useReducedMotion } from 'framer-motion';

export default function Marquee() {
  const shouldReduceMotion = useReducedMotion();

  const phrases = [
    'COLLECT FEEDBACK',
    'UNDERSTAND SENTIMENT',
    'DISCOVER PATTERNS',
    'GENERATE INSIGHTS',
    'IMPROVE EXPERIENCES',
    'ZERO-COST ARCHITECTURE',
    'ACTIONABLE RECOMMENDATIONS',
  ];

  if (shouldReduceMotion) {
    return (
      <div className="py-6 border-y border-border bg-card/50 overflow-hidden text-center">
        <p className="text-xs font-mono tracking-widest text-muted">
          COLLECT FEEDBACK • UNDERSTAND SENTIMENT • DISCOVER PATTERNS • GENERATE INSIGHTS • IMPROVE EXPERIENCES
        </p>
      </div>
    );
  }

  return (
    <div
      className="py-6 border-y border-border bg-card/30 backdrop-blur-xs overflow-hidden relative select-none group"
      aria-hidden="true"
    >
      {/* Gradient Masks on Left & Right edges for seamless fade */}
      <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />

      {/* Ticker Flex Row */}
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[...Array(4)].map((_, setIdx) => (
          <div key={setIdx} className="flex items-center gap-8 px-4 shrink-0">
            {phrases.map((phrase, pIdx) => (
              <span
                key={pIdx}
                className="flex items-center gap-8 text-xs sm:text-sm font-mono font-semibold tracking-widest text-muted hover:text-accent transition-colors"
              >
                <span>{phrase}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
