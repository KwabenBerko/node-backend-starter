import * as Knex from "knex";
import { tableConstants } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(tableConstants.USERS_ROLES, table => {
        table
            .integer("user_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(tableConstants.USERS);
        table
            .integer("role_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(tableConstants.ROLES);
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(tableConstants.USERS_ROLES);
}

