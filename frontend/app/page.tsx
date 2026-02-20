"use client";
import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import PetCare from '@/components/home/PetCare';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Services from '@/components/services/Services';
import Stats from '@/components/home/Stats';
import Blog from '@/components/blog/Blog';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <PetCare />
      <WhyChooseUs />
      <Services />
      <Stats />
      <Blog />
      <Footer />
    </div>
  );
}