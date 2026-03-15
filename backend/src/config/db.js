import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires SSL for external connections
  ssl: {
    rejectUnauthorized: false,
  },
  // Production-level pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  
  // 🌟 THE FIX: Increased to 10 seconds to allow Neon to wake up from sleep!
  connectionTimeoutMillis: 30000, 
});

export default pool;