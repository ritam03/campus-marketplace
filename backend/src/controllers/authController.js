import bcrypt from 'bcrypt'; // Using bcryptjs to prevent C++ build crashes
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import pool from '../config/db.js'; // Needed for the updateProfile function
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userId) => {
  // Safe fallbacks to prevent 500 crashes if .env is missing variables
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const register = async (req, res) => {
  try {
    // 1. Validate Input
    const validatedData = registerSchema.parse(req.body);

    // 2. Check if user already exists
    const existingUser = await userRepo.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already in use' });
    }

    // 3. Hash Password (Cost factor 10 is standard for production)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // 4. Create User
    const newUser = await userRepo.createUser(validatedData.name, validatedData.email, passwordHash);

    // 5. Generate JWT
    const token = generateToken(newUser.id);

    res.status(201).json({
      status: 'success',
      token, // Token is placed here in your original code
      data: { user: newUser }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message });
    }
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // 1. Find User
    const user = await userRepo.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Protect against missing password_hash
    if (!user.password_hash) {
      return res.status(401).json({ status: 'error', message: 'Invalid account configuration' });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = generateToken(user.id);

    // Remove password hash from response
    delete user.password_hash;

    res.status(200).json({
      status: 'success',
      token, // Token is placed here in your original code
      data: { user }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message });
    }
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Profile updater for the Settings page
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
      [name, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: { user: result.rows[0] } });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
};