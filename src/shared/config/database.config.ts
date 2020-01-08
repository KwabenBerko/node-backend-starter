import path from "path";
import dotenv from "dotenv";
import Knex = require("knex");

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
  } 
} as Knex.Config;
