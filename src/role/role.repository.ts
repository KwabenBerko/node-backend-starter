import { Role } from "./role.model";

export interface Options {
    from: number,
    to: number,
    limit: number,
    skip: number
    sort: string, //sort=title:asc
    include: readonly string[] //include=user,car
}

export namespace RoleRepo {

    export const findAll = (): Promise<Role[]> => {
        throw new Error();
    }

    export const findByName = (name: string): Promise<Role> => {
        throw new Error();
    }

    export const findById = (id: number): Promise<Role> => {
        throw new Error();
    }

    export const insert = (role: Role): Promise<Role> => {
        throw new Error();
    }

    export const update = (role: Role): Promise<Role> => {
        throw new Error();
    }

    export const remove = (role: Role): Promise<Role> => {
        throw new Error();
    }
}