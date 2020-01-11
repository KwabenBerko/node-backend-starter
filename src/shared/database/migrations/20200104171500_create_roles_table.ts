import * as Knex from "knex";
import { tableConstants } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(tableConstants.ROLES, table => {
        table.increments("id").primary();
        table.string("name").unique().index();
        table.timestamps(true, true);
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(tableConstants.ROLES);
}

