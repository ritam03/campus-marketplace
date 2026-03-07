export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS otp VARCHAR(10);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE transactions DROP COLUMN IF NOT EXISTS otp;
  `);
};