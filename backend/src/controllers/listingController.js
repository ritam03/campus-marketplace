import * as listingService from '../services/listingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const postListing = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  const newListing = await listingService.createListing(sellerId, req.body);
  res.status(201).json({ status: 'success', data: { listing: newListing } });
});

export const editListing = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  const listingId = req.params.id;
  const updated = await listingService.editListing(listingId, sellerId, req.body);
  res.status(200).json({ status: 'success', data: { listing: updated } });
});

export const fetchListings = asyncHandler(async (req, res) => {
  const listings = await listingService.fetchAllListings();
  res.status(200).json({ status: 'success', data: { listings } });
});

export const fetchSingleListing = asyncHandler(async (req, res) => {
  const listing = await listingService.fetchListingById(req.params.id);
  res.status(200).json({ status: 'success', data: { listing } });
});

export const removeListing = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  await listingService.deleteListing(req.params.id, sellerId);
  res.status(200).json({ status: 'success', message: 'Listing deleted' });
});