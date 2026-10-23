import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  toPublicUser
} from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    res.json(await loginUser(req.body));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    res.json(await requestPasswordReset(req.body.email));
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    res.json(await resetPassword(req.body));
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => res.json({ user: toPublicUser(req.user) });
