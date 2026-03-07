import pool from '../config/db.js';
import * as transactionRepo from '../repositories/transactionRepository.js';
import sendEmail from '../utils/sendEmail.js';

export const reserveItem = async (req, res) => {
  try {
    const { listingId, buyerId } = req.body;
    const sellerId = req.user.id;

    // 1. Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save the transaction to the database securely
    const transaction = await transactionRepo.createTransaction(listingId, sellerId, buyerId, otp);

    // 3. Fetch Buyer and Listing details for the email content
    const buyerRes = await pool.query('SELECT name, email FROM users WHERE id = $1', [buyerId]);
    const listingRes = await pool.query('SELECT title FROM listings WHERE id = $1', [listingId]);
    
    const buyer = buyerRes.rows[0];
    const listing = listingRes.rows[0];

    // 4. Send the HTML Email
    try {
      const message = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Campus Marketplace</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937;">Secure Handover Initiated</h2>
            <p style="color: #4b5563; line-height: 1.6;">Hi <strong>${buyer.name}</strong>,</p>
            <p style="color: #4b5563; line-height: 1.6;">The seller has reserved <strong>"${listing.title}"</strong> for you. To finalize the purchase and mark the item as sold, please provide this 6-digit secure code to the seller when you receive the item.</p>
            <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #2563eb;">${otp}</span>
            </div>
            <p style="color: #dc2626; font-size: 14px; text-align: center;">⚠️ Do not share this code until you physically have the item.</p>
          </div>
        </div>
      `;
      
      await sendEmail({ 
        email: buyer.email, 
        subject: `Your OTP for ${listing.title}`, 
        message 
      });
      console.log(`✅ OTP Email sent to ${buyer.email}`);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // We log the error but do not crash the transaction process
    }

    // Return the transaction data. We explicitly DO NOT return the OTP here to keep it secure!
    res.status(200).json({ status: 'success', data: { transaction } });
  } catch (error) {
    console.error('Reserve Item Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to reserve item' });
  }
};

export const verifyHandover = async (req, res) => {
  try {
    const { listingId, otp } = req.body;
    
    // 1. Find the pending transaction ID for this specific listing
    const transRes = await pool.query(
      "SELECT id FROM transactions WHERE listing_id = $1 AND status = 'Pending'",
      [listingId]
    );

    if (transRes.rowCount === 0) {
      return res.status(400).json({ status: 'error', message: 'No pending handover found for this item.' });
    }

    const transactionId = transRes.rows[0].id;

    // 2. Verify the OTP using the repository function
    const transaction = await transactionRepo.verifyTransaction(transactionId, otp);

    res.status(200).json({ status: 'success', data: { transaction } });
  } catch (error) {
    console.error('Verify Handover Error:', error);
    res.status(400).json({ status: 'error', message: error.message || 'Failed to verify handover' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await transactionRepo.getUserHistory(req.user.id);
    res.status(200).json({ status: 'success', data: { history } });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch trade history' });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    // We use your existing pool import here
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const tradeCount = await pool.query("SELECT COUNT(*) FROM transactions WHERE status = 'Completed'");
    
    res.status(200).json({ 
      status: 'success', 
      data: { 
        users: parseInt(userCount.rows[0].count),
        trades: parseInt(tradeCount.rows[0].count)
      } 
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch platform statistics' });
  }
};