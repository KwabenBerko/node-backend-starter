import _ from "lodash";
import * as Knex from "knex";
import { tableConstants, permissionContants } from "../../util/constant.util";

export async function seed(knex: Knex): Promise<any> {

    let data: any = [];
    _.forOwn(permissionContants, (value, key) => {
        return data.push({ name: value });
    });

    await knex(tableConstants.PERMISSIONS).del();

    return knex(tableConstants.PERMISSIONS).insert(data);
};
