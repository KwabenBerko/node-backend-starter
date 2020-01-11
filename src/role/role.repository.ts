import _ from "lodash";
import { RoleModel } from "./role.model";
import { PermissionModel } from "../permission/permission.model";

const validFields = [
    "name",
    "permissions"
]

export namespace RoleRepo {

    export const findAll = async (): Promise<RoleModel[]> => {
        return await RoleModel.query().withGraphFetched("permissions");
    }

    export const findByName = async (name: string): Promise<RoleModel> => {
        return await RoleModel.query()
            .withGraphFetched("permissions")
            .findOne({ name });
    }

    export const findById = async (id: number): Promise<RoleModel> => {
        return await RoleModel.query()
            .withGraphFetched("permissions")
            .findOne({ id });
    }

    export const insert = async (role: RoleModel): Promise<RoleModel> => {
        return await RoleModel.query().insertGraphAndFetch(_.pick(role, validFields), { relate: true });
    }

    export const update = async (role: RoleModel): Promise<RoleModel> => {
        return await RoleModel.query().upsertGraphAndFetch(_.pick(role, validFields), {relate: true});
    }

    export const remove = async (role: RoleModel): Promise<RoleModel> => {
        await RoleModel.query().deleteById(role.id);
        return role;
    }
}