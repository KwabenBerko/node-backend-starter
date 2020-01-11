import * as Knex from "knex";
import { tableConstants } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(tableConstants.ROLES_PERMISSIONS, table => {
        table.integer("role_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(tableConstants.ROLES)
            .onDelete("CASCADE");

        table
            .integer("permission_id")
            .notNullable()
            .unsigned()
            .references("id")
            .inTable(tableConstants.PERMISSIONS);
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(tableConstants.ROLES_PERMISSIONS);
}

