const { Pool } = require("pg");
const dotenv = require("dotenv");

const ENV = process.env.NODE_ENV || "development";

dotenv.config({ path: `${__dirname}/../.env.${ENV}` });

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not configured!");
}

const config =
  ENV === "production"
    ? { connectionString: process.env.DATABASE_URL }
    : { connectionString: process.env.PGDATABASE };

module.exports = new Pool(config);
