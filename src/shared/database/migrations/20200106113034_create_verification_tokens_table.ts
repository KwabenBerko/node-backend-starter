import * as Knex from "knex";
import { Tables } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(Tables.VERIFICATION_TOKENS, (table) => {
        table.increments("id").primary();
        table.integer("user_id")
            .unsigned()
            .references("id")
            .inTable(Tables.USERS)
            .onDelete("CASCADE")
            .index();
        table.string("token").index();
        table.timestamp("expires_on");
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(Tables.VERIFICATION_TOKENS);
}

