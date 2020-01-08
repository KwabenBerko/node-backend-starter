import { knex } from "../../src/shared/database";


beforeEach(async () => {
    await knex.migrate.latest();
})

afterEach(async () => {
    await knex.migrate.rollback();
})

after(async() => {
    await knex.destroy()
})
