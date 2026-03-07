export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    -- 1. Campuses Table
    CREATE TABLE campuses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      city VARCHAR(100),
      state VARCHAR(100),
      is_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Users Table
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      campus_id INT REFERENCES campuses(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Listings Table
    CREATE TABLE listings (
      id SERIAL PRIMARY KEY,
      seller_id INT REFERENCES users(id) ON DELETE CASCADE,
      campus_id INT REFERENCES campuses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      condition VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Available', -- Available, Reserved, Sold
      images TEXT[], -- Array of image URLs from Cloudinary
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP -- Soft delete mechanism
    );

    -- 4. Transactions (Secure Handover Engine)
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
      seller_id INT REFERENCES users(id) ON DELETE CASCADE,
      otp_hash VARCHAR(255), -- Securely stored OTP
      status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Failed
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE transactions;
    DROP TABLE listings;
    DROP TABLE users;
    DROP TABLE campuses;
  `);
};