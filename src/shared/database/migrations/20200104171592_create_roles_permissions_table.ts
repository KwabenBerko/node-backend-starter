import * as Knex from "knex";
import { Tables } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(Tables.ROLES_PERMISSIONS, table => {
        table.integer("role_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(Tables.ROLES)
            .onDelete("CASCADE");

        table
            .integer("permission_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(Tables.PERMISSIONS);
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(Tables.ROLES_PERMISSIONS);
}

