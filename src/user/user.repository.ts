import { User } from "./user.model";

export namespace UserRepo {

    export const findAll = (): Promise<User[]> => {
        throw new Error();
    }

    export const findByEmail = (email: string): Promise<User> => {
        throw new Error();
    }
    
    export const findByOauthId = (oauthId: string): Promise<User> => {
        throw new Error()
    }
    
    export const findById = (id: number): Promise<User> => {
        throw new Error()
    }
    
    export const update = (user: User): Promise<User> => {
        //Check if user has relationships eg. role, then add that to the db too
        throw new Error()
    }
    
    export const insert = (user: User): Promise<User> => {
        throw new Error();
    }
}