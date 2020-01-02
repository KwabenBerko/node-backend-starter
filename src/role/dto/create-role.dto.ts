export class CreateRoleDTO {
    name: string;
    permissionIds: number[];

    constructor(data: {
        name: string,
        permissionIds: number[]
    }){
        this.name = data.name,
        this.permissionIds = data.permissionIds
    }
}