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

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1920&q=80"
            alt="About Us background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-white mb-4 sm:mb-6">
              About Us
            </h1>
            <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto px-2">
              Learn our story and discover why we're your trusted partner in pet care
            </p>
          </div>
        </div>
      </section>

      <AboutHeroSection />
      <OurStorySection />
      <MissionVisionValues />
      <Team />
      <BookAppointmentCTA />
      <Footer />
    </div>
  );
}
