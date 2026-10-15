const nodemailer = require('nodemailer');
const env = require('../config/env');

const transport = env.smtpHost && env.smtpUser && env.smtpPass
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort || 587,
      secure: Number(env.smtpPort || 587) === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

exports.sendPasswordResetEmail = async ({ to, name, token, resetUrl }) => {
  const baseUrl = resetUrl || `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Reset your HireRead password';
  const text = `Hi ${name || 'there'},\n\nWe received a request to reset your HireRead password.\n\nOpen this link to continue: ${baseUrl}\n\nIf you did not request this, you can ignore this email.\n`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Password reset request</h2>
      <p>Hi ${name || 'there'},</p>
      <p>We received a request to reset your HireRead password.</p>
      <p>
        <a href="${baseUrl}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none;">
          Reset your password
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p>${baseUrl}</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  if (!transport) throw new Error('Configure SMTP_HOST, SMTP_USER, and SMTP_PASS to send email.');

  await transport.sendMail({
    from: env.smtpFrom || env.smtpUser,
    to,
    subject,
    text,
    html,
  });
};
