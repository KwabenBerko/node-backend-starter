import { knex } from "../src/shared/database";
import { Model } from "objection";

before(() => {
    Model.knex(knex);
})

beforeEach(async () => {
    await knex.migrate.latest();
    await knex.seed.run();
})

afterEach(async () => {
    await knex.migrate.rollback();
})

after(async() => {
    await knex.destroy()
})
