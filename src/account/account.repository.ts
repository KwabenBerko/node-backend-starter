import { Account } from "./account.model";

export namespace AccountRepo {

    export const findAll = (): Promise<Account[]> => {
        throw new Error();
    }

    export const findByEmail = (email: string): Promise<Account> => {
        throw new Error();
    }
    
    export const findByOauthId = (oauthId: string): Promise<Account> => {
        throw new Error()
    }
    
    export const findById = (id: number): Promise<Account> => {
        throw new Error()
    }
    
    export const update = (account: Account): Promise<Account> => {
        throw new Error()
    }
    
    export const insert = (account: Account): Promise<Account> => {
        throw new Error();
    }
}