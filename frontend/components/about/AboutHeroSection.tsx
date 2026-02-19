'use client';

export default function AboutHeroSection() {
  return (
    <section className="relative pt-32 pb-20 bg-linear-to-br from-orange-50 to-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ec6d13]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4">
              <span className="bg-[#ec6d13] text-white px-4 py-2 rounded-full text-sm font-semibold">
                About Our Clinic
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Pet's Health is Our Top Priority
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              For over 15 years, we've been dedicated to providing compassionate, comprehensive veterinary care. 
              Our state-of-the-art facilities and expert team ensure your pets receive the best treatment possible.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#ec6d13] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl">
                Book Appointment
              </button>
              <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold border-2 border-gray-200 hover:border-[#ec6d13] transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="relative h-[500px]">
            <div className="absolute inset-0 bg-[#ec6d13]/20 rounded-3xl rotate-6"></div>
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80"
                alt="Veterinary care"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
