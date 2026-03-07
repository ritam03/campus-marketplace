export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE users DROP COLUMN IF NOT EXISTS password;
  `);
};