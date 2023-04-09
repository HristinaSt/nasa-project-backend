const { config } = require('dotenv');
const { Pool } = require('pg');
config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

module.exports = {
  path: './migrations',
  driver: 'pg',
  pool,
};
