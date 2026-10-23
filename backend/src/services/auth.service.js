import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

const createToken = (userId) => jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const invalidRequest = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.code = 11000;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: passwordHash,
  });

  return { token: createToken(user.id), user: toPublicUser(user) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  return { token: createToken(user.id), user: toPublicUser(user) };
};

export const requestPasswordReset = async (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    throw invalidRequest('Email is required');
  }
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail })
    .select('+passwordResetTokenHash +passwordResetExpires');
  const response = {
    email: normalizedEmail,
    message: `Password reset instructions were created for ${normalizedEmail}.`
  };

  if (!user) return response;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  // Email delivery can replace this development-only response when SMTP is configured.
  if (env.nodeEnv !== 'production') response.resetToken = resetToken;
  return response;
};

export const resetPassword = async ({ token, password }) => {
  if (typeof token !== 'string' || !token.trim()) throw invalidRequest('Reset token is required');
  if (typeof password !== 'string' || password.length < 6) {
    throw invalidRequest('New password must be at least 6 characters');
  }
  const user = await User.findOne({
    passwordResetTokenHash: hashResetToken(token),
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) throw invalidRequest('Reset token is invalid or has expired', 400);

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return { message: 'Password updated successfully. You can now sign in.' };
};

export { toPublicUser };
