import path from "path";
import dotenv from "dotenv";
import Knex = require("knex");
import { knexSnakeCaseMappers } from "objection";

dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", ".env")
})


export = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: path.resolve(__dirname, "..", "./database", "migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "..", "./database", "seeds"),
  },
  ...knexSnakeCaseMappers()

} as Knex.Config;
