import multer from 'multer';
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Keep file in memory temporarily instead of writing to disk
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Helper function to upload a buffer to Cloudinary
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: 'campus-marketplace' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const processAndUploadImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.body.imageUrls = [];

  try {
    for (const file of req.files) {
      // Compress and convert to webp using Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize({ width: 800, withoutEnlargement: true }) // Prevent massive images
        .webp({ quality: 80 }) // 80% quality WebP saves massive space
        .toBuffer();

      const uploadResult = await streamUpload(processedBuffer);
      req.body.imageUrls.push(uploadResult.secure_url);
    }
    next();
  } catch (error) {
    console.error('Image Processing Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process images' });
  }
};