const nodemailer = require('nodemailer');
const { isEmailConfigured } = require('../config/notifications');

let transporter = null;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const fromName = process.env.EMAIL_FROM_NAME || 'Carlisle Pet Care';
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!to) {
    return { ok: false, error: 'Recipient email required' };
  }

  const mail = {
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[email demo]', { to, subject, text });
    return { ok: true, demo: true };
  }

  try {
    const info = await transport.sendMail(mail);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendEmail, isEmailConfigured };
