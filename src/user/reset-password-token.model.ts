import { Model } from "objection";
import { tableConstants } from "../shared/util/constant.util";

export class ResetPasswordTokenModel extends Model {

    static tableName = tableConstants.RESET_PASSWORD_TOKENS;

    id!: number;
    userId!: number;
    token!: string;
    expiresOn!: string;
}