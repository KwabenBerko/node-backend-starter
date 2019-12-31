import { Permission } from "./permission.model";

export namespace PermissionRepo {
    export const findAll = (): Promise<Permission[]> => {
        throw new Error();
    }
    
    export const findById = (id: number): Promise<Permission> => {
        throw new Error();
    }
}