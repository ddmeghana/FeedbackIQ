import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import ProductPreview from '../components/landing/ProductPreview';
import ProblemSolution from '../components/landing/ProblemSolution';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import InteractiveReveal from '../components/landing/InteractiveReveal';
import Marquee from '../components/landing/Marquee';
import FinalCTA from '../components/landing/FinalCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col selection:bg-accent selection:text-zinc-950">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-zinc-950 focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Floating Dock Navbar */}
      <Navbar />

      {/* Main Page Landmark */}
      <main id="main-content" className="flex-1">
        {/* Hero Section with Scramble & Particle Canvas */}
        <HeroSection />

        {/* Continuous Horizontal Marquee */}
        <Marquee />

        {/* High-Fidelity Interactive Platform Preview */}
        <ProductPreview />

        {/* The Problem & Solution Breakdown */}
        <ProblemSolution />

        {/* Bento Grid Feature Capabilities with Spotlight & Tilt */}
        <FeaturesSection />

        {/* 4-Step Process Visual */}
        <HowItWorks />

        {/* Interactive Capability Deep Dive Reveal */}
        <InteractiveReveal />

        {/* Final Conversion CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
