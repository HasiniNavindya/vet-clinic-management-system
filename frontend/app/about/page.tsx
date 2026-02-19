import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import OurStorySection from '@/components/about/OurStorySection';
import MissionVisionValues from '@/components/about/MissionVisionValues';
import TimelineSection from '@/components/about/TimelineSection';
import Team from '@/components/team/Team';
import AboutCTA from '@/components/about/AboutCTA';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AboutHeroSection />
      <OurStorySection />
      <MissionVisionValues />
      <TimelineSection />
      <Team />
      <AboutCTA />
      <Footer />
    </div>
  );
}
