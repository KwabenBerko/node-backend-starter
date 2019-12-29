import { Role } from "./role.model";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { BadRequestError } from "../shared/errors/bad-request.error";
import * as RoleRepo from "./role.repository";
import * as PermissionService from "../permission/permission.service";
import * as MessageUtil from "../shared/util/message.util";
import { ConflictError } from "../shared/errors/conflict.error";

export const add = async (dto: CreateRoleDTO):Promise<Role> => {
    if(!(dto.name && dto.permissionIds)){
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
    }

    if(dto.permissionIds.length < 1){
        throw new BadRequestError(MessageUtil.INVALID_PERMISSION_LENGTH);
    }

    const role = await RoleRepo.findByName(dto.name);
    if(role){
        throw new ConflictError(MessageUtil.ROLE_ALREADY_EXISTS);
    }

    // dto.permissionIds.map(permissionId => {
    //     const permission = await Permiss
    // })

    throw new Error();
}