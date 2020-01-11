import { Model } from "objection";
import { tableConstants } from "../shared/util/constant.util";

export class PermissionModel extends Model{

    static tableName = tableConstants.PERMISSIONS;

    id!: number;
    name!: string;
}