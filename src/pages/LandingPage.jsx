import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import ProductPreview from '../components/landing/ProductPreview';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
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

      {/* Main Page Landmark — Exactly 5 Sections */}
      <main id="main-content" className="flex-1">
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Product Preview */}
        <ProductPreview />

        {/* Section 3: Key Features (4 concise cards) */}
        <FeaturesSection />

        {/* Section 4: How It Works (4 simple steps) */}
        <HowItWorks />

        {/* Section 5: Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
