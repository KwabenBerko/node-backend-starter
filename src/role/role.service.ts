import { Role } from "./role.model";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { BadRequestError } from "../shared/errors/bad-request.error";
import { RoleRepo } from "./role.repository";
import { PermissionRepo } from "../permission/permission.repository";
import { MessageUtil } from "../shared/util/message.util";
import { ConflictError } from "../shared/errors/conflict.error";
import { NotFoundError } from "../shared/errors/not-found.error";
import { User } from "../user/user.model";
import { UserService } from "../user/user.service";
import { permissionContants } from "../shared/util/constant.util";
import { ForbiddenError } from "../shared/errors/forbidden.error";
import { ModifyRoleDTO } from "./dto/modify-role.dto";
import { Permission } from "../permission/permission.model";

export namespace RoleService {

    export const findByIdOrThrow = async (id: number): Promise<Role> => {
        const role = await findById(id);
        if(!role){
            throw new NotFoundError(MessageUtil.ROLE_NOT_FOUND);
        }

        return role;
    }

    export const findById = async (id: number): Promise<Role> => {
        return await RoleRepo.findById(id);
    }

    export const findAll = async (user: User): Promise<Role[]> => {
        if(!UserService.hasPermissionTo(permissionContants.READ_ROLES, user)){
            throw new ForbiddenError();
        }

        return RoleRepo.findAll();
    }

    export const add = async (dto: CreateRoleDTO, user: User):Promise<Role> => {

        if(!UserService.hasPermissionTo(permissionContants.ADD_ROLES, user)){
            throw new ForbiddenError();
        }

        if(!(dto.name && dto.permissionIds)){
            throw new BadRequestError();
        }
    
        if(dto.permissionIds.length < 1){
            throw new BadRequestError(MessageUtil.INVALID_PERMISSIONS_LENGTH);
        }
    
        const role = await RoleRepo.findByName(dto.name);
        if(role){
            throw new ConflictError(MessageUtil.ROLE_ALREADY_EXISTS);
        }
    
        const permissions = await findPermissions(dto.permissionIds);
        const newRole = new Role(dto.name, permissions)
        return await RoleRepo.insert(newRole);
        
    }

    export const modify = async (id: number, dto: ModifyRoleDTO, user: User): Promise<Role> => {

        if(!UserService.hasPermissionTo(permissionContants.MODIFY_ROLES, user)){
            throw new ForbiddenError();
        }

        if(!(dto.name && dto.permissionIds)){
            throw new BadRequestError();
        }

        if(!dto.permissionIds.length){
            throw new BadRequestError();
        }
        const role = await findByIdOrThrow(id);
        const permissions = await findPermissions(dto.permissionIds);

        role.name = dto.name;
        role.permissions = permissions;

        return await RoleRepo.update(role);
    }

    export const remove = async (roleId: number, user: User): Promise<Role> => {
        if(!UserService.hasPermissionTo(permissionContants.DELETE_ROLES, user)){
            throw new ForbiddenError();
        }

        const role = await findByIdOrThrow(roleId);
        const accounts = await UserService.findUsersForRole(role);
        if(accounts.length){
            throw new ConflictError(MessageUtil.ROLE_IN_USE);
        }
        return RoleRepo.remove(role);
    }

    const findPermissions = async (permissionIds: number[]): Promise<Permission[]> => {
        return await Promise.all(
            permissionIds.map(async permissionId => {
                const permission = await PermissionRepo.findById(permissionId);
                if(!permission){
                    throw new NotFoundError(MessageUtil.PERMISSION_NOT_FOUND);
                }
                return permission;
            })
        )

    }
}