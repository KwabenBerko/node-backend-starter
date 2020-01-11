import dbConfig from "../config/database.config";
import Knex from "knex";

export const knex = Knex(dbConfig)