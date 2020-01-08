import _ from "lodash";
import { UserModel } from "./user.model";
import { knex } from "../shared/database";
import { tableConstants } from "../shared/util/constant.util";

const validFields = [
    "oauthId",
    "oauthProvider",
    "pictureUrl",
    "firstName",
    "lastName",
    "gender",
    "email",
    "phoneNumber",
    "password",
    "enabled",
    "verifiedAt",
    "lastLoginAt"
]

export namespace UserRepo {

    export const findAll = async (): Promise<UserModel[]> => {
        const users: UserModel[] = [];

        (await knex.select().from(tableConstants.USERS)).forEach(object => {
            users.push(
                Object.assign(
                    Object.create(UserModel.prototype), object
                )
            )
        });

        return users;
    }

    export const findByEmail = async (email: string | undefined): Promise<UserModel> => {
        return Object.assign(
            Object.create(UserModel.prototype),
            await knex.select().from(tableConstants.USERS).where({email}).first()
        )
    }

    export const findByOauthId = async (oauthId: string | undefined): Promise<UserModel> => {
        return Object.assign(
            Object.create(UserModel.prototype),
            await knex.select().from(tableConstants.USERS).where({oauthId}).first()
        )
    }

    export const findById = async (id: number | undefined): Promise<UserModel> => {
        return Object.assign(
            Object.create(UserModel.prototype),
            await knex.select().from(tableConstants.USERS).where({id}).first()
        );
    }

    export const update = async (user: Partial<UserModel>): Promise<UserModel> => {
        await knex.table(tableConstants.USERS).update(
            _.pick(user, validFields)
        ).where({id: user.id});

        return findById(user.id)
    }

    export const insert = async (user: UserModel): Promise<UserModel> => {
        const [id] = await knex(tableConstants.USERS).insert(
            _.pick(user, validFields)
        ).returning("id");

        return findById(id);
    }
}