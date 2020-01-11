import { Model } from "objection";
import { Tables } from "../shared/util/constant.util";

export class VerificationTokenModel extends Model {

    static tableName = Tables.VERIFICATION_TOKENS;

    id!: number;
    userId!: number;
    token!: string;
    expiresOn!: string;
}