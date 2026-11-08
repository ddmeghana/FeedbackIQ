import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageSquarePlus } from 'lucide-react';
import { ROUTES } from '../../config/constants';
import Button from '../ui/Button';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      aria-label="Hero Section"
      className="relative min-h-[82vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center"
    >
      {/* Subtle radial ambient glow behind hero text */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-7">
        {/* Prominent Brand Identity */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="font-extrabold tracking-widest text-xs uppercase text-primary">
            FEEDBACK<span className="text-accent">IQ</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-muted" />
          <span className="text-xs text-muted font-medium">AI Feedback Intelligence</span>
        </motion.div>

        {/* Clear Headline (No text scramble, immediately readable) */}
        <motion.h1
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-[1.15]"
        >
          Turn Customer Feedback Into{' '}
          <span className="gradient-text block sm:inline">
            Your Next Big Improvement.
          </span>
        </motion.h1>

        {/* Supporting Description */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered feedback analysis that transforms customer opinions into meaningful
          insights and actionable improvements.
        </motion.p>

        {/* CTAs: Primary Dashboard & Secondary Give Feedback */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Link to={ROUTES.DASHBOARD}>
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Dashboard
            </Button>
          </Link>
          <Link to={ROUTES.SUBMIT}>
            <Button
              size="lg"
              variant="outline"
              leftIcon={<MessageSquarePlus className="w-4 h-4 text-accent" />}
            >
              Give Feedback
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
