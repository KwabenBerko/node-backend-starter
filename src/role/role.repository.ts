import { Role } from "./role.model";

export namespace RoleRepo {
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