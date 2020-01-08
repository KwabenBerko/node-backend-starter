import dbConfig from "../config/database.config";
import Knex from "knex";
const knexStringcase = require("knex-stringcase");

const options = knexStringcase(dbConfig);
export const knex = Knex(options)