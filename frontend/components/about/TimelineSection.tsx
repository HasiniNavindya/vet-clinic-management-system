'use client';

const timelineData = [
  { year: '2010', event: 'Founded', description: 'Started our journey with a small clinic' },
  { year: '2015', event: 'Expansion', description: 'Opened two new branches' },
  { year: '2020', event: 'Innovation', description: 'Introduced advanced surgical facilities' },
  { year: '2026', event: 'Excellence', description: 'Serving over 50,000 happy pets' }
];

export default function TimelineSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Our Journey Through the Years
          </h2>
          <p className="text-gray-600">
            Milestones that shaped who we are today
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          <div className="space-y-8">
            {timelineData.map((item, index) => (
              <div key={index} className="relative pl-20">
                <div className="absolute left-0 bg-[#ec6d13] text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm shadow">
                  {item.year}
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.event}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
