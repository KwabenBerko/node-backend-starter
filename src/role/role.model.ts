import { PermissionModel } from "../permission/permission.model";
import { Model } from "objection";
import { tableConstants } from "../shared/util/constant.util";

export class RoleModel extends Model{

    static tableName = tableConstants.ROLES;

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
                from: `${tableConstants.ROLES}.id`,
                through: {
                    from: `${tableConstants.ROLES_PERMISSIONS}.role_id`,
                    to: `${tableConstants.ROLES_PERMISSIONS}.permission_id`,
                },
                to: `${tableConstants.PERMISSIONS}.id`
            }
        }
    }
}

