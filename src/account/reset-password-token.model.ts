export interface ResetPasswordToken {
    id: number,
    accountId: number,
    token: string,
    expiresOn: number
}