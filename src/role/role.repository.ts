import { Role } from "./role.model";

export namespace RoleRepo {
    export const findByName = (name: string): Promise<Role> => {
        throw new Error();
    }
}