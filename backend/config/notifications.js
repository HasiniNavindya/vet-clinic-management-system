const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_STATUS: 'appointment_status',
  DOCTOR_APPOINTMENT_ASSIGNED: 'doctor_appointment_assigned',
  CONSULTATION_BILLING_READY: 'consultation_billing_ready',
  CONSULTATION_RECORD_ADDED: 'consultation_record_added',
  VISIT_CHARGES_READY: 'visit_charges_ready',
  VISIT_PAYMENT_RECORDED: 'visit_payment_recorded',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  VACCINATION_ALERT: 'vaccination_alert',
  INVENTORY_RESTOCK: 'inventory_restock',
  SHOP_ORDER_UPDATE: 'shop_order_update',
  ANNOUNCEMENT: 'announcement',
};

const APPOINTMENT_REMINDER_HOURS_BEFORE = Number(process.env.APPOINTMENT_REMINDER_HOURS_BEFORE || 24);

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

module.exports = {
  NOTIFICATION_TYPES,
  APPOINTMENT_REMINDER_HOURS_BEFORE,
  isEmailConfigured,
};
