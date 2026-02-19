'use client';

export default function OurStorySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[600px]">
            <div className="absolute top-0 left-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80"
                alt="Veterinary team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80"
                alt="Pet care"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Story: A Journey of Compassion
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              What started as a small neighborhood clinic in 2010 has grown into a trusted name in veterinary care. 
              Our founder, Dr. Sarah Mitchell, had a simple vision: to create a place where pets would receive the 
              same level of care and compassion she would want for her own animals.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Today, our team of 25+ veterinary professionals serves thousands of pets across 5 locations. 
              We've invested in cutting-edge medical equipment, continuous training, and a culture that puts 
              pet welfare above everything else.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#ec6d13] text-white w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Advanced Technology</h3>
                  <p className="text-gray-600">State-of-the-art diagnostic and surgical equipment</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#ec6d13] text-white w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">24/7 Emergency Care</h3>
                  <p className="text-gray-600">Round-the-clock availability for urgent situations</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#ec6d13] text-white w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Compassionate Team</h3>
                  <p className="text-gray-600">Every pet is treated with love and respect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
