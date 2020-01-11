import { Model } from "objection";
import { tableConstants } from "../shared/util/constant.util";

export class VerificationTokenModel extends Model {

    static tableName = tableConstants.VERIFICATION_TOKENS;

    id!: number;
    userId!: number;
    token!: string;
    expiresOn!: string;
}