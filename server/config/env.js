require('dotenv').config();

const env = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  dnsServers: (process.env.DNS_SERVERS || '').split(',').map((server) => server.trim()).filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtResetSecret: process.env.JWT_RESET_SECRET || 'dev-reset-secret-change-me',
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER,
};
env.isProd = env.nodeEnv === 'production';

const missing = ['mongoUri', 'jwtSecret', 'jwtRefreshSecret'].filter((k) => !env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env.`);
  process.exit(1);
}
if (!env.geminiKey) console.warn('GEMINI_API_KEY is not set: AI endpoints will return an error.');
if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
  console.warn('SMTP settings are incomplete: configure SMTP_HOST, SMTP_USER, and SMTP_PASS.');
}

module.exports = env;
