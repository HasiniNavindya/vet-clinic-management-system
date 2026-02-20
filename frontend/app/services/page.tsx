'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhyChooseUs from '@/components/home/WhyChooseUs';
type ServiceCategory = 'all' | 'medical' | 'grooming' | 'emergency' | 'preventive';

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');

  const services = [
    {
      id: 1,
      title: 'General Checkups',
      description: 'Comprehensive health examinations to ensure your pet stays healthy and happy. Early detection of potential health issues.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      category: 'medical',
      image: 'https://images.unsplash.com/photo-1530041539828-114de669390e?w=600&q=80'
    },
    {
      id: 2,
      title: 'Vaccinations',
      description: 'Protect your pet from serious diseases with our vaccination programs. Customized schedules based on your pet\'s needs.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      category: 'preventive',
      image: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=600&q=80'
    },
    {
      id: 3,
      title: '24/7 Emergency Care',
      description: 'Round-the-clock emergency services for urgent medical situations. Our team is always ready to help your pet.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      category: 'emergency',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80'
    },
    {
      id: 4,
      title: 'Surgical Services',
      description: 'Advanced surgical procedures performed by experienced veterinary surgeons with modern equipment and techniques.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      ),
      category: 'medical',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80'
    },
    {
      id: 5,
      title: 'Dental Care',
      description: 'Complete dental services including cleaning, extractions, and oral surgery. Maintain your pet\'s dental health.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      category: 'medical',
      image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=600&q=80'
    },
    {
      id: 6,
      title: 'Pet Grooming',
      description: 'Professional grooming services to keep your pet looking and feeling their best. Bath, haircut, nail trimming, and more.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      category: 'grooming',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'
    },
    {
      id: 7,
      title: 'Laboratory & Diagnostics',
      description: 'In-house laboratory for quick and accurate diagnostic testing. Blood work, urinalysis, and more.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      category: 'medical',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80'
    },
    {
      id: 8,
      title: 'Pet Boarding',
      description: 'Safe and comfortable boarding facilities when you\'re away. Your pet will be well cared for in a home-like environment.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      category: 'grooming',
      image: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=600&q=80'
    },
    {
      id: 9,
      title: 'Microchipping',
      description: 'Permanent identification for your pet\'s safety. Quick and painless procedure to help reunite lost pets with owners.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      category: 'preventive',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80'
    },
    {
      id: 10,
      title: 'Nutrition Counseling',
      description: 'Expert advice on diet and nutrition to keep your pet at optimal health. Customized meal plans available.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      category: 'preventive',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80'
    },
    {
      id: 11,
      title: 'Behavioral Consultation',
      description: 'Professional guidance for behavior issues. Training tips and strategies to improve your pet\'s behavior.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      category: 'preventive',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80'
    },
    {
      id: 12,
      title: 'Senior Pet Care',
      description: 'Specialized care for aging pets. Regular monitoring and management of age-related health conditions.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      category: 'medical',
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'medical', name: 'Medical' },
    { id: 'preventive', name: 'Preventive' },
    { id: 'emergency', name: 'Emergency' },
    { id: 'grooming', name: 'Grooming & Boarding' }
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1920&q=80"
            alt="Services background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our Services
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive veterinary care for your beloved pets. From routine checkups to emergency care, we're here for you 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Services We Offer Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Services Layout */}
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            {/* Left Column Services */}
            <div className="space-y-12">
              {[
                {
                  title: 'PET ADOPTION',
                  description: 'Find your perfect companion from our selection of loving pets waiting for their forever home.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )
                },
                {
                  title: 'PET GROOMING',
                  description: 'Professional grooming services to keep your pet looking and feeling their absolute best.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: 'PET DAYCARE',
                  description: 'Safe and engaging daycare services where your pet can play, socialize, and be cared for.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )
                }
              ].map((service, index) => (
                <div key={index} className="text-right">
                  <div className="flex items-start justify-end gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">
                        {service.description}
                      </p>
                    </div>
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-[#ec6d13] border-2 border-dashed border-gray-300 shrink-0 hover:border-[#ec6d13] hover:bg-orange-50 transition-all duration-300">
                      {service.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80"
                  alt="Happy pets"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Right Column Services */}
            <div className="space-y-12">
              {[
                {
                  title: 'VACCINATION',
                  description: 'Essential vaccinations to protect your pet from serious diseases and maintain optimal health.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  )
                },
                {
                  title: 'DOG TRAINING',
                  description: 'Expert training programs to help your dog develop good behavior and social skills.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                {
                  title: 'PET SITTER',
                  description: 'Reliable pet sitting services providing loving care for your pet while you\'re away.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map((service, index) => (
                <div key={index} className="text-left">
                  <div className="flex items-start gap-4">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-[#ec6d13] border-2 border-dashed border-gray-300 shrink-0 hover:border-[#ec6d13] hover:bg-orange-50 transition-all duration-300">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 text-lg">
              Real experiences from pet owners who trust us with their furry friends
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                pet: 'Max (Golden Retriever)',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
                rating: 5,
                text: 'The care and attention my dog received was exceptional. The staff truly loves animals and it shows in everything they do.'
              },
              {
                name: 'Michael Chen',
                pet: 'Luna (Persian Cat)',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
                rating: 5,
                text: 'Professional, compassionate, and always available. They treated Luna like their own pet. Highly recommend!'
              },
              {
                name: 'Emily Rodriguez',
                pet: 'Charlie (Beagle)',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
                rating: 5,
                text: 'Best veterinary clinic in town! The team is knowledgeable, caring, and always goes above and beyond for our pets.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
            alt="CTA background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Book an Appointment?
          </h2>
          <p className="text-white/90 text-xl mb-8">
            Our team is here to provide the best care for your beloved pets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-white text-[#ec6d13] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
              Schedule Appointment
            </Link>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
