import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function CareAdvicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
        <div className="absolute inset-0">
          <img
            src="/images/service1.avif"
            alt="Care Advice banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/10" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-900/10">
            <p className="text-xs uppercase tracking-[0.35em] text-[#ec6d13]">Care Advice</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Practical, personalized wellness guidance for every pet.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              Nutrition, routine care, and home wellness support designed to keep your pet thriving through every stage of life.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_60px_rgba(236,109,19,0.12)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#ec6d13]">What you’ll learn</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Guidance rooted in real pet care experience</h2>
            <p className="mt-5 text-gray-600 leading-8">
              Our Care Advice page helps owners understand how food, exercise, preventative medicine, and home environment work together to support long-term health.
            </p>
            <ul className="mt-8 space-y-4 text-gray-700">
              <li className="rounded-3xl border border-orange-100 bg-[#fff4e6] p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Customized nutrition plans</h3>
                <p className="mt-2 text-sm leading-6">A diet strategy matched to breed, age, weight, and medical history.</p>
              </li>
              <li className="rounded-3xl border border-orange-100 bg-[#fff4e6] p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Preventative wellness</h3>
                <p className="mt-2 text-sm leading-6">Routine checkups, vaccinations, and screenings to prevent issues before they start.</p>
              </li>
              <li className="rounded-3xl border border-orange-100 bg-[#fff4e6] p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Home care tips</h3>
                <p className="mt-2 text-sm leading-6">Practical advice for grooming, exercise, stress reduction, and pet comfort.</p>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-slate-900/5 shadow-lg">
            <img
              src="/images/service1.avif"
              alt="Pet care advice"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-[#fef5ed] p-10 shadow-sm border border-orange-100">
            <h3 className="text-2xl font-semibold text-slate-900">Why care advice matters</h3>
            <p className="mt-4 text-gray-600 leading-7">
              Small changes at home can lead to stronger immunity, fewer illnesses, and a happier pet. We help you turn everyday routines into positive wellbeing habits.
            </p>
          </div>
          <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-semibold text-slate-900">How it works</h3>
            <p className="mt-4 text-gray-600 leading-7">
              Start with a consultation, share your pet's history, and receive a clear care plan with checklists, food guidance, and follow-up support.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] bg-[#ec6d13]/5 p-10 border border-[#ec6d13]/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#ec6d13]">Need a plan?</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">Create a wellness plan for your pet today</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#ec6d13] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/40 transition hover:bg-[#d35c12]"
              >
                Contact our team
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-[#ec6d13] bg-white px-6 py-3 text-sm font-semibold text-[#ec6d13] transition hover:bg-[#fff3df]"
              >
                Back to Services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
