exports.up = async (pgm) => {
  await pgm.query(`
    CREATE TABLE apod_data (
      date DATE PRIMARY KEY,
      data JSONB NOT NULL
    );
  `);
};
 
exports.down = async (pgm) => {
  await pgm.query(`
    DROP TABLE apod_data;
  `);
};
