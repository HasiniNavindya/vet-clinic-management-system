'use client';

export default function ContactInfoCards() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Phone */}
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&q=80" 
                alt="Phone"
                className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/70 to-white/80"></div>
            </div>
            <div className="relative z-10 p-8 text-center">
              <div className="bg-[#ec6d13] text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Phone</h3>
              <p className="text-gray-700 font-medium mb-4 text-base">Mon-Fri from 8am to 5pm</p>
              <a href="tel:+15551234567" className="text-[#ec6d13] font-bold text-lg hover:text-[#d65e0f] transition-colors">
                +1 (555) 123-4567
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80" 
                alt="Email"
                className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/70 to-white/80"></div>
            </div>
            <div className="relative z-10 p-8 text-center">
              <div className="bg-[#ec6d13] text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Email</h3>
              <p className="text-gray-700 font-medium mb-4 text-base">We'll respond within 24 hours</p>
              <a href="mailto:info@vetcare.com" className="text-[#ec6d13] font-bold text-lg hover:text-[#d65e0f] transition-colors">
                info@vetcare.com
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80" 
                alt="Location"
                className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/70 to-white/80"></div>
            </div>
            <div className="relative z-10 p-8 text-center">
              <div className="bg-[#ec6d13] text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Location</h3>
              <p className="text-gray-700 font-medium mb-4 text-base">Visit our clinic</p>
              <p className="text-[#ec6d13] font-bold text-lg">
                123 Pet Street, Anytown, USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
