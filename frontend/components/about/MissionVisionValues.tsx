'use client';

export default function MissionVisionValues() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            What Drives Us
          </h2>
          <p className="text-gray-600">
            Our core principles that shape exceptional pet care
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Mission Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="bg-[#ec6d13] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To provide exceptional, compassionate veterinary care that enhances the health and well-being 
              of every pet we serve. Building lasting relationships based on trust and dedication.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="bg-[#ec6d13] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To be the most trusted veterinary care provider, setting the standard for excellence. 
              Creating a future where every pet receives world-class medical attention.
            </p>
          </div>

          {/* Values Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="bg-[#ec6d13] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Core Values</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="bg-orange-100 w-8 h-8 rounded flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Compassion</h4>
                  <p className="text-xs text-gray-600">Treating every pet with kindness</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-orange-100 w-8 h-8 rounded flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Excellence</h4>
                  <p className="text-xs text-gray-600">Highest quality care standards</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-orange-100 w-8 h-8 rounded flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Integrity</h4>
                  <p className="text-xs text-gray-600">Honest, transparent communication</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-orange-100 w-8 h-8 rounded flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Innovation</h4>
                  <p className="text-xs text-gray-600">Latest medical advancements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
