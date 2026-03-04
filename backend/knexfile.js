require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.PG_HOST || "localhost",
      port: parseInt(process.env.PG_PORT || "5433", 10),
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "",
      database: process.env.PG_DATABASE || "SPS_TEST",
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
