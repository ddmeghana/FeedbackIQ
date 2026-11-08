import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown, Send } from 'lucide-react';
import { ROUTES } from '../../config/constants';
import TextScramble from '../animations/TextScramble';
import MagneticButton from '../animations/MagneticButton';
import ParticleBackground from './ParticleBackground';
import Button from '../ui/Button';

export default function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero Section"
      className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center"
    >
      {/* Background Interactive Particle Canvas */}
      <ParticleBackground />

      {/* Subtle radial ambient glow behind hero text */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/80 border border-border shadow-sm text-xs font-medium text-primary backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="font-mono uppercase tracking-wider text-[11px] text-muted">
            AI-Powered Feedback Intelligence
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-accent font-semibold text-[11px]">Free Tier Ready</span>
        </motion.div>

        {/* Headline with Text Scramble Effect */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-[1.15]">
          Turn Customer Feedback Into{' '}
          <span className="gradient-text block sm:inline">
            <TextScramble text="Your Next Big Improvement." speed={24} cycles={2} />
          </span>
        </h1>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
        >
          FeedbackIQ uses AI to analyse customer opinions, uncover recurring issues, and
          transform scattered feedback into structured, actionable insights.
        </motion.p>

        {/* Action Buttons with Magnetic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
        >
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

          <a href="#how-it-works">
            <Button size="lg" variant="ghost" className="text-muted hover:text-primary">
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Architecture Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-muted"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zero-Cost Architecture
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            n8n Automation Engine
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Gemini Flash Analysis
          </span>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none"
      >
        <a
          href="#product-preview"
          className="pointer-events-auto flex flex-col items-center gap-1 text-[11px] font-mono text-muted hover:text-accent transition-colors"
          aria-label="Scroll to product preview"
        >
          <span>EXPLORE PLATFORM</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
