import _ from "lodash";
import * as Knex from "knex";
import { Tables, Permissions } from "../../util/constant.util";

export async function seed(knex: Knex): Promise<any> {

    let data: any = [];
    _.forOwn(Permissions, (value, key) => {
        return data.push({ name: value });
    });

    await knex(Tables.PERMISSIONS).del();

    return knex(Tables.PERMISSIONS).insert(data);
};
