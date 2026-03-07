import express from 'express';
import { postListing, fetchListings, fetchSingleListing, removeListing, editListing } from '../controllers/listingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, processAndUploadImages } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', fetchListings);
router.get('/:id', fetchSingleListing);
router.post('/', protect, upload.array('images', 5), processAndUploadImages, postListing);

// Add the new Edit and Delete routes
router.put('/:id', protect, upload.array('images', 5), processAndUploadImages, editListing);
router.delete('/:id', protect, removeListing);

export default router;