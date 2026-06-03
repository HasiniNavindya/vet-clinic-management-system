'use client';

import {
  FULFILLMENT_STEPS,
  fulfillmentStatusLabel,
  fulfillmentStepIndex,
} from '@/lib/shopFulfillment';

export default function FulfillmentProgress({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-800">
        Order cancelled
      </div>
    );
  }

  const current = fulfillmentStepIndex(status);
  const pct = current <= 0 ? 8 : ((current + 1) / FULFILLMENT_STEPS.length) * 100;

  return (
    <div className="w-full min-w-[240px]">
      <div className="mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {FULFILLMENT_STEPS.map((step, i) => (
          <span
            key={step.id}
            className={i <= current ? 'text-[#ec6d13]' : 'text-gray-400'}
          >
            {step.label}
          </span>
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ec6d13] to-[#f59e0b] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-600">
        Current:{' '}
        <span className="font-semibold capitalize text-gray-900">
          {fulfillmentStatusLabel(status)}
        </span>
      </p>
    </div>
  );
}
