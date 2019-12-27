import { ResetPasswordToken } from "./reset-password-token.model";

export const findById = (id: number): Promise<ResetPasswordToken> => {
    throw new Error();
}

export const findByAccountId = (accountId: number): Promise<ResetPasswordToken> => {
    throw new Error();
}

export const add = (verificationToken: ResetPasswordToken): Promise<ResetPasswordToken> => {
    throw new Error();
}

export const remove = (verificationToken: ResetPasswordToken): Promise<void> => {
    throw new Error();
}
