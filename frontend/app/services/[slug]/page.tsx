'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const servicesData = {
  'care-advice': {
    title: 'Pet Care Advice',
    subtitle: 'Expert guidance for your pet\'s wellbeing',
    heroImage: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80',
    description: 'Our experienced veterinarians provide practical advice on nutrition, behavior, exercise, and daily care to help your pet live a happy, healthy life.',
    features: [
      {
        title: 'Nutrition Planning',
        description: 'Get personalized diet recommendations based on your pet\'s age, breed, size, and health needs.',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      {
        title: 'Behavior Training',
        description: 'Learn effective techniques to address behavioral issues and improve your pet\'s obedience.',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      },
      {
        title: 'Exercise & Activity',
        description: 'Customized exercise routines to keep your pet active, fit, and mentally stimulated.',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
      {
        title: 'Health Monitoring',
        description: 'Learn to recognize warning signs and maintain your pet\'s health at home.',
        image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    ],
    benefits: [
      'One-on-one consultations with experienced veterinarians',
      'Personalized care plans for your specific pet',
      'Follow-up support via phone or email',
      'Educational resources and handouts',
      'Advice on preventive care measures'
    ],
    pricing: {
      basic: { price: '$50', duration: '30 minutes', features: ['Basic consultation', 'General care advice', 'Email support'] },
      standard: { price: '$85', duration: '60 minutes', features: ['Comprehensive consultation', 'Personalized care plan', 'Phone & email support', 'Follow-up session'] },
      premium: { price: '$150', duration: '90 minutes', features: ['In-depth consultation', 'Complete care strategy', '24/7 support access', 'Multiple follow-ups', 'Home visit option'] }
    }
  },
  'veterinary-help': {
    title: 'Veterinary Medical Care',
    subtitle: 'Professional medical care for your pets',
    heroImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1920&q=80',
    description: 'Comprehensive veterinary medical services providing diagnosis, treatment, and ongoing care for all your pet\'s health needs with state-of-the-art equipment and experienced veterinarians.',
    features: [
      {
        title: 'Health Examinations',
        description: 'Thorough physical examinations to detect health issues and ensure your pet stays in optimal condition.',
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      },
      {
        title: 'Diagnostic Services',
        description: 'Advanced diagnostic tools including blood tests, X-rays, and ultrasounds for accurate diagnosis.',
        image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      },
      {
        title: 'Medical Treatments',
        description: 'Treatment for acute and chronic conditions with personalized medication and therapy plans.',
        image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      },
      {
        title: 'Surgical Procedures',
        description: 'Safe surgical services performed by experienced veterinarians with modern equipment.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
        )
      }
    ],
    benefits: [
      'Experienced and licensed veterinarians',
      'Modern medical equipment and facilities',
      'Comprehensive treatment plans',
      'Post-treatment care and monitoring',
      'Transparent pricing and payment plans',
      'Medical records available online'
    ],
    pricing: {
      basic: { price: '$75', duration: 'Standard visit', features: ['General examination', 'Basic diagnosis', 'Prescription if needed'] },
      standard: { price: '$150', duration: 'Extended care', features: ['Comprehensive exam', 'Lab tests included', 'Treatment plan', 'Follow-up visit'] },
      premium: { price: '$300+', duration: 'Specialized care', features: ['Specialist consultation', 'Advanced diagnostics', 'Complex treatments', 'Ongoing care plan', 'Priority scheduling'] }
    }
  },
  'emergency-service': {
    title: '24/7 Emergency Care',
    subtitle: 'Critical care when your pet needs it most',
    heroImage: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=1920&q=80',
    description: 'Immediate medical attention for critical situations. Our emergency team is available round-the-clock to handle urgent medical conditions and life-threatening situations.',
    features: [
      {
        title: '24/7 Availability',
        description: 'Our emergency team is available day and night, including weekends and holidays.',
        image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        title: 'Rapid Response',
        description: 'Immediate triage and treatment by trained emergency veterinarians.',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
      {
        title: 'Critical Care',
        description: 'Fully equipped ICU with monitoring systems and life-support equipment.',
        image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      },
      {
        title: 'Emergency Surgery',
        description: 'Immediate surgical intervention for trauma and life-threatening conditions.',
        image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      }
    ],
    benefits: [
      'Immediate medical attention - no appointment needed',
      'State-of-the-art emergency equipment',
      'Experienced emergency veterinarians on duty',
      'Direct communication with your regular vet',
      'Post-emergency follow-up care'
    ],
    pricing: {
      basic: { price: '$200', duration: 'Emergency consultation', features: ['Initial assessment', 'Stabilization', 'Emergency exam'] },
      standard: { price: '$500', duration: 'Critical care', features: ['Complete emergency treatment', 'Diagnostic tests', 'Medication', 'Short-term monitoring'] },
      premium: { price: '$1000+', duration: 'Intensive care', features: ['Emergency surgery', 'ICU admission', 'Extended monitoring', 'Complete treatment'] }
    },
    emergencySituations: [
      'Difficulty breathing or choking',
      'Severe bleeding or trauma',
      'Ingestion of toxic substances',
      'Seizures or loss of consciousness',
      'Severe vomiting or diarrhea',
      'Inability to urinate or defecate',
      'Eye injuries or sudden blindness',
      'Heatstroke or hypothermia'
    ]
  }
};

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = servicesData[slug as keyof typeof servicesData];

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Link href="/services" className="text-[#ec6d13] hover:underline">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Simple Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={service.heroImage}
            alt={service.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {service.title}
          </h1>
          <p className="text-xl text-white/90">
            {service.subtitle}
          </p>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Care Advice
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Features Grid with Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                {/* Feature Image */}
                {'image' in feature && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* Feature Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#ec6d13]/10 rounded-lg flex items-center justify-center text-[#ec6d13]">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              What's Included
            </h2>
            
            <div className="space-y-4">
              {service.benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg"
                >
                  <div className="w-6 h-6 bg-[#ec6d13] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Situations (only for emergency service) */}
      {slug === 'emergency-service' && 'emergencySituations' in service && service.emergencySituations && (
        <section className="py-16 bg-red-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Emergency Warning Signs
                </h2>
                <p className="text-lg text-gray-600">
                  Call us immediately if you notice these symptoms
                </p>
              </div>
              
              {/* Emergency Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {service.emergencySituations.map((situation: string, index: number) => (
                  <div 
                    key={index}
                    className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                      </div>
                      <p className="text-gray-700 pt-1">{situation}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Emergency Contact Card */}
              <div className="bg-red-600 rounded-2xl p-8 md:p-10 text-center">
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold text-sm mb-4">
                    🚨 24/7 Emergency Response
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Don't Wait - Call Now!
                  </h3>
                  <p className="text-white/90 text-lg max-w-2xl mx-auto">
                    Our emergency team is standing by to provide immediate assistance
                  </p>
                </div>
                
                <a 
                  href="tel:+12345656789" 
                  className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-xl hover:bg-gray-50 transition-colors shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 234 565 6789</span>
                </a>
                
                <p className="text-white/80 text-sm mt-4">
                  Available 24/7 - We're here when you need us most
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Service Plans
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(service.pricing).map(([tier, details]) => (
              <div 
                key={tier}
                className={`rounded-xl p-6 ${
                  tier === 'standard' 
                    ? 'bg-[#ec6d13] border-2 border-[#ec6d13] relative' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {tier === 'standard' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-white text-[#ec6d13] rounded-full font-semibold text-xs">
                      Popular
                    </span>
                  </div>
                )}
                
                <h3 className={`text-xl font-bold capitalize mb-2 ${
                  tier === 'standard' ? 'text-white' : 'text-gray-900'
                }`}>
                  {tier}
                </h3>
                
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${
                    tier === 'standard' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {details.price}
                  </span>
                  <span className={`text-sm ml-2 ${
                    tier === 'standard' ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {details.duration}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {details.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className={`w-5 h-5 flex-shrink-0 ${
                        tier === 'standard' ? 'text-white' : 'text-green-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${
                        tier === 'standard' ? 'text-white' : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/contact"
                  className={`w-full block text-center px-4 py-2 rounded-lg font-semibold transition-colors ${
                    tier === 'standard'
                      ? 'bg-white text-[#ec6d13] hover:bg-gray-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 text-[#ec6d13] hover:text-orange-600 font-medium transition-colors"
            >
              Need a custom plan? Contact us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Schedule your appointment today and give your pet the care they deserve
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#ec6d13] text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              Book Appointment
            </Link>
            <a
              href="tel:+12345656789"
              className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Call: +1 234 565 6789
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
