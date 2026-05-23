import SectionHeader from '@/components/home/SectionHeader';

const REVIEWS = [
  {
    quote: 'The doctors treated Bella like family. Clear explanations and a calm, clean clinic.',
    name: 'Sarah W.',
    pet: 'Golden Retriever owner',
    stars: 5,
  },
  {
    quote: 'We booked a same-day emergency visit and they were professional from start to finish.',
    name: 'James M.',
    pet: 'Tabby cat owner',
    stars: 5,
  },
  {
    quote: 'Vaccination reminders and online booking made managing our rabbit’s care so much easier.',
    name: 'Priya K.',
    pet: 'Rabbit owner',
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="What Pet Parents Say" subtitle="Trusted by families across the community." />
        <div className="grid gap-8 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <blockquote
              key={r.name}
              className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm"
            >
              <p className="text-[#ec6d13]" aria-label={`${r.stars} out of 5 stars`}>
                {'★'.repeat(r.stars)}
                <span className="text-gray-300">{'★'.repeat(5 - r.stars)}</span>
              </p>
              <p className="mt-4 flex-1 text-gray-700 leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
              <footer className="mt-6 border-t border-gray-200 pt-4">
                <cite className="not-italic font-bold text-gray-900">{r.name}</cite>
                <p className="text-sm text-gray-500">{r.pet}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
