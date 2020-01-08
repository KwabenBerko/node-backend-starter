import { Model } from "objection";
import { Role } from "../role/role.model";
import { tableConstants } from "../shared/util/constant.util";

export enum Gender {
    M = "m",
    F = "f"
}

export enum OauthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook"
}


export class UserModel extends Model{

    static tableName = tableConstants.USERS;

    id: number = 0;
    oauthId?: string
    oauthProvider?: OauthProvider;
    pictureUrl?: string;
    firstName!: string;
    lastName!: string;
    gender?: Gender;
    email?: string;
    phoneNumber?: string;
    password?: string;
    roles: Role[] = [];
    enabled: boolean = true;
    verifiedAt?: string;
    lastLoginAt?: string;
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();
}