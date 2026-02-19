'use client';

const timelineData = [
  { year: '2010', event: 'Founded', description: 'Started our journey with a small clinic' },
  { year: '2015', event: 'Expansion', description: 'Opened two new branches' },
  { year: '2020', event: 'Innovation', description: 'Introduced advanced surgical facilities' },
  { year: '2026', event: 'Excellence', description: 'Serving over 50,000 happy pets' }
];

export default function TimelineSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&q=80')" }}></div>
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/40"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Our Journey Through the Years
          </h2>
          <p className="text-white/90 text-lg">
            Milestones that shaped who we are today
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/40"></div>
          
          <div className="space-y-12">
            {timelineData.map((item, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-1/2"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 bg-[#ec6d13] text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  {item.year}
                </div>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pl-12' : 'pr-12'}`}>
                  <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(236,109,19,0.3)] transition-all duration-300 hover:-translate-y-1 border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.event}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
