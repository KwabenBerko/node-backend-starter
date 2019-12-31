import { ResetPasswordToken } from "./reset-password-token.model";

export namespace ResetPasswordTokenRepo {
    export const findById = (id: number): Promise<ResetPasswordToken> => {
        throw new Error();
    }
    
    export const findByToken = (token: string): Promise<ResetPasswordToken> => {
        throw new Error();
    }
    
    export const findByAccountId = (accountId: number): Promise<ResetPasswordToken> => {
        throw new Error();
    }
    
    export const insert = (verificationToken: ResetPasswordToken): Promise<ResetPasswordToken> => {
        throw new Error();
    }
    
    export const remove = (verificationToken: ResetPasswordToken): Promise<void> => {
        throw new Error();
    }
}
