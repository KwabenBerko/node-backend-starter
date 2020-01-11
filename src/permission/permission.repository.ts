import { PermissionModel } from "./permission.model";

export namespace PermissionRepo {
    export const findAll = (): Promise<PermissionModel[]> => {
        return PermissionModel.query();
    }
    
    export const findById = (id: number): Promise<PermissionModel> => {
        return PermissionModel.query().findById(id);
    }
}