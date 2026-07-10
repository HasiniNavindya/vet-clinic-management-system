import Image from 'next/image';
import ServiceOfferIcon, { type IconName } from '@/components/services/ServiceOfferIcon';

type OfferedService = {
  title: string;
  description: string;
  icon: IconName;
  align: 'left' | 'right';
};

const SERVICES: OfferedService[] = [
  {
    title: 'Pet Adoption',
    description: 'Find your perfect companion from our selection of loving pets waiting for a forever home.',
    icon: 'adoption',
    align: 'right',
  },
  {
    title: 'Vaccination',
    description: 'Essential vaccinations to protect your pet from serious diseases and maintain optimal health.',
    icon: 'vaccination',
    align: 'left',
  },
  {
    title: 'Pet Grooming',
    description: 'Professional grooming services to keep your pet looking and feeling their absolute best.',
    icon: 'grooming',
    align: 'right',
  },
  {
    title: 'Dog Training',
    description: 'Expert training programs to help your dog develop good behavior and social skills.',
    icon: 'training',
    align: 'left',
  },
  {
    title: 'Pet Daycare',
    description: 'Safe and engaging daycare services where your pet can play, socialize, and be cared for.',
    icon: 'daycare',
    align: 'right',
  },
  {
    title: 'Pet Sitter',
    description: 'Reliable pet sitting services providing loving care for your pet while you are away.',
    icon: 'pet-sitting',
    align: 'left',
  },
];

function ServiceCard({ service }: { service: OfferedService }) {
  const isRight = service.align === 'right';

  return (
    <div className={`flex items-start gap-4 ${isRight ? 'flex-row-reverse text-right' : ''}`}>
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white shadow-sm">
        <ServiceOfferIcon name={service.icon} className="h-7 w-7 text-[#ec6d13]" />
      </div>
      <div className="max-w-[16rem]">
        <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">{service.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{service.description}</p>
      </div>
    </div>
  );
}

export default function ServicesOfferLayout() {
  const leftServices = SERVICES.filter((service) => service.align === 'right');
  const rightServices = SERVICES.filter((service) => service.align === 'left');

  return (
    <section className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-12">
          <div className="space-y-12">
            {leftServices.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>

          <div className="order-first flex justify-center lg:order-0">
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-4xl bg-[#f8f8f8] shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <div className="absolute inset-0 bg-linear-to-b from-white/0 via-white/10 to-white/20" />
              <Image
                src="/images/services/center-dogs-group.png"
                alt="Group of happy dogs"
                width={900}
                height={700}
                className="h-auto w-full object-cover"
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
              />
            </div>
          </div>

          <div className="space-y-12">
            {rightServices.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
