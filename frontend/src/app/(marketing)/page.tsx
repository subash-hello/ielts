import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ModulesShowcase from '@/components/landing/ModulesShowcase';
import StatsSection from '@/components/landing/StatsSection';
import HowItWorks from '@/components/landing/HowItWorks';
import TestimonialsCarousel from '@/components/landing/TestimonialsCarousel';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import AboutUsSection from '@/components/landing/AboutUsSection';
import CTASection from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <div className="gradient-mesh-bg">
      <HeroSection />
      <FeaturesGrid />
      <ModulesShowcase />
      <StatsSection />
      <HowItWorks />
      <TestimonialsCarousel />
      <PricingSection />
      <FAQSection />
      <AboutUsSection />
      <CTASection />
    </div>
  );
}
