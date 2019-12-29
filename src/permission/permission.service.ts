import { Permission } from "./permission.model";
import * as PermissionRepo from "./permission.repository";

export const findAll = (): Promise<Permission[]> => {
    return PermissionRepo.findAll();
}
