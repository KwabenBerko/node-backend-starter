import _ from "lodash";
import { VerificationTokenModel } from "./verification-token.model";

const validFields = [
    "userId",
    "token",
    "expiresOn"
]

export namespace VerificationTokenRepo{
    export const findById = async (id: number): Promise<VerificationTokenModel> => {
        return VerificationTokenModel.query().findOne({id});
    }
    
    export const findByToken = (token: string): Promise<VerificationTokenModel> => {
        return VerificationTokenModel.query().findOne({token});
    }
    
    export const findByUserId = (userId: number): Promise<VerificationTokenModel> => {
        return VerificationTokenModel.query().findOne({userId});
    }
    
    export const insert = async (verificationToken: VerificationTokenModel): Promise<VerificationTokenModel> => {
        return VerificationTokenModel.query().insertAndFetch(_.pick(verificationToken, validFields));
    }
    
    export const remove = async (verificationToken: VerificationTokenModel): Promise<VerificationTokenModel> => {
        await VerificationTokenModel.query().deleteById(verificationToken.id);
        return verificationToken;
    }
}
