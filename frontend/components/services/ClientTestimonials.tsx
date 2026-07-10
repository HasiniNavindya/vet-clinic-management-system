'use client';

import { useEffect, useState } from 'react';
import { fetchApprovedFeedback, PublicFeedback } from '@/lib/feedback';

function renderStars(rating: number) {
  return [...Array(5)].map((_, index) => (
    <svg
      key={index}
      viewBox="0 0 20 20"
      className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-200'} fill-current`}
      aria-hidden="true"
    >
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
  ));
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ClientTestimonials() {
  const [reviews, setReviews] = useState<PublicFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovedFeedback()
      .then((res) => {
        if (!res.ok) {
          setError('Unable to load the latest reviews.');
          return;
        }
        setReviews(res.data.feedback || []);
      })
      .catch(() => {
        setError('Unable to load the latest reviews.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 text-lg">
            Real experiences from pet owners who trust us with their care and expertise.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((placeholder) => (
              <div key={placeholder} className="animate-pulse rounded-2xl bg-white p-8 shadow-lg">
                <div className="h-5 w-32 mb-4 rounded bg-gray-200" />
                <div className="h-24 mb-6 rounded bg-gray-200" />
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
            <p className="text-gray-700">{error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
            <p className="text-gray-700">No approved reviews are available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  <span className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  {review.comment || 'Great experience with the clinic and team.'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ec6d13] text-sm font-semibold text-white">
                    {getInitials(review.userName)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <p className="text-sm text-gray-500">
                      {review.petName ? `${review.petName} owner` : 'Pet owner'}
                      {review.doctorName ? ` · Dr. ${review.doctorName}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
