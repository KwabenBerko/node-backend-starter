export class ResetPasswordToken {
    id: number;
    userId: number;
    token: string;
    expiresOn: number;

    constructor(data: {
        userId: number,
        token: string,
        expiresOn: number
    }){
        this.id = 0;
        this.userId = data.userId,
        this.token = data.token,
        this.expiresOn = data.expiresOn
    }
}