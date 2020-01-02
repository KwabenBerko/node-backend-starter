import { Permission } from "../permission/permission.model";

export class Role {
    id: number;
    name: string;
    permissions: Permission[];
    createdOn: number;
    modifiedOn: number;

    constructor(name: string, permissions: Permission[]){
        this.id = 0;
        this.name = name;
        this.permissions = permissions;
        this.createdOn = Date.now();
        this.modifiedOn = Date.now();
    }
}

