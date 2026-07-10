import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function EmergencyServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
        <div className="absolute inset-0">
          <img
            src="/images/service3.jpg"
            alt="Emergency Service banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/15" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-900/10">
            <p className="text-xs uppercase tracking-[0.35em] text-[#d5422f]">Emergency Service</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Fast, compassionate care when every moment matters.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              Immediate vet support for sudden injuries, serious symptoms, and urgent pet health concerns.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid gap-12 lg:grid-cols-[1fr_0.95fr] items-center">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_60px_rgba(213,66,47,0.16)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#d5422f]">What this service covers</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Rapid emergency response for your pet</h2>
            <p className="mt-5 text-gray-600 leading-8">
              Our team is prepared to evaluate and treat urgent conditions quickly, with a calm and caring approach for both you and your pet.
            </p>
            <ul className="mt-8 space-y-4 text-gray-700">
              <li className="rounded-3xl border border-rose-100 bg-[#fff1f0] p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Immediate triage</h3>
                <p className="mt-2 text-sm leading-6">Fast assessment to determine severity and next steps.</p>
              </li>
              <li className="rounded-3xl border border-rose-100 bg-[#fff1f0] p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Emergency treatment</h3>
                <p className="mt-2 text-sm leading-6">Pain relief, wound care, and urgent medical support.</p>
              </li>
              <li className="rounded-3xl border border-rose-100 bg-[#fff1f0] p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Follow-up support</h3>
                <p className="mt-2 text-sm leading-6">Clear recovery instructions and continued monitoring after your visit.</p>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-slate-900/5 shadow-lg">
            <img
              src="/images/service3.jpg"
              alt="Emergency pet care"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-semibold text-slate-900">When to come in</h3>
            <p className="mt-4 text-gray-600 leading-7">
              If your pet is having trouble breathing, shows severe pain, is bleeding excessively, or has collapsed, seek immediate veterinary care.
            </p>
          </div>
          <div className="rounded-[2rem] bg-[#fff5f3] p-10 shadow-sm border border-rose-100">
            <h3 className="text-2xl font-semibold text-slate-900">What to bring</h3>
            <p className="mt-4 text-gray-600 leading-7">
              Bring any medications, medical records, or notes about symptoms. A familiar blanket or toy can help keep your pet calm.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] bg-[#ffe7e3] p-10 border border-[#d5422f]/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#d5422f]">Need urgent support?</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">We’re here for emergency pet care 24/7</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#d5422f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/40 transition hover:bg-[#b93b32]"
              >
                Contact Us
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-[#d5422f] bg-white px-6 py-3 text-sm font-semibold text-[#d5422f] transition hover:bg-[#ffe3df]"
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
