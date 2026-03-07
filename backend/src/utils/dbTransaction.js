import pool from '../config/db.js';

/**
 * A utility function to execute multiple queries within an ACID-compliant transaction.
 * @param {Function} callback - An async function that receives the database client.
 * @returns The result of the callback.
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start the transaction
    
    // Execute the queries inside the callback
    const result = await callback(client); 
    
    await client.query('COMMIT'); // Save changes if everything is successful
    return result;
    
  } catch (error) {
    await client.query('ROLLBACK'); // Undo all changes if any error occurs
    console.error('Transaction Failed. Rolled back.', error);
    throw error;
    
  } finally {
    client.release(); // Always release the connection back to the pool
  }
};