export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
      sender_id INT REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
      encrypted_content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`DROP TABLE messages;`);
};