import pool from '../config/db.js';

export const findOrCreateCampus = async (name) => {
  // Try to find it first (case insensitive)
  const existing = await pool.query('SELECT * FROM campuses WHERE name ILIKE $1', [name]);
  if (existing.rows.length > 0) return existing.rows[0];

  // If not found, insert it as unverified
  const result = await pool.query(
    'INSERT INTO campuses (name, is_verified) VALUES ($1, false) RETURNING *',
    [name]
  );
  return result.rows[0];
};