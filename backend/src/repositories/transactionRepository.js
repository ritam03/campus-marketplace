import pool from '../config/db.js';

export const createTransaction = async (listingId, sellerId, buyerId, otp) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start ACID Transaction
    
    // 1. Lock the listing and mark as Reserved
    const listingRes = await client.query(
      "UPDATE listings SET status = 'Reserved' WHERE id = $1 AND status = 'Available' RETURNING *",
      [listingId]
    );
    
    if (listingRes.rowCount === 0) {
      throw new Error('Listing is no longer available');
    }

    // 2. Create the pending transaction record with the OTP
    const transRes = await client.query(
      `INSERT INTO transactions (listing_id, seller_id, buyer_id, otp, status) 
       VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
      [listingId, sellerId, buyerId, otp]
    );

    await client.query('COMMIT'); // Save changes
    return transRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK'); // Cancel changes if anything fails
    throw error;
  } finally {
    client.release();
  }
};

export const verifyTransaction = async (transactionId, otp) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check transaction and verify OTP
    const transRes = await client.query(
      "SELECT * FROM transactions WHERE id = $1 AND status = 'Pending'",
      [transactionId]
    );

    if (transRes.rowCount === 0) throw new Error('Transaction not found or already completed');
    if (transRes.rows[0].otp !== otp) throw new Error('Invalid OTP');

    const transaction = transRes.rows[0];

    // 2. Mark transaction as completed
    const updateTrans = await client.query(
      "UPDATE transactions SET status = 'Completed', completed_at = NOW() WHERE id = $1 RETURNING *",
      [transactionId]
    );

    // 3. Permanently mark listing as Sold
    await client.query(
      "UPDATE listings SET status = 'Sold' WHERE id = $1",
      [transaction.listing_id]
    );

    await client.query('COMMIT');
    return updateTrans.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getUserHistory = async (userId) => {
  const result = await pool.query(
    `SELECT t.id as transaction_id, t.completed_at, t.status,
            l.id as listing_id, l.title, l.price, l.images,
            buyer.name as buyer_name, seller.name as seller_name,
            CASE WHEN t.seller_id = $1 THEN 'Sold' ELSE 'Bought' END as trade_type
     FROM transactions t
     JOIN listings l ON t.listing_id = l.id
     JOIN users buyer ON t.buyer_id = buyer.id
     JOIN users seller ON t.seller_id = seller.id
     WHERE (t.buyer_id = $1 OR t.seller_id = $1) AND t.status = 'Completed'
     ORDER BY t.completed_at DESC`,
    [userId]
  );
  return result.rows;
};