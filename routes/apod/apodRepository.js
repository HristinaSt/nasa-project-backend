class APODRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAPODDataByDate(date) {
    const checkDataQuery = `
      SELECT data
      FROM apod_data
      WHERE date = $1;
    `;
    const { rows } = await this.pool.query(checkDataQuery, [date]);
    return rows;
  }

  async saveAPODData(date, redactedData) {
    const saveDataQuery = `
      INSERT INTO apod_data (date, data)
      VALUES ($1, $2)
      ON CONFLICT (date)
      DO UPDATE SET data = apod_data.data || EXCLUDED.data;
    `;
    await this.pool.query(saveDataQuery, [date, redactedData]);
  }
}

module.exports = APODRepository;
