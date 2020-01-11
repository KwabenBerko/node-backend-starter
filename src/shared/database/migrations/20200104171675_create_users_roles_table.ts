import * as Knex from "knex";
import { Tables } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(Tables.USERS_ROLES, table => {
        table
            .integer("user_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(Tables.USERS);
        table
            .integer("role_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(Tables.ROLES);
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(Tables.USERS_ROLES);
}

