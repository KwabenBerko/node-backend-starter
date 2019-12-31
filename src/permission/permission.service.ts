import { Permission } from "./permission.model";
import { PermissionRepo } from "./permission.repository";

export namespace PermissionService {
    export const findAll = (): Promise<Permission[]> => {
        return PermissionRepo.findAll();
    }
}
