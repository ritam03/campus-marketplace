import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.registerUser(validatedData);

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    status: 'success',
    token: accessToken, 
    data: { user }
  });
});

export const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginUser(validatedData);

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    token: accessToken, 
    data: { user }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const tokens = await authService.refreshAccessToken(refreshToken);

  setRefreshCookie(res, tokens.refreshToken);

  res.status(200).json({
    status: 'success',
    token: tokens.accessToken
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateUserProfile(req.user.id, req.body);
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});