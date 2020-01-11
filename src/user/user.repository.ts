import _ from "lodash";
import { UserModel } from "./user.model";

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
    "roles",
]

export namespace UserRepo {

    export const findAll = async (): Promise<UserModel[]> => {
        return UserModel.query().withGraphFetched("roles");
    }

    export const findByEmail = async (email: string | undefined): Promise<UserModel> => {
        return UserModel.query()
            .findOne({ email })
            .withGraphFetched("roles")
    }

    export const findByOauthId = async (oauthId: string | undefined): Promise<UserModel> => {
        return UserModel.query()
            .findOne({ oauthId })
            .withGraphFetched("roles")
    }

    export const findById = async (id: number): Promise<UserModel> => {
        return UserModel.query()
            .findOne({ id })
            .withGraphFetched("roles")
    }

    export const update = async (user: Partial<UserModel>): Promise<UserModel> => {
        const allowed = _.pick(user, [...validFields, "lastLoginAt", "verifiedAt"]);
        const updated = await UserModel.query().patchAndFetchById(user.id!, allowed);
        if(allowed.roles){
            await updated.$relatedQuery("roles").patch(allowed);
        }
        
        return await findById(updated.id);
    }

    export const insert = async (user: UserModel): Promise<UserModel> => {
        return await UserModel.query().insertGraphAndFetch(_.pick(user, validFields), { relate: true });
    }
}