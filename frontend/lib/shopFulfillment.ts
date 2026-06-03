export const FULFILLMENT_STEPS = [
  { id: 'unfulfilled', label: 'Received' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
] as const;

export function fulfillmentStepIndex(status: string) {
  if (status === 'cancelled') return -1;
  const idx = FULFILLMENT_STEPS.findIndex((s) => s.id === status);
  return idx >= 0 ? idx : 0;
}

export function fulfillmentStatusLabel(status: string) {
  const step = FULFILLMENT_STEPS.find((s) => s.id === status);
  if (step) return step.label;
  if (status === 'cancelled') return 'Cancelled';
  return status.replace(/_/g, ' ');
}
