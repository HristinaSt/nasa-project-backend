const { Pool } = require("pg");
const fastify = require("fastify")({ logger: true });
const axios = require("axios");
const dotenv = require("dotenv");
const NeoRepository = require("./neoRepository");

module.exports = async function (fastify, options) {
  const pool = options.pool;
  const neoRepository = new NeoRepository(pool);

  fastify.get("/neo", async (request, reply) => {
    try {
      const { start_date, end_date } = request.query;
      const response = await neoRepository.fetchAll(start_date, end_date);

      const neoData = response.near_earth_objects;
      const redactedData = {};

      for (const date in neoData) {
        redactedData[date] = neoData[date].map((obj) => ({
          id: obj.id,
          is_potentially_hazardous_asteroid:
            obj.is_potentially_hazardous_asteroid,
          name: obj.name,
          nasa_jpl_url: obj.nasa_jpl_url,
          neo_reference_id: obj.neo_reference_id,
        }));
      }

      for (const date in redactedData) {
        for (const neo of redactedData[date]) {
          try {
            await neoRepository.save({ ...neo, date });
          } catch (queryError) {
            console.error("Error saving data to the database:", queryError);
          }
        }
      }

      return response;
    } catch (error) {
      console.error(error);
      reply.status(500).send({
        error: `An error occurred while fetching Near Earth Objects data: ${error.message}`,
      });
    }
  });

  fastify.get("/neo/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const response = await neoRepository.fetchById(id);
      return response;
    } catch (error) {
      console.error(error);
      reply.status(500).send({
        error: `An error occurred while fetching NEO details: ${error.message}`,
      });
    }
  });
};
