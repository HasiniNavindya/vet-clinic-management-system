'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ServicesOfferLayout from '@/components/services/ServicesOfferLayout';
import ServiceHeroSection from '@/components/services/ServiceHeroSection';
import ClientTestimonials from '@/components/services/ClientTestimonials';
import ServicesBookingCTA from '@/components/services/ServicesBookingCTA';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-0">
        <ServiceHeroSection />
        <ServicesOfferLayout />
        <WhyChooseUs />
        <ClientTestimonials />
        <ServicesBookingCTA />
      </main>

      <Footer />
    </div>
  );
}
