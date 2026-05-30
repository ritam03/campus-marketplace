import pool from '../config/db.js';

// 1. Create a new listing
export const createListing = async ({ sellerId, title, price, condition, description, campusName, images }) => {
  // Check if campus exists, if not, create it
  let campusRes = await pool.query('SELECT id FROM campuses WHERE name = $1', [campusName]);
  let campusId;
  
  if (campusRes.rows.length === 0) {
    campusRes = await pool.query('INSERT INTO campuses (name) VALUES ($1) RETURNING id', [campusName]);
  }
  campusId = campusRes.rows[0].id;

  const result = await pool.query(
    `INSERT INTO listings (seller_id, campus_id, title, price, condition, description, images) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [sellerId, campusId, title, price, condition, description, images]
  );
  return result.rows[0];
};

// 2. Fetch all active listings for the feed with Filters & Pagination
export const getAllListings = async (filters = {}, pagination = {}) => {
  const { search, minPrice, maxPrice, condition } = filters;
  const { limit = 12, offset = 0 } = pagination;

  let query = `
    SELECT l.*, c.name as campus_name, u.name as seller_name, count(*) OVER() as total_count 
    FROM listings l
    JOIN campuses c ON l.campus_id = c.id
    JOIN users u ON l.seller_id = u.id
    WHERE l.status = 'Available'
  `;
  const values = [];
  let counter = 1;

  if (search) {
    query += ` AND (l.title ILIKE $${counter} OR l.description ILIKE $${counter})`;
    values.push(`%${search}%`);
    counter++;
  }
  if (minPrice) {
    query += ` AND l.price >= $${counter}`;
    values.push(minPrice);
    counter++;
  }
  if (maxPrice) {
    query += ` AND l.price <= $${counter}`;
    values.push(maxPrice);
    counter++;
  }
  if (condition) {
    query += ` AND l.condition = $${counter}`;
    values.push(condition);
    counter++;
  }

  query += ` ORDER BY l.created_at DESC LIMIT $${counter} OFFSET $${counter + 1}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

// 3. Fetch a single listing by its ID
export const getListingById = async (id) => {
  const result = await pool.query(
    `SELECT l.*, c.name as campus_name, u.name as seller_name 
     FROM listings l
     JOIN campuses c ON l.campus_id = c.id
     JOIN users u ON l.seller_id = u.id
     WHERE l.id = $1`,
    [id]
  );
  return result.rows[0];
};

// 4. Update an existing listing (Edit)
export const updateListing = async (listingId, sellerId, updates) => {
  const { title, price, condition, description, images } = updates;
  const result = await pool.query(
    `UPDATE listings 
     SET title = $1, price = $2, condition = $3, description = $4, images = $5 
     WHERE id = $6 AND seller_id = $7 RETURNING *`,
    [title, price, condition, description, images, listingId, sellerId]
  );
  return result.rows[0];
};

// 5. Delete a listing
export const deleteListing = async (listingId, sellerId) => {
  const result = await pool.query(
    'DELETE FROM listings WHERE id = $1 AND seller_id = $2 RETURNING *',
    [listingId, sellerId]
  );
  return result.rows[0];
};