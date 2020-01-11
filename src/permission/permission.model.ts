import { Model } from "objection";
import { Tables } from "../shared/util/constant.util";

export class PermissionModel extends Model{

    static tableName = Tables.PERMISSIONS;

    id!: number;
    name!: string;
}