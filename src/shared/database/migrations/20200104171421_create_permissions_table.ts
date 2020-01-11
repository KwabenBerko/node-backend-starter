import * as Knex from "knex";
import { tableConstants } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(tableConstants.PERMISSIONS, table => {
        table.increments("id").primary();
        table.string("name");
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(tableConstants.PERMISSIONS);
}

