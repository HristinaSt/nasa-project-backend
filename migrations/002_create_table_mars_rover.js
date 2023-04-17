exports.up = async (pgm) => {
    await pgm.query(`
      CREATE TABLE rovers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        launch_date DATE NOT NULL,
        landing_date DATE NOT NULL
      );
    `);
  
    await pgm.query(`
      CREATE TABLE cameras (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        rover_id INTEGER REFERENCES rovers(id) ON DELETE CASCADE
      );
    `);
  
    await pgm.query(`
      CREATE TABLE mars_photos (
        id SERIAL PRIMARY KEY,
        img_src TEXT NOT NULL,
        earth_date DATE NOT NULL,
        rover_id INTEGER REFERENCES rovers(id) ON DELETE CASCADE,
        camera_id INTEGER REFERENCES cameras(id) ON DELETE CASCADE
      );
    `);
  };
  
  exports.down = async (pgm) => {
    await pgm.query(`
      DROP TABLE mars_photos;
    `);
  
    await pgm.query(`
      DROP TABLE cameras;
    `);
  
    await pgm.query(`
      DROP TABLE rovers;
    `);
  };
  