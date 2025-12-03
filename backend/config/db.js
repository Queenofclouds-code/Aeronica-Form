const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "AAT_Form",
  password: "meghaj",
  port: 5432
});

module.exports = pool;
