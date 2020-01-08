import { Permission } from "./permission.model";

export class Role {
    id: number;
    name: string;
    permissions: Permission[];
    createdAt: number;
    updatedAt: number;

    constructor(name: string, permissions: Permission[]){
        this.id = 0;
        this.name = name;
        this.permissions = permissions;
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
    }
}

