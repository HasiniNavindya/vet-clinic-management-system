import Link from 'next/link';

export default function EmergencyBanner() {
  return (
    <section className="bg-gradient-to-r from-red-600 to-[#ec6d13] py-8 text-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="flex items-center gap-4 text-center md:text-left">
          <span className="text-4xl" aria-hidden>
            🚑
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/90">24/7 emergency line</p>
            <h2 className="text-white">Need urgent pet care?</h2>
            <p className="mt-1 text-white/90">Call our clinic team for same-day emergency appointments.</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <a href="tel:+0123456789" className="text-lg font-bold hover:underline">
            📞 +01 234 56789
          </a>
          <Link
            href="/login?role=user"
            className="rounded-lg bg-white px-6 py-3 text-sm font-bold uppercase text-[#ec6d13] shadow-lg transition hover:bg-gray-100"
          >
            Emergency appointment
          </Link>
        </div>
      </div>
    </section>
  );
}
