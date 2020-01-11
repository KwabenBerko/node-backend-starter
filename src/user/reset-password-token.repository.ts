import _ from "lodash";
import { ResetPasswordTokenModel } from "./reset-password-token.model";

const validFields = [
    "userId",
    "token",
    "expiresOn"
]

export namespace ResetPasswordTokenRepo {
    export const findById = async (id: number): Promise<ResetPasswordTokenModel> => {
        return ResetPasswordTokenModel.query().findById(id);
    }
    
    export const findByToken = async (token: string): Promise<ResetPasswordTokenModel> => {
        return ResetPasswordTokenModel.query().findOne({token});
    }
    
    export const findByUserId = async (userId: number): Promise<ResetPasswordTokenModel> => {
        return ResetPasswordTokenModel.query().findOne({userId});
    }
    
    export const insert = async (resetPasswordToken: ResetPasswordTokenModel): Promise<ResetPasswordTokenModel> => {
        return ResetPasswordTokenModel.query().insertAndFetch(_.pick(resetPasswordToken, validFields));
    }
    
    export const remove = async (resetPasswordToken: ResetPasswordTokenModel): Promise<ResetPasswordTokenModel> => {
        await ResetPasswordTokenModel.query().deleteById(resetPasswordToken.id);
        return resetPasswordToken;
    }
}
