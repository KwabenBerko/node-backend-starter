import { PermissionModel } from "./permission.model";
import { PermissionRepo } from "./permission.repository";

export namespace PermissionService {
    export const findAll = (): Promise<PermissionModel[]> => {
        return PermissionRepo.findAll();
    }
}
