import { Model } from "objection";
import { RoleModel } from "../role/role.model";
import { Tables } from "../shared/util/constant.util";

export enum Gender {
    M = "m",
    F = "f"
}

export enum OauthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook"
}


export class UserModel extends Model{

    static tableName = Tables.USERS;

    id!: number;
    oauthId?: string
    oauthProvider?: OauthProvider;
    pictureUrl?: string;
    firstName!: string;
    lastName!: string;
    gender?: Gender;
    email?: string;
    phoneNumber?: string;
    password?: string;
    roles: RoleModel[] = [];
    enabled: boolean = true;
    verifiedAt?: string;
    lastLoginAt?: string;
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();


    static relationMappings = {
        roles: {
            modelClass: RoleModel,
            relation: Model.ManyToManyRelation,
            join: {
                from: `${Tables.USERS}.id`,
                through: {
                    from: `${Tables.USERS_ROLES}.user_id`,
                    to: `${Tables.USERS_ROLES}.role_id`,
                },
                to: `${Tables.ROLES}.id`
            }
        }
    }
}