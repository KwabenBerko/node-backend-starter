import { Role } from "../role/role.model";

export enum Gender {
    M = "m",
    F = "f"
}

export enum OauthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook"
}


export interface Account {
    id: number;
    oauthId?: string;
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
}