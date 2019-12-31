export class ResetPasswordToken {
    id: number;
    accountId: number;
    token: string;
    expiresOn: number;

    constructor(data: {
        accountId: number,
        token: string,
        expiresOn: number
    }){
        this.id = 0;
        this.accountId = data.accountId,
        this.token = data.token,
        this.expiresOn = data.expiresOn
    }
}