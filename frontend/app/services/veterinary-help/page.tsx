import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function VeterinaryHelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
        <div className="absolute inset-0">
          <img
            src="/images/service2.jpg"
            alt="Veterinary Help banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/15" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-900/10">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-600">Veterinary Help</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Trusted medical care from our expert veterinary team.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              A full range of diagnostics, consultations, and personalized treatment plans for your pet’s health journey.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid gap-12 lg:grid-cols-[0.95fr_1fr] items-center">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-600">What this includes</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Complete care for every veterinary need</h2>
            <p className="mt-5 text-gray-600 leading-8">
              With advanced diagnostics and compassionate consultations, we help pets recover faster and stay healthier long term.
            </p>
            <ul className="mt-8 space-y-4 text-gray-700">
              <li className="rounded-3xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Doctor consultations</h3>
                <p className="mt-2 text-sm leading-6">Expert reviews, follow-up plans, and medical advice tailored to your pet.</p>
              </li>
              <li className="rounded-3xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Diagnostic testing</h3>
                <p className="mt-2 text-sm leading-6">Bloodwork, imaging, and lab tests to accurately diagnose health concerns.</p>
              </li>
              <li className="rounded-3xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Treatment planning</h3>
                <p className="mt-2 text-sm leading-6">Clear care paths that include medication, therapy, and recovery support.</p>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-slate-900/5 shadow-lg">
            <img
              src="/images/service2.jpg"
              alt="Veterinary team caring for a cat"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-semibold text-slate-900">Your pet’s health roadmap</h3>
            <p className="mt-4 text-gray-600 leading-7">
              We map each visit to clear next steps so you always know what to expect and how to keep your pet moving toward better health.
            </p>
          </div>
          <div className="rounded-[2rem] bg-[#eff8ff] p-10 shadow-sm border border-sky-100">
            <h3 className="text-2xl font-semibold text-slate-900">Support at every stage</h3>
            <p className="mt-4 text-gray-600 leading-7">
              From preventive care to chronic condition management, our doctors are here to address your pet’s needs with compassion.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-950/5 p-10 border border-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Need an appointment?</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">Book a veterinary consultation today</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200/40 transition hover:bg-sky-700"
              >
                Contact our team
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-sky-600 bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
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
