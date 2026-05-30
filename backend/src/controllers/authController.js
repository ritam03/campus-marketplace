import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

export const register = asyncHandler(async (req, res) => {
  // Validate Input
  const validatedData = registerSchema.parse(req.body);
  
  const { user, token } = await authService.registerUser(validatedData);

  res.status(201).json({
    status: 'success',
    token, 
    data: { user }
  });
});

export const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  const { user, token } = await authService.loginUser(validatedData);

  res.status(200).json({
    status: 'success',
    token, 
    data: { user }
  });
});

// Profile updater for the Settings page
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateUserProfile(req.user.id, req.body);
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});