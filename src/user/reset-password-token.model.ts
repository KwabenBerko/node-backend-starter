import { Model } from "objection";
import { Tables } from "../shared/util/constant.util";

export class ResetPasswordTokenModel extends Model {

    static tableName = Tables.RESET_PASSWORD_TOKENS;

    id!: number;
    userId!: number;
    token!: string;
    expiresOn!: string;
}