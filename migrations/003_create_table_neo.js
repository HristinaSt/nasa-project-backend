exports.up = async (pgm) => {
    await pgm.query(`
      CREATE TABLE near_earth_objects (
        id BIGINT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
  };
  
  exports.down = async (pgm) => {
    await pgm.query(`
      DROP TABLE near_earth_objects;
    `);
  };
  