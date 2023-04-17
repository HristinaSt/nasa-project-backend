
const { Pool } = require("pg");
const axios = require("axios");
const dotenv = require("dotenv");
const APODRepository = require("./apodRepository");
dotenv.config();

const fastify = require("fastify")({ logger: true });

const apodSchema = {
  querystring: {
    date: { type: "string", format: "date" },
  },
};

module.exports = async function (fastify, options) {
  const apodRepository = new APODRepository(options.pool);

  fastify.get("/apod", { schema: apodSchema }, async (request, reply) => {
    try {
      const rows = await apodRepository.findAPODDataByDate(request.query.date);

      if (rows.length > 0) {
        return rows[0].data;
      }

      const response = await axios.get("https://api.nasa.gov/planetary/apod", {
        params: {
          api_key: process.env.API_KEY,
          date: request.query.date,
        },
      });

      const redactedData = {
        [response.data.date]: {
          title: response.data.title,
          explanation: response.data.explanation,
          hdurl: response.data.hdurl,
          url: response.data.url,
        },
      };

      await apodRepository.saveAPODData(response.data.date, redactedData);

      return response.data;
    } catch (error) {
      console.error(error);
      reply
        .status(500)
        .send({ error: "An error occurred while fetching APOD data." });
    }
  });
};

