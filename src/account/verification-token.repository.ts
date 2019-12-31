import { VerificationToken } from "./verification-token.model";

export namespace VerificationTokenRepo{
    export const findById = (id: number): Promise<VerificationToken> => {
        throw new Error();
    }
    
    export const findByToken = (token: string): Promise<VerificationToken> => {
        throw new Error();
    }
    
    export const findByAccountId = (accountId: number): Promise<VerificationToken> => {
        throw new Error();
    }
    
    export const add = (verificationToken: VerificationToken): Promise<VerificationToken> => {
        throw new Error();
    }
    
    export const remove = (verificationToken: VerificationToken): Promise<VerificationToken> => {
        throw new Error();
    }
}
