'use client';

export default function ServiceHeroSection() {
  return (
    <section className="relative pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/servicepng.png"
          alt="Service page banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-white mb-6">
            Our Services
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Comprehensive veterinary care for your beloved pets. From routine checkups to emergency care, we're here for you 24/7.
          </p>
        </div>
      </div>
    </section>
  );
}
