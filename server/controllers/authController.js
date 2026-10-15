const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const t = require('../utils/tokens');
const { sendPasswordResetEmail } = require('../services/emailService');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, createdAt: u.createdAt });

const issue = async (res, user) => {
  const access = t.signAccess(user._id.toString());
  const refresh = t.signRefresh(user._id.toString());
  await User.updateOne({ _id: user._id }, { refreshTokenHash: t.hash(refresh) });
  t.setAuthCookies(res, access, refresh);
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email: email.toLowerCase() })) throw new AppError('An account with this email already exists.', 409);
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  await issue(res, user);
  ok(res, publicUser(user), 'Account created', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) throw new AppError('Incorrect email or password.', 401);
  await issue(res, user);
  ok(res, publicUser(user), 'Signed in');
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Please sign in again.', 401);
  let payload;
  try { payload = t.verifyRefresh(token); } catch { throw new AppError('Please sign in again.', 401); }
  const user = await User.findById(payload.id).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== t.hash(token)) throw new AppError('Please sign in again.', 401);
  await issue(res, user); // rotate
  ok(res, publicUser(user), 'Session refreshed');
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try { await User.updateOne({ _id: t.verifyRefresh(token).id }, { $unset: { refreshTokenHash: 1 } }); } catch { /* ignore */ }
  }
  t.clearAuthCookies(res);
  ok(res, null, 'Signed out');
});

exports.me = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError('Please sign in again.', 401);
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('Account not found.', 404);
  ok(res, publicUser(user));
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    return ok(res, null, 'If an account exists, a reset link has been sent.');
  }

  const token = t.signReset(user._id.toString());
  user.resetTokenHash = t.hash(token);
  user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    token,
    resetUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${encodeURIComponent(token)}`,
  });

  ok(res, null, 'If an account exists, a reset link has been sent.');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token) throw new AppError('Reset token is missing.', 400);

  let payload;
  try {
    payload = t.verifyReset(token);
  } catch {
    throw new AppError('This reset link is invalid or expired.', 400);
  }

  const user = await User.findById(payload.id).select('+resetTokenHash +resetTokenExpiresAt');
  if (!user) throw new AppError('This reset link is invalid or expired.', 400);
  if (!user.resetTokenHash || !user.resetTokenExpiresAt) throw new AppError('This reset link is invalid or expired.', 400);
  if (new Date(user.resetTokenExpiresAt).getTime() < Date.now()) throw new AppError('This reset link is invalid or expired.', 400);
  if (user.resetTokenHash !== t.hash(token)) throw new AppError('This reset link is invalid or expired.', 400);

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  await issue(res, user);
  ok(res, publicUser(user), 'Password reset successful.');
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { name: req.body.name }, { new: true });
  ok(res, publicUser(user), 'Profile updated');
});
