'use client';

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
          alt="Pet care blog"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-white sm:mb-6">Pet Care Blog</h1>
          <p className="mx-auto max-w-3xl px-2 text-base text-white/90 sm:text-xl">
            Expert advice, tips, and stories to help you give your pets the best care every day.
          </p>
        </div>
      </div>
    </section>
  );
}
