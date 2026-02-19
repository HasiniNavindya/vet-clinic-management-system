'use client';

export default function AboutCTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80')" }}></div>
      <div className="absolute inset-0 bg-linear-to-r from-[#ec6d13]/95 to-[#d65e0f]/95"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Experience the Best Pet Care?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join thousands of happy pet owners who trust us with their furry family members
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-[#ec6d13] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            Schedule Visit
          </button>
          <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#ec6d13] transition-all duration-300">
            Call Us Now
          </button>
        </div>
      </div>
    </section>
  );
}
