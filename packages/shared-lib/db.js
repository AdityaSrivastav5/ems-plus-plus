const { Pool } = require('pg');
const config = require('@ems/config');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
