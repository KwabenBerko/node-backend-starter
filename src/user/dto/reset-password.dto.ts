export class ResetPasswordDTO {
    token: string;
    password: string;
    confirmPassword: string;

    constructor(data: {
        token: string;
        password: string;
        confirmPassword: string
    }){
        this.token = data.token;
        this.password = data.password;
        this.confirmPassword = data.confirmPassword
    }
}