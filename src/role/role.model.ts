import { PermissionModel } from "../permission/permission.model";
import { Model } from "objection";
import { Tables } from "../shared/util/constant.util";

export class RoleModel extends Model{

    static tableName = Tables.ROLES;

    id!: number;
    name!: string;
    permissions: PermissionModel[] = [];
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();


    static relationMappings = {
        permissions: {
            modelClass: PermissionModel,
            relation: Model.ManyToManyRelation,
            join:{
                from: `${Tables.ROLES}.id`,
                through: {
                    from: `${Tables.ROLES_PERMISSIONS}.role_id`,
                    to: `${Tables.ROLES_PERMISSIONS}.permission_id`,
                },
                to: `${Tables.PERMISSIONS}.id`
            }
        }
    }
}

