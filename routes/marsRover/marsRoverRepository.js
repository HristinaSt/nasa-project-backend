class MarsRoverRepository {
    constructor(pool) {
      this.pool = pool;
    }
  
    async saveRover(rover) {
      const saveRoverQuery = `
        INSERT INTO rovers (id, name, status, launch_date, landing_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id)
        DO NOTHING;
      `;
      await this.pool.query(saveRoverQuery, [
        rover.id,
        rover.name,
        rover.status,
        rover.launch_date,
        rover.landing_date,
      ]);
    }
  
    async saveCamera(camera) {
      const saveCameraQuery = `
        INSERT INTO cameras (id, name, full_name, rover_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id)
        DO NOTHING;
      `;
      await this.pool.query(saveCameraQuery, [
        camera.id,
        camera.name,
        camera.full_name,
        camera.rover_id,
      ]);
    }
  
    async savePhoto(photo) {
      const savePhotoQuery = `
        INSERT INTO mars_photos (id, img_src, earth_date, rover_id, camera_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id)
        DO NOTHING;
      `;
      await this.pool.query(savePhotoQuery, [
        photo.id,
        photo.img_src,
        photo.earth_date,
        photo.rover.id,
        photo.camera.id,
      ]);
    }
  
    async getPhotos(startDate, endDate, startId, endId) {
      const queryParams = [];
      let query = `
      SELECT 
        p.id,
        p.img_src,
        p.earth_date,
        r.id as rover_id,
        r.name as rover_name,
        r.status as rover_status,
        r.launch_date as rover_launch_date,
        r.landing_date as rover_landing_date,
        c.id as camera_id,
        c.name as camera_name,
        c.full_name as camera_full_name
      FROM mars_photos p
      JOIN rovers r ON p.rover_id = r.id
      JOIN cameras c ON p.camera_id = c.id
      WHERE 1=1
    `;
  
      if (startDate && endDate) {
        query += ` AND earth_date BETWEEN $${queryParams.length + 1} AND $${queryParams.length + 2}`;
        queryParams.push(startDate, endDate);
      }
  
      if (startId && endId) {
        query += ` AND id BETWEEN $${queryParams.length + 1} AND $${queryParams.length + 2}`;
        queryParams.push(startId, endId);
      }
  
      const { rows } = await this.pool.query(query, queryParams);
  
      return rows.map((row) => row.data);
    }
  }
  
  module.exports = MarsRoverRepository;
  