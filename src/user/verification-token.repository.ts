import _ from "lodash";
import { VerificationTokenModel } from "./verification-token.model";
import { knex } from "../shared/database";
import { tableConstants } from "../shared/util/constant.util";

const validFields = [
    "userId",
    "token",
    "expiresOn"
]

export namespace VerificationTokenRepo{
    export const findById = async (id: number): Promise<VerificationTokenModel> => {
        return Object.assign(
            Object.create(VerificationTokenModel.prototype),
            await knex.select().from(tableConstants.VERIFICATION_TOKENS).where({id}).first()
        )
    }
    
    export const findByToken = (token: string): Promise<VerificationTokenModel> => {
        throw new Error();
    }
    
    export const findByUserId = (userId: number): Promise<VerificationTokenModel> => {
        throw new Error();
    }
    
    export const insert = async (verificationToken: VerificationTokenModel): Promise<VerificationTokenModel> => {
        const [id] = await knex.table(tableConstants.VERIFICATION_TOKENS).insert(
            _.pick(verificationToken, validFields)
        )
        return findById(id)
    }
    
    export const remove = (verificationToken: VerificationTokenModel): Promise<VerificationTokenModel> => {
        throw new Error();
    }
}
