const fastify = require("fastify")({ logger: true });
const axios = require("axios");
const cors = require("@fastify/cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

pool.connect((err, client) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database successfully!");

  fastify.register(cors, {
    origin: "*",
  });

  fastify.register(require("./routes/apod/apodRoute"), { pool });

  fastify.register(require("./routes/marsRover/marsRoverRoute"), { pool });

  fastify.register(require("./routes/neo/neoRoute"), { pool });
  fastify.listen({ port: 3001, host: "localhost" }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  });
});
