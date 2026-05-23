'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import SiteLogo from '@/components/layout/SiteLogo';

const RECENT_POSTS = [
  {
    title: '5 signs your dog needs a wellness check',
    excerpt: 'Routine visits catch issues early — appetite, energy, and coat changes matter.',
    href: '/blog',
  },
  {
    title: 'Indoor cat vaccination schedules',
    excerpt: 'Core vaccines and boosters explained for cats that rarely go outside.',
    href: '/blog',
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletter(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  }

  return (
    <footer className="bg-[#2d2d2d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6">
              <SiteLogo href="/" height={100} />
            </div>
            <p className="mb-6 leading-relaxed text-gray-400">
              Carlisle Pet Care provides compassionate veterinary services, grooming, vaccinations,
              and emergency support for dogs, cats, birds, and small animals.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded bg-[#3d3d3d] transition-colors duration-300 hover:bg-[#ec6d13]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded bg-[#ec6d13] transition-colors duration-300 hover:bg-[#d55e0f]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded bg-[#3d3d3d] transition-colors duration-300 hover:bg-[#ec6d13]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold">QUICK LINKS</h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-gray-400 transition-colors duration-300 hover:text-[#ec6d13]"
                  >
                    <span aria-hidden>→</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold">SERVICES</h4>
            <ul className="space-y-3 text-gray-400">
              <li>Pet Grooming</li>
              <li>Vaccination</li>
              <li>Pet Daycare</li>
              <li>Dog Training</li>
              <li>Pet Adoption</li>
              <li>Emergency Care</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold">NEWSLETTER</h4>
            <p className="mb-4 text-sm text-gray-400">
              Subscribe for wellness tips, appointment reminders, and clinic updates.
            </p>
            {subscribed ? (
              <p className="text-sm font-semibold text-[#ec6d13]">Thanks for subscribing!</p>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full rounded border border-gray-600 bg-[#3d3d3d] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#ec6d13] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded bg-[#ec6d13] px-4 py-2.5 text-sm font-bold uppercase transition hover:bg-[#d55e0f]"
                >
                  Subscribe
                </button>
              </form>
            )}

            <h4 className="mb-4 mt-8 text-lg font-bold">CONTACT</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>123 Square Park, Leviton Hills, New York, USA</p>
              <a href="tel:+0123456789" className="block hover:text-[#ec6d13]">
                +01 234 56789
              </a>
              <a href="mailto:info@carlislepetcare.com" className="block text-[#ec6d13] hover:underline">
                info@carlislepetcare.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-gray-700 pt-10 lg:grid-cols-2">
          <div>
            <h4 className="mb-4 text-lg font-bold">RECENT POSTS</h4>
            <div className="space-y-4">
              {RECENT_POSTS.map((post) => (
                <Link key={post.title} href={post.href} className="block group">
                  <h5 className="mb-1 font-medium text-white transition-colors group-hover:text-[#ec6d13]">
                    {post.title}
                  </h5>
                  <p className="text-sm text-gray-400">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Carlisle Pet Care. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact Us' },
];
