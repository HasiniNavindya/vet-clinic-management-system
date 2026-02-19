'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function InteractiveFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What makes your clinic different from others?',
      answer: 'We combine state-of-the-art technology with personalized, compassionate care. Our team treats every pet as if they were our own, and we maintain a 99% client satisfaction rate. Plus, we offer 24/7 emergency services and telemedicine consultations.',
      icon: '⭐'
    },
    {
      question: 'Do you offer emergency services?',
      answer: 'Yes! We provide 24/7 emergency veterinary care with specialists always on call. Our emergency unit is equipped with advanced diagnostic tools and surgical facilities to handle any urgent situation.',
      icon: '🚨'
    },
    {
      question: 'How experienced is your veterinary team?',
      answer: 'Our team consists of 25+ licensed veterinarians with an average of 10+ years of experience. Many hold specialized certifications in areas like surgery, internal medicine, and exotic animal care. We invest heavily in continuing education.',
      icon: '👨‍⚕️'
    },
    {
      question: 'What types of pets do you treat?',
      answer: 'We care for all types of companion animals including dogs, cats, rabbits, birds, reptiles, and small mammals. Our clinic has specialized equipment and trained staff for exotic pet care as well.',
      icon: '🐾'
    },
    {
      question: 'Do you offer payment plans or pet insurance?',
      answer: 'Yes, we work with all major pet insurance providers and offer flexible payment plans. Our staff can help you understand your options and make quality veterinary care more affordable for your family.',
      icon: '💳'
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: FAQ Section */}
          <div>
            <div className="mb-8">
              <span className="text-[#ec6d13] font-semibold text-sm uppercase tracking-wider">
                Have Questions?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 text-lg">
                Get answers to common questions about our services and care
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                    openIndex === index
                      ? 'border-[#ec6d13] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`text-2xl transition-transform duration-300 ${
                        openIndex === index ? 'scale-125' : ''
                      }`}>
                        {faq.icon}
                      </span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {faq.question}
                      </span>
                    </div>
                    <svg
                      className={`w-6 h-6 text-[#ec6d13] transition-transform duration-300 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`transition-all duration-300 ${
                      openIndex === index
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="px-6 pb-4 pt-2">
                      <p className="text-gray-600 leading-relaxed pl-11">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button className="bg-[#ec6d13] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                <span>Still have questions? Contact Us</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Image with Stats */}
          <div className="relative lg:sticky lg:top-24">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[600px] group">
              <Image
                src="https://images.unsplash.com/photo-1530041539828-114de669390e?w=800&q=80"
                alt="Veterinary consultation"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Floating Stats Cards */}
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#ec6d13] text-white p-4 rounded-lg text-2xl">
                      😊
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">99%</div>
                      <div className="text-sm text-gray-600">Client Satisfaction</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white p-4 rounded-lg text-2xl">
                      ⏱️
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">&lt;15min</div>
                      <div className="text-sm text-gray-600">Average Wait Time</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-600 text-white p-4 rounded-lg text-2xl">
                      ✅
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">50K+</div>
                      <div className="text-sm text-gray-600">Successful Treatments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#ec6d13] rounded-full opacity-20 -z-10 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
