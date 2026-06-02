'use client';

import { useEffect, useState } from 'react';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import { useAuth } from '@/context/AuthContext';
import { fetchMyShopOrders, formatMoney, type MyShopOrder } from '@/lib/payments';

export default function PetOwnerOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<MyShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchMyShopOrders(token).then((res) => {
      if (res.ok) setOrders(res.data.orders);
      setLoading(false);
    });
  }, [token]);

  return (
    <PetOwnerShell>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My shop orders</h1>
        <p className="mt-1 text-sm text-gray-600">Track fulfillment and delivery status</p>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <p className="mt-6 text-gray-500">No orders yet. Browse the marketplace shop tab.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold text-gray-900">Order #{o.id}</span>
                  <span className="text-sm capitalize text-[#ec6d13]">{o.fulfillmentStatus}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatMoney(o.totalCents)} · Payment: {o.paymentStatus}
                </p>
                <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                {o.trackingNote ? (
                  <p className="mt-2 text-sm text-gray-700">{o.trackingNote}</p>
                ) : null}
                {o.items?.length ? (
                  <ul className="mt-3 text-sm text-gray-600">
                    {o.items.map((item, i) => (
                      <li key={i}>
                        {item.productName || 'Item'} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PetOwnerShell>
  );
}
