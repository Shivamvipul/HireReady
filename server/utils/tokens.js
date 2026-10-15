const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const base = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
});

exports.signAccess = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: '15m' });
exports.signRefresh = (id) => jwt.sign({ id }, env.jwtRefreshSecret, { expiresIn: '7d' });
exports.signReset = (id) => jwt.sign({ id, purpose: 'reset-password' }, env.jwtResetSecret, { expiresIn: '1h' });
exports.verifyAccess = (t) => jwt.verify(t, env.jwtSecret);
exports.verifyRefresh = (t) => jwt.verify(t, env.jwtRefreshSecret);
exports.verifyReset = (t) => jwt.verify(t, env.jwtResetSecret);
exports.hash = (t) => crypto.createHash('sha256').update(t).digest('hex');

exports.setAuthCookies = (res, access, refresh) => {
  res.cookie('accessToken', access, { ...base(), maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refresh, { ...base(), maxAge: 7 * 24 * 60 * 60 * 1000 });
};
exports.clearAuthCookies = (res) => {
  res.clearCookie('accessToken', base());
  res.clearCookie('refreshToken', base());
};
