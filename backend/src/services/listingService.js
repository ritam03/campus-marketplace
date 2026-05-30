import * as listingRepo from '../repositories/listingRepository.js';
import AppError from '../utils/AppError.js';
import redisClient from '../config/redis.js';

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

  // Invalidate feed cache
  if (redisClient) await redisClient.flushdb().catch(() => {});
  
  return newListing;
};

export const editListing = async (listingId, sellerId, data) => {
  const { title, price, condition, description, existingImages, imageUrls } = data;
  
  let parsedExisting = [];
  if (existingImages) {
    try { 
      parsedExisting = JSON.parse(existingImages); 
      if (!Array.isArray(parsedExisting)) parsedExisting = [parsedExisting];
    } catch (e) { 
      parsedExisting = [existingImages]; 
    }
  }
  
  const newlyUploaded = imageUrls || [];
  const finalImages = [...parsedExisting, ...newlyUploaded].filter(Boolean);

  const updates = { title, price, condition, description, images: finalImages };
  const updated = await listingRepo.updateListing(listingId, sellerId, updates);

  if (!updated) {
    throw new AppError('Unauthorized or listing not found', 403);
  }
  
  updated.images = formatImages(updated.images);

  // Invalidate feed cache
  if (redisClient) {
    // Note: Redis 'del' doesn't support wildcards directly without keys/scan, but for simplicity we'll just flush the db for this small app
    // Better: use ioredis keys stream or flushdb
    await redisClient.flushdb().catch(() => {});
  }

  return updated;
};

export const fetchAllListings = async (query) => {
  const { search, minPrice, maxPrice, condition, sellerId, page = 1, limit = 12 } = query;
  
  // 1. Try fetching from Redis first
  const cacheKey = `listings:${JSON.stringify(query)}`;
  if (redisClient) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Redis Cache Miss/Error:', e.message);
    }
  }

  const offset = (page - 1) * limit;

  const filters = { search, minPrice, maxPrice, condition, sellerId };
  const pagination = { limit, offset };

  const listings = await listingRepo.getAllListings(filters, pagination);
  
  const totalCount = listings.length > 0 ? parseInt(listings[0].total_count) : 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Remove the total_count property from each row before sending to frontend
  const formattedListings = listings.map(l => {
    const { total_count, ...rest } = l;
    return { ...rest, images: formatImages(rest.images) };
  });

  const result = {
    listings: formattedListings,
    meta: {
      totalCount,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  };

  // 2. Save result in Redis cache for 60 seconds (1 minute)
  if (redisClient) {
    try {
      await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60);
    } catch (e) {
      console.warn('Failed to save to Redis Cache:', e.message);
    }
  }

  return result;
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

  // Invalidate feed cache
  if (redisClient) await redisClient.flushdb().catch(() => {});

  return deleted;
};
