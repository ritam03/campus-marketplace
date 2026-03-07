import * as listingRepo from '../repositories/listingRepository.js';

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

export const postListing = async (req, res) => {
  try {
    const { title, price, condition, description, campusName } = req.body;
    const sellerId = req.user.id;
    
    // 🌟 THE FIX: Point exactly to the variable your middleware creates
    const uploadedImages = req.body.imageUrls || [];

    const newListing = await listingRepo.createListing({
      sellerId, title, price, condition, description, campusName,
      images: uploadedImages
    });

    newListing.images = formatImages(newListing.images);
    res.status(201).json({ status: 'success', data: { listing: newListing } });
  } catch (error) {
    console.error('Post Listing Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to post listing' });
  }
};

export const editListing = async (req, res) => {
  try {
    const { title, price, condition, description, existingImages } = req.body;
    
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
    
    // 2. 🌟 THE FIX: Point exactly to the variable your middleware creates
    const newlyUploaded = req.body.imageUrls || [];
    
    // 3. Combine both arrays
    const finalImages = [...parsedExisting, ...newlyUploaded].filter(Boolean);

    const updates = { title, price, condition, description, images: finalImages };
    const updated = await listingRepo.updateListing(req.params.id, req.user.id, updates);

    if (!updated) return res.status(403).json({ status: 'error', message: 'Unauthorized or listing not found' });
    
    updated.images = formatImages(updated.images);
    res.status(200).json({ status: 'success', data: { listing: updated } });
  } catch (error) {
    console.error("Edit Listing Error:", error);
    res.status(500).json({ status: 'error', message: 'Failed to update listing' });
  }
};

export const fetchListings = async (req, res) => {
  try {
    const listings = await listingRepo.getAllListings();
    const formatted = listings.map(l => ({ ...l, images: formatImages(l.images) }));
    res.status(200).json({ status: 'success', data: { listings: formatted } });
  } catch (error) {
    console.error('Fetch Listings Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch listings' });
  }
};

export const fetchSingleListing = async (req, res) => {
  try {
    const listing = await listingRepo.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ status: 'error', message: 'Item not found' });
    
    listing.images = formatImages(listing.images);
    res.status(200).json({ status: 'success', data: { listing } });
  } catch (error) {
    console.error('Fetch Single Listing Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch listing' });
  }
};

export const removeListing = async (req, res) => {
  try {
    const deleted = await listingRepo.deleteListing(req.params.id, req.user.id);
    if (!deleted) return res.status(403).json({ status: 'error', message: 'Unauthorized or listing not found' });
    res.status(200).json({ status: 'success', message: 'Listing deleted' });
  } catch (error) {
    console.error('Remove Listing Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete listing' });
  }
};