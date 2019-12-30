import { Role } from "./role.model";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { BadRequestError } from "../shared/errors/bad-request.error";
import { RoleRepo } from "./role.repository";
import { PermissionRepo } from "../permission/permission.repository";
import { MessageUtil } from "../shared/util/message.util";
import { ConflictError } from "../shared/errors/conflict.error";
import { NotFoundError } from "../shared/errors/not-found.error";

export namespace RoleService {
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
    
        dto.permissionIds.map(async permissionId => {
            const permission = await PermissionRepo.findById(permissionId);
            if(!permission){
                throw new NotFoundError(MessageUtil.PERMISSION_NOT_FOUND);
            }
        })
    
        throw new Error();
    }
}