import Link from 'next/link';
import SectionHeader from '@/components/home/SectionHeader';

const SERVICES = [
  {
    title: 'Pet Grooming',
    description:
      'Professional grooming including bathing, brushing, nail trimming, ear cleaning, and coat styling to keep your pet healthy and comfortable.',
    href: '/services',
    icon: '✂️',
  },
  {
    title: 'Vaccination',
    description:
      'Protect your pets from common diseases with veterinarian-approved vaccination schedules and ongoing health monitoring.',
    href: '/services',
    icon: '💉',
  },
  {
    title: 'Pet Daycare',
    description:
      'Safe, supervised daycare with exercise, socialization, and rest breaks while you are at work.',
    href: '/services',
    icon: '🏠',
  },
  {
    title: 'Dog Training',
    description:
      'Positive reinforcement training for puppies and adult dogs — obedience, leash skills, and behavior improvement.',
    href: '/services',
    icon: '🎓',
  },
  {
    title: 'Pet Adoption',
    description:
      'Guidance on responsible adoption, health checks for new pets, and integration tips for your household.',
    href: '/marketplace',
    icon: '🐕',
  },
  {
    title: 'Pet Sitting',
    description:
      'Trusted in-clinic boarding and sitter referrals so your pets are cared for when you travel.',
    href: '/services',
    icon: '🛋️',
  },
];

export default function HomeServicesGrid() {
  return (
    <section className="bg-gray-50 py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Services We Offer"
          subtitle="Comprehensive care under one roof — from routine wellness to urgent support."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ec6d13]/25 hover:shadow-lg"
            >
              <span className="text-3xl" aria-hidden>
                {s.icon}
              </span>
              <h3 className="mt-4 text-gray-900 group-hover:text-[#ec6d13]">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{s.description}</p>
              <span className="mt-4 text-sm font-semibold text-[#ec6d13]">View service →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
