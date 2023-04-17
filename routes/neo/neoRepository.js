const axios = require("axios");

class NeoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async save(neo) {
    const saveDataQuery = `
    INSERT INTO near_earth_objects (id, data)
    VALUES ($1, jsonb_build_object($2, jsonb_build_array($3)))
    ON CONFLICT (id)
    DO UPDATE SET data = near_earth_objects.data || EXCLUDED.data;
  `;

    try {
        await this.pool.query(saveDataQuery, [neo.id, neo.date, neo]);

    } catch (queryError) {
      console.error("Error saving data to the database:", queryError);
      throw queryError;
    }
  }

  async fetchAll(start_date, end_date) {
    try {
      const response = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${process.env.API_KEY}`
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async fetchById(id) {
    try {
      const response = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching NEO data by ID:", error);
      throw error;
    }
  }
}

module.exports = NeoRepository;
