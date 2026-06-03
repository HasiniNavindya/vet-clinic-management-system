import { apiFetch, authHeaders } from './api';

export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_status'
  | 'doctor_appointment_assigned'
  | 'consultation_billing_ready'
  | 'consultation_record_added'
  | 'visit_charges_ready'
  | 'visit_payment_recorded'
  | 'payment_confirmation'
  | 'vaccination_alert'
  | 'inventory_restock'
  | 'shop_order_update'
  | 'announcement';

export type AppNotification = {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  linkPath?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
};

/** Pet owner: refresh vaccination due alerts (safe to call when opening notifications). */
export function syncMyReminders(token: string) {
  return apiFetch<{ ok: boolean; reminders?: number }>('/api/notifications/sync-my-reminders', {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export function fetchNotifications(token: string, unreadOnly = false) {
  const q = unreadOnly ? '?unread=true' : '';
  return apiFetch<AppNotification[]>(`/api/notifications${q}`, {
    headers: authHeaders(token),
  });
}

export function fetchUnreadCount(token: string) {
  return apiFetch<{ count: number }>('/api/notifications/unread-count', {
    headers: authHeaders(token),
  });
}

export function markNotificationRead(token: string, id: number) {
  return apiFetch<AppNotification>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export function markAllNotificationsRead(token: string) {
  return apiFetch<{ ok: boolean }>('/api/notifications/read-all', {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export function notificationTypeLabel(type: NotificationType) {
  const labels: Record<NotificationType, string> = {
    appointment_reminder: 'Appointment reminder',
    appointment_confirmed: 'Appointment confirmed',
    appointment_status: 'Appointment update',
    doctor_appointment_assigned: 'Assigned visit',
    consultation_billing_ready: 'Billing',
    consultation_record_added: 'Consultation record',
    visit_charges_ready: 'Visit charges',
    visit_payment_recorded: 'Visit payment',
    payment_confirmation: 'Payment',
    vaccination_alert: 'Vaccination',
    inventory_restock: 'Restock needed',
    shop_order_update: 'Shop order',
    announcement: 'Announcement',
  };
  return labels[type] || type;
}

export function formatNotificationTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString();
}
