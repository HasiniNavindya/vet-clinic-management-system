'use client';

import { useState } from 'react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Dog Owner',
      image: '👩',
      rating: 5,
      text: 'The care and attention my dog received was outstanding. The staff went above and beyond to make sure both of us felt comfortable. I wouldn\'t trust anyone else with my furry friend!',
      petName: 'Max'
    },
    {
      name: 'Michael Chen',
      role: 'Cat Owner',
      image: '👨',
      rating: 5,
      text: 'Dr. Hamilton and his team saved my cat\'s life during an emergency. Their quick response and expertise were incredible. Forever grateful for their dedication and compassion.',
      petName: 'Luna'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Rabbit Owner',
      image: '👩‍🦰',
      rating: 5,
      text: 'As a first-time rabbit owner, I had so many questions. The team was patient, informative, and genuinely cared about my pet\'s wellbeing. Highly recommend!',
      petName: 'Snowball'
    },
    {
      name: 'David Thompson',
      role: 'Multiple Pet Owner',
      image: '👨‍🦳',
      rating: 5,
      text: 'I bring all three of my pets here - two dogs and a cat. The staff knows each of them by name and treats them like family. Best veterinary clinic in town!',
      petName: 'Bella, Charlie & Whiskers'
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Pet Parents Say
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Don't just take our word for it – hear from the families we've had the privilege to serve
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Quote Icon */}
            <div className="text-[#ec6d13] mb-6">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>

            {/* Testimonial Text */}
            <p className="text-xl text-gray-700 leading-relaxed mb-8 italic">
              "{testimonials[activeIndex].text}"
            </p>

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="text-5xl">{testimonials[activeIndex].image}</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">
                  {testimonials[activeIndex].name}
                </h4>
                <p className="text-gray-600">{testimonials[activeIndex].role}</p>
                <p className="text-sm text-[#ec6d13] font-semibold">
                  Pet: {testimonials[activeIndex].petName}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-300 border border-gray-200"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'w-8 bg-[#ec6d13]' : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-300 border border-gray-200"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Stats Banner */}
          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl font-bold text-[#ec6d13] mb-2">4.9/5</div>
              <div className="text-gray-600 text-sm">Average Rating</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl font-bold text-[#ec6d13] mb-2">2,500+</div>
              <div className="text-gray-600 text-sm">Happy Reviews</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl font-bold text-[#ec6d13] mb-2">98%</div>
              <div className="text-gray-600 text-sm">Would Recommend</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
