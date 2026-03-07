export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE messages DROP COLUMN is_read;
  `);
};