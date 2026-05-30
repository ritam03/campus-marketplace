import * as listingRepo from '../repositories/listingRepository.js';
import AppError from '../utils/AppError.js';

// UNIVERSAL SANITIZER: Guarantees the frontend always gets a clean array of URLs
const formatImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try { 
      return JSON.parse(images); 
    } catch (e) {
      return images.replace(/^{|}$/g, '').split(',')
                   .map(s => s.trim().replace(/^"|"$/g, '').replace(/\\"/g, ''))
                   .filter(Boolean);
    }
  }
  return [];
};

export const createListing = async (sellerId, data) => {
  const { title, price, condition, description, campusName, imageUrls } = data;
  const uploadedImages = imageUrls || [];

  const newListing = await listingRepo.createListing({
    sellerId, title, price, condition, description, campusName,
    images: uploadedImages
  });

  newListing.images = formatImages(newListing.images);
  return newListing;
};

export const editListing = async (listingId, sellerId, data) => {
  const { title, price, condition, description, existingImages, imageUrls } = data;
  
  // 1. Parse existing images kept by the user
  let parsedExisting = [];
  if (existingImages) {
    try { 
      parsedExisting = JSON.parse(existingImages); 
      if (!Array.isArray(parsedExisting)) parsedExisting = [parsedExisting];
    } catch (e) { 
      parsedExisting = [existingImages]; 
    }
  }
  
  // 2. Point exactly to the variable your middleware creates
  const newlyUploaded = imageUrls || [];
  
  // 3. Combine both arrays
  const finalImages = [...parsedExisting, ...newlyUploaded].filter(Boolean);

  const updates = { title, price, condition, description, images: finalImages };
  const updated = await listingRepo.updateListing(listingId, sellerId, updates);

  if (!updated) {
    throw new AppError('Unauthorized or listing not found', 403);
  }
  
  updated.images = formatImages(updated.images);
  return updated;
};

export const fetchAllListings = async () => {
  const listings = await listingRepo.getAllListings();
  return listings.map(l => ({ ...l, images: formatImages(l.images) }));
};

export const fetchListingById = async (id) => {
  const listing = await listingRepo.getListingById(id);
  if (!listing) {
    throw new AppError('Item not found', 404);
  }
  listing.images = formatImages(listing.images);
  return listing;
};

export const deleteListing = async (listingId, sellerId) => {
  const deleted = await listingRepo.deleteListing(listingId, sellerId);
  if (!deleted) {
    throw new AppError('Unauthorized or listing not found', 403);
  }
  return deleted;
};
