import * as Knex from "knex";
import { tableConstants } from "../../util/constant.util";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable(tableConstants.USERS, table => {
        table.increments("id").primary();
        table.string("oauth_id").index();
        table.string("oauth_provider");
        table.string("picture_url");
        table.string("first_name").notNullable();
        table.string("last_name").notNullable();
        table.string("gender");
        table.string("email").unique();
        table.string("phone_number").unique();
        table.string("password");
        table.boolean("enabled").defaultTo(true);
        table.dateTime("verified_at");
        table.dateTime("last_login_at");
        table.timestamps(true, true);
    })
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists(tableConstants.USERS);
}

