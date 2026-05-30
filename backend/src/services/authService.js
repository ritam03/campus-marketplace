import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository.js';
import pool from '../config/db.js';
import AppError from '../utils/AppError.js';
import dotenv from 'dotenv';

dotenv.config();

const generateTokens = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
  
  // Access token: 15 minutes
  const accessToken = jwt.sign({ id: userId }, secret, { expiresIn: '15m' });
  // Refresh token: 7 days
  const refreshToken = jwt.sign({ id: userId }, refreshSecret, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

export const registerUser = async (data) => {
  const existingUser = await userRepo.getUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newUser = await userRepo.createUser(data.name, data.email, passwordHash);

  const tokens = generateTokens(newUser.id);
  return { user: newUser, ...tokens };
};

export const loginUser = async (data) => {
  const user = await userRepo.getUserByEmail(data.email);
  if (!user || !user.password_hash) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokens = generateTokens(user.id);
  delete user.password_hash;
  
  return { user, ...tokens };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new AppError('No refresh token provided', 401);

  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
  
  try {
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const tokens = generateTokens(decoded.id);
    return tokens;
  } catch (error) {
    throw new AppError('Invalid refresh token', 403);
  }
};

export const updateUserProfile = async (userId, data) => {
  const { name } = data;
  const result = await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
    [name, userId]
  );
  if (result.rowCount === 0) throw new AppError('User not found', 404);
  return result.rows[0];
};
