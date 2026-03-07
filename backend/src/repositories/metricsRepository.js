import pool from '../config/db.js';

export const getLiveMetrics = async () => {
  // We count how many listings have the status 'Sold'
  const result = await pool.query("SELECT COUNT(*) FROM listings WHERE status = 'Sold'");
  return {
    totalSold: parseInt(result.rows[0].count, 10)
  };
};