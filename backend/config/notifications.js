const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_STATUS: 'appointment_status',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  VACCINATION_ALERT: 'vaccination_alert',
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
