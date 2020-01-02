export class OauthLoginDTO {
    oauthId: string;
    oauthProvider: string;
    firstName: string;
    lastName: string;

    constructor(data: {
        oauthId: string;
        oauthProvider: string;
        firstName: string;
        lastName: string;
    }){
        this.oauthId = data.oauthId;
        this.oauthProvider = data.oauthProvider;
        this.firstName = data.firstName;
        this.lastName = data.lastName
    }
}