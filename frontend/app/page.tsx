'use client';

import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import PetCare from '@/components/home/PetCare';
import HomeWhyChoose from '@/components/home/HomeWhyChoose';
import Stats from '@/components/home/Stats';
import EmergencyBanner from '@/components/home/EmergencyBanner';
import Testimonials from '@/components/home/Testimonials';
import Blog from '@/components/blog/Blog';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <PetCare />
      <HomeWhyChoose />
      <Stats />
      <EmergencyBanner />
      <Testimonials />
      <Blog />
      <Footer />
    </div>
  );
}
