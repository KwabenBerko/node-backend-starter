import { Role } from "./role.model";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { BadRequestError } from "../shared/errors/bad-request.error";
import { RoleRepo } from "./role.repository";
import { PermissionRepo } from "../permission/permission.repository";
import { MessageUtil } from "../shared/util/message.util";
import { ConflictError } from "../shared/errors/conflict.error";
import { NotFoundError } from "../shared/errors/not-found.error";
import { Account } from "../account/account.model";
import { AccountService } from "../account/account.service";
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

    export const add = async (dto: CreateRoleDTO, account: Account):Promise<Role> => {

        if(!AccountService.hasPermission(permissionContants.ADD_ROLES, account)){
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

    export const modify = async (id: number, dto: ModifyRoleDTO, account: Account): Promise<Role> => {

        if(!AccountService.hasPermission(permissionContants.MODIFY_ROLES, account)){
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

    export const remove = async (roleId: number, account: Account): Promise<Role> => {
        if(!AccountService.hasPermission(permissionContants.DELETE_ROLES, account)){
            throw new ForbiddenError();
        }

        const role = await findByIdOrThrow(roleId);
        const accounts = await AccountService.findAccountsForRole(role);
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