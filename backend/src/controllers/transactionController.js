import * as transactionService from '../services/transactionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reserveItem = asyncHandler(async (req, res) => {
  const { listingId, buyerId } = req.body;
  const sellerId = req.user.id;

  const transaction = await transactionService.reserveItem(listingId, sellerId, buyerId);
  
  // Return the transaction data. We explicitly DO NOT return the OTP here to keep it secure!
  res.status(200).json({ status: 'success', data: { transaction } });
});

export const verifyHandover = asyncHandler(async (req, res) => {
  const { listingId, otp } = req.body;
  
  const transaction = await transactionService.verifyHandover(listingId, otp);

  res.status(200).json({ status: 'success', data: { transaction } });
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await transactionService.getUserHistory(req.user.id);
  res.status(200).json({ status: 'success', data: { history } });
});

export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await transactionService.getPlatformStats();
  res.status(200).json({ status: 'success', data: stats });
});