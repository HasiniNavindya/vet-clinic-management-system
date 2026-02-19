'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 - Create Account
  const [step1Data, setStep1Data] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Step 2 - Account Details, Pet Owner Profile, Pet Information
  const [step2Data, setStep2Data] = useState({
    fullName: '',
    emailAddress: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    emergencyContact: '',
    petName: '',
    species: '',
    breed: '',
    ageOrDob: '',
    gender: '',
    vaccinationStatus: ''
  });

  // Step 3 - Notification Preferences
  const [step3Data, setStep3Data] = useState({
    vaccinationReminders: true,
    appointmentUpdates: true
  });

  const handleStep1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStep1Data({ ...step1Data, [e.target.name]: e.target.value });
  };

  const handleStep2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStep2Data({ ...step2Data, [e.target.name]: e.target.value });
  };

  const handleStep3Toggle = (field: 'vaccinationReminders' | 'appointmentUpdates') => {
    setStep3Data({ ...step3Data, [field]: !step3Data[field] });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Registration data:', { step1Data, step2Data, step3Data });
      setIsLoading(false);
      // Redirect to login or dashboard
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-600">Step {currentStep} of 3</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step <= currentStep ? 'bg-[#ec6d13]' : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Create your account */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create your account
                  </h1>
                  <p className="text-gray-600">
                    Let's get you started with your VetCare account.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={step1Data.email}
                      onChange={handleStep1Change}
                      className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={step1Data.password}
                      onChange={handleStep1Change}
                      className="block w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                      placeholder="Enter a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={step1Data.confirmPassword}
                      onChange={handleStep1Change}
                      className="block w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-[#ec6d13] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Account & Continue
                </button>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link href="/" className="text-[#ec6d13] hover:text-[#d65e0f] font-semibold transition-colors duration-200">
                      Log in
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Welcome to PetCare Clinic */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to PetCare Clinic
                  </h1>
                  <p className="text-gray-600">
                    Let's get you and your pet set up. Complete the details below to get started.
                  </p>
                </div>

                {/* Account Details Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-[#ec6d13] text-white p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name
                      </label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        value={step2Data.fullName}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Address
                      </label>
                      <input
                        name="emailAddress"
                        type="email"
                        required
                        value={step2Data.emailAddress}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mobile Number
                      </label>
                      <input
                        name="mobileNumber"
                        type="tel"
                        required
                        value={step2Data.mobileNumber}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          required
                          value={step2Data.password}
                          onChange={handleStep2Change}
                          className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Confirm Password
                        </label>
                        <input
                          name="confirmPassword"
                          type="password"
                          required
                          value={step2Data.confirmPassword}
                          onChange={handleStep2Change}
                          className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pet Owner Profile Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-[#ec6d13] text-white p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Pet Owner Profile</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Address
                      </label>
                      <input
                        name="address"
                        type="text"
                        required
                        value={step2Data.address}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="123 Main St, Anytown, USA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Emergency Contact (Optional)
                      </label>
                      <input
                        name="emergencyContact"
                        type="text"
                        value={step2Data.emergencyContact}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="Name and Phone Number"
                      />
                    </div>
                  </div>
                </div>

                {/* Pet Information Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-[#ec6d13] text-white p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Pet Information</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Pet's Name
                      </label>
                      <input
                        name="petName"
                        type="text"
                        required
                        value={step2Data.petName}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Buddy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Species
                      </label>
                      <select
                        name="species"
                        required
                        value={step2Data.species}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select species</option>
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="bird">Bird</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="hamster">Hamster</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Breed
                      </label>
                      <input
                        name="breed"
                        type="text"
                        required
                        value={step2Data.breed}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Golden Retriever"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Age / Date of Birth
                      </label>
                      <input
                        name="ageOrDob"
                        type="text"
                        required
                        value={step2Data.ageOrDob}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                        placeholder="MM/DD/YYYY or years"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        required
                        value={step2Data.gender}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Vaccination Status
                      </label>
                      <select
                        name="vaccinationStatus"
                        required
                        value={step2Data.vaccinationStatus}
                        onChange={handleStep2Change}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select status</option>
                        <option value="up-to-date">Up to Date</option>
                        <option value="due-soon">Due Soon</option>
                        <option value="overdue">Overdue</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Complete Registration Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-[#ec6d13] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Complete Registration
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 3: Notification Preferences */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Notification Preferences
                  </h1>
                  <p className="text-gray-600">
                    Stay informed about your pet's health. Choose how you'd like to receive important updates.
                  </p>
                </div>

                {/* Notification Options */}
                <div className="space-y-4">
                  {/* Vaccination Reminders */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:border-[#ec6d13] transition-colors duration-200">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Vaccination Reminders
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Receive alerts when your pet's vaccinations are due.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStep3Toggle('vaccinationReminders')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2 ${
                        step3Data.vaccinationReminders ? 'bg-[#ec6d13]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                          step3Data.vaccinationReminders ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Appointment Updates */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:border-[#ec6d13] transition-colors duration-200">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Appointment Updates
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Get notified about upcoming appointments, changes, or cancellations.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStep3Toggle('appointmentUpdates')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2 ${
                        step3Data.appointmentUpdates ? 'bg-[#ec6d13]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                          step3Data.appointmentUpdates ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#ec6d13] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Finish'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Back Button for Step 2 */}
          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              Back
            </button>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
