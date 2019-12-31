import { Role } from "../role/role.model";

export enum Gender {
    M = "m",
    F = "f"
}

export enum OauthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook"
}


export class Account {
    id: number;
    oauthId?: string
    oauthProvider?: OauthProvider;
    firstName: string;
    lastName: string;
    gender?: Gender;
    email?: string;
    phoneNumber?: string;
    password?: string;
    roles: Role[];
    enabled: boolean;
    verifiedAt?: number;
    createdAt: number;
    modifiedAt: number;

    constructor(firstName: string, lastName: string){
        this.id = 0;
        this.firstName = firstName;
        this.lastName = lastName;
        this.enabled = true;
        this.roles = [];
        this.createdAt = Date.now();
        this.modifiedAt = Date.now();
    }
}