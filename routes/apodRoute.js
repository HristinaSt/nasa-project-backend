const { Pool } = require("pg");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const fastify = require("fastify")({ logger: true });
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const apodSchema = {
  querystring: {
    date: { type: "string", format: "date" },
  },
};

module.exports = async function (fastify) {
  fastify.get("/apod", { schema: apodSchema }, async (request, reply) => {
    try {
      // Check if the data for the requested date already exists in the database.
      const checkDataQuery = `
        SELECT data
        FROM apod_data
        WHERE date = $1;
      `;
      const { rows } = await pool.query(checkDataQuery, [request.query.date]);

      if (rows.length > 0) {
        // Return the data from the database if it already exists.
        return rows[0].data;
      }

      const response = await axios.get("https://api.nasa.gov/planetary/apod", {
        params: {
          api_key: "BChFdP9eJ8HgXJ1wRaktCYG5EI1ns55KaW49bcj8",
          date: request.query.date,
        },
      });

      // Save the data to the database.
      const saveDataQuery = `
        INSERT INTO apod_data (date, data)
        VALUES ($1, $2)
        ON CONFLICT (date)
        DO UPDATE SET data = apod_data.data || EXCLUDED.data;
      `;
      const redactedData = {
        [response.data.date]: {
          title: response.data.title,
          explanation: response.data.explanation,
          hdurl: response.data.hdurl,
          url: response.data.url,
        },
      };
      await pool.query(saveDataQuery, [response.data.date, redactedData]);

      // Return the received data from the NASA API.
      return response.data;
    } catch (error) {
      console.error(error);
      reply
        .status(500)
        .send({ error: "An error occurred while fetching APOD data." });
    }
  });
};
