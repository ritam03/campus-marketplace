import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository.js';
import pool from '../config/db.js';
import AppError from '../utils/AppError.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const registerUser = async (data) => {
  // Check if user already exists
  const existingUser = await userRepo.getUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Create User
  const newUser = await userRepo.createUser(data.name, data.email, passwordHash);

  // Generate JWT
  const token = generateToken(newUser.id);
  return { user: newUser, token };
};

export const loginUser = async (data) => {
  // Find User
  const user = await userRepo.getUserByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Protect against missing password_hash
  if (!user.password_hash) {
    throw new AppError('Invalid account configuration', 401);
  }

  // Verify Password
  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate JWT
  const token = generateToken(user.id);

  // Remove password hash from response
  delete user.password_hash;
  
  return { user, token };
};

export const updateUserProfile = async (userId, data) => {
  const { name } = data;
  
  const result = await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
    [name, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
};
