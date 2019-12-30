import { Permission } from "../permission/permission.model";

export interface Role {
    id: number;
    name: string;
    permissions: Permission[],
    createdAt: number;
    modifiedAt: number;
}

