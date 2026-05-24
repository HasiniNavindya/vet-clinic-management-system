'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  AppointmentFeedback,
  fetchAppointmentFeedback,
  submitAppointmentFeedback,
} from '@/lib/feedback';

type Props = {
  token: string;
  appointmentId: number;
};

export default function AppointmentFeedbackForm({ token, appointmentId }: Props) {
  const [existing, setExisting] = useState<AppointmentFeedback | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointmentFeedback(token, appointmentId).then((res) => {
      if (res.ok && res.data.feedback) {
        setExisting(res.data.feedback);
        setRating(res.data.feedback.rating);
        setComment(res.data.feedback.comment || '');
      }
      setLoading(false);
    });
  }, [token, appointmentId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const res = await submitAppointmentFeedback(token, {
      appointmentId,
      rating,
      comment: comment.trim() || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Could not submit feedback');
      return;
    }
    setExisting(res.data.feedback);
    setSuccess('Thank you — your rating helps us improve care for all pets.');
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
        Loading feedback…
      </div>
    );
  }

  if (existing) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-900">Your feedback</p>
        <p className="mt-2 text-[#ec6d13]" aria-label={`${existing.rating} out of 5 stars`}>
          {'★'.repeat(existing.rating)}
          <span className="text-gray-300">{'★'.repeat(5 - existing.rating)}</span>
        </p>
        {existing.comment ? <p className="mt-2 text-sm text-green-900">{existing.comment}</p> : null}
        {success ? <p className="mt-2 text-sm text-green-800">{success}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">Rate your visit</h3>
      <p className="mt-1 text-sm text-gray-600">
        How was your experience? Your rating updates our client satisfaction score on the homepage.
      </p>
      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition ${star <= rating ? 'text-[#ec6d13]' : 'text-gray-300'}`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comments…"
        rows={3}
        className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 rounded-lg bg-[#ec6d13] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
      >
        {busy ? 'Submitting…' : 'Submit feedback'}
      </button>
    </form>
  );
}
