import Image from 'next/image';
import type { IconName } from '@/components/services/ServiceOfferIcon';

type OfferedService = {
  title: string;
  description: string;
  icon: IconName;
};

const LEFT_SERVICES: OfferedService[] = [
  {
    title: 'PET ADOPTION',
    description:
      'Find your perfect companion from our selection of loving pets waiting for their forever home.',
    icon: 'adoption',
  },
  {
    title: 'PET GROOMING',
    description:
      'Professional grooming services to keep your pet looking and feeling their absolute best.',
    icon: 'grooming',
  },
  {
    title: 'PET DAYCARE',
    description:
      'Safe and engaging daycare services where your pet can play, socialize, and be cared for.',
    icon: 'daycare',
  },
];

const RIGHT_SERVICES: OfferedService[] = [
  {
    title: 'VACCINATION',
    description:
      'Essential vaccinations to protect your pet from serious diseases and maintain optimal health.',
    icon: 'vaccination',
  },
  {
    title: 'DOG TRAINING',
    description:
      'Expert training programs to help your dog develop good behavior and social skills.',
    icon: 'training',
  },
  {
    title: 'PET SITTER',
    description:
      'Reliable pet sitting services providing loving care for your pet while you are away.',
    icon: 'pet-sitting',
  },
];

function IconBadge({ icon }: { icon: IconName }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-white">
      <Image
        src={`/images/services/icons/${icon}.png`}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
    </div>
  );
}

function ServiceRow({
  service,
  align,
}: {
  service: OfferedService;
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';

  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg ${
        isRight ? 'text-right' : 'text-left'
      }`}
    >
      <div className={`flex items-start gap-4 ${isRight ? 'flex-row-reverse' : ''}`}>
        <IconBadge icon={service.icon} />
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 mb-2">{service.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ServicesOfferLayout() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-10">
            {LEFT_SERVICES.map((service) => (
              <ServiceRow key={service.title} service={service} align="right" />
            ))}
          </div>

          <div className="flex items-center justify-center bg-white">
            <div className="relative w-full max-w-[360px]">
              <Image
                src="/images/services/center-dogs-group.png"
                alt="Group of happy dogs"
                width={720}
                height={540}
                className="h-auto w-full object-contain"
                priority
                sizes="(max-width: 1024px) 90vw, 360px"
              />
            </div>
          </div>

          <div className="space-y-10">
            {RIGHT_SERVICES.map((service) => (
              <ServiceRow key={service.title} service={service} align="left" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
