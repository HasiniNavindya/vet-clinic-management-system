import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import OurStorySection from '@/components/about/OurStorySection';
import MissionVisionValues from '@/components/about/MissionVisionValues';
import Team from '@/components/team/Team';
import BookAppointmentCTA from '@/components/about/BookAppointmentCTA';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AboutHeroSection />
      <OurStorySection />
      <MissionVisionValues />
      <Team />
      <BookAppointmentCTA />
      <Footer />
    </div>
  );
}
