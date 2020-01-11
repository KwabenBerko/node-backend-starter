import { RoleModel } from "./role.model";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { BadRequestError } from "../shared/errors/bad-request.error";
import { RoleRepo } from "./role.repository";
import { PermissionRepo } from "../permission/permission.repository";
import { MessageUtil } from "../shared/util/message.util";
import { ConflictError } from "../shared/errors/conflict.error";
import { NotFoundError } from "../shared/errors/not-found.error";
import { UserModel } from "../user/user.model";
import { UserService } from "../user/user.service";
import { permissionContants } from "../shared/util/constant.util";
import { ModifyRoleDTO } from "./dto/modify-role.dto";
import { PermissionModel } from "../permission/permission.model";

export namespace RoleService {

    export const findByIdOrThrow = async (id: number): Promise<RoleModel> => {
        const role = await findById(id);
        if (!role) {
            throw new NotFoundError(MessageUtil.ROLE_NOT_FOUND);
        }

        return role;
    }

    export const findById = async (id: number): Promise<RoleModel> => {
        return await RoleRepo.findById(id);
    }

    export const findAll = async (currentUser: UserModel): Promise<RoleModel[]> => {
        UserService.hasPermissionToOrThrow({
            permission: permissionContants.READ_ROLES, 
            user: currentUser
        })
        return RoleRepo.findAll(); ``
    }

    export const add = async (dto: CreateRoleDTO, currentUser: UserModel): Promise<RoleModel> => {

        UserService.hasPermissionToOrThrow({
            permission: permissionContants.ADD_ROLES,
            user: currentUser
        })

        if (!(dto.name && dto.permissionIds)) {
            throw new BadRequestError();
        }

        if (dto.permissionIds.length < 1) {
            throw new BadRequestError(MessageUtil.INVALID_PERMISSIONS_LENGTH);
        }

        const role = await RoleRepo.findByName(dto.name);
        if (role) {
            throw new ConflictError(MessageUtil.ROLE_ALREADY_EXISTS);
        }

        const permissions = await findPermissions(dto.permissionIds);
        const newRole = new RoleModel();
        newRole.name = dto.name; 
        newRole.permissions = permissions;
        return await RoleRepo.insert(newRole);

    }

    export const modify = async (id: number, dto: ModifyRoleDTO, currentUser: UserModel): Promise<RoleModel> => {

        UserService.hasPermissionToOrThrow({
            permission: permissionContants.MODIFY_ROLES,
            user: currentUser
        })

        if (!(dto.name && dto.permissionIds)) {
            throw new BadRequestError();
        }

        if (!dto.permissionIds.length) {
            throw new BadRequestError();
        }
        const role = await findByIdOrThrow(id);
        const permissions = await findPermissions(dto.permissionIds);

        role.name = dto.name;
        role.permissions = permissions;

        return await RoleRepo.update(role);
    }

    export const remove = async (roleId: number, currentUser: UserModel): Promise<RoleModel> => {
        UserService.hasPermissionToOrThrow({
            permission: permissionContants.DELETE_ROLES,
            user: currentUser
        })

        const role = await findByIdOrThrow(roleId);
        const accounts = await UserService.findUsersForRole(role);
        if (accounts.length) {
            throw new ConflictError(MessageUtil.ROLE_IN_USE);
        }
        return RoleRepo.remove(role);
    }

    //Should we move into the permission service??
    const findPermissions = async (permissionIds: number[]): Promise<PermissionModel[]> => {
        return await Promise.all(
            permissionIds.map(async permissionId => {
                const permission = await PermissionRepo.findById(permissionId);
                if (!permission) {
                    throw new NotFoundError(MessageUtil.PERMISSION_NOT_FOUND);
                }
                return permission;
            })
        )

    }
}