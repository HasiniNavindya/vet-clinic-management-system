'use client';

import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import HomeWhyChoose from '@/components/home/HomeWhyChoose';
import PetCare from '@/components/home/PetCare';
import Blog from '@/components/blog/Blog';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HomeWhyChoose />
      <PetCare />
      <Blog />
      <Footer />
    </div>
  );
}
