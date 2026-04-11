import { HeroSection } from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import StatsSection from '@/components/StatsSection'
import PricingSection from '@/components/PricingSection'
import ServerLocationsSection from '@/components/ServerLocationsSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'
import PromoBannerCarousel from '@/components/PromoBannerCarousel'

export default function LandingClassic() {
  return (
    <main>
      {/* 1. Hero Section - Animated star field + aurora */}
      <HeroSection />

      {/* Promo Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PromoBannerCarousel />
      </div>

      {/* 2. Stats Section - Animated counters */}
      <StatsSection />

      {/* 3. Features Section - 6 cards + use cases + tech stack */}
      <FeaturesSection />

      {/* 4. Server Locations - 12 locations + features */}
      <ServerLocationsSection />

      {/* 5. Pricing Section - 3 plans */}
      <PricingSection />

      {/* 6. How It Works - 3 steps */}
      <HowItWorksSection />

      {/* 7. Testimonials - Auto carousel */}
      <TestimonialsSection />

      {/* 8. FAQ Section - 8 items accordion */}
      <FAQSection />

      {/* 9. CTA Section - Final push */}
      <CTASection />
    </main>
  )
}
