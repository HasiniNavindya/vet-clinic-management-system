'use client';

import { useState, type ReactNode } from 'react';
import OrdersTab from './OrdersTab';
import InventoryTab from './InventoryTab';

type Tab = 'orders' | 'inventory';

export default function ReceptionistShopHub() {
  const [tab, setTab] = useState<Tab>('orders');

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-gray-900">
            Shop & inventory
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track order fulfillment and marketplace stock levels.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>
          Orders
        </TabButton>
        <TabButton active={tab === 'inventory'} onClick={() => setTab('inventory')}>
          Inventory management
        </TabButton>
      </div>

      <div className="mt-6">{tab === 'orders' ? <OrdersTab /> : <InventoryTab />}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? 'border-[#ec6d13] text-[#ec6d13]'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}
