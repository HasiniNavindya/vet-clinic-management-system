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
      <section className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/images/aboutbanner.png')" }}
        />

        <div className="absolute inset-0 bg-white/10" />

        <div className="relative z-10 flex h-full items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-black">
                About Us
              </h1>
              <p className="text-base sm:text-lg text-[#ec6d13] font-semibold max-w-3xl mx-auto px-2">
                Learn our story and discover why we're your trusted partner in pet care
              </p>
            </div>
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
