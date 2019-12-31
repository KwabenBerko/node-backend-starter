import {sandbox, expect} from "../setup";
import {role, createRoleDTO, account} from "../data.factory";
import {RoleService } from "../../../src/role/role.service";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { CreateRoleDTO } from "../../../src/role/dto/create-role.dto";
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { ConflictError } from "../../../src/shared/errors/conflict.error";
import { RoleRepo } from "../../../src/role/role.repository";
import { NotFoundError } from "../../../src/shared/errors/not-found.error";
import { PermissionRepo } from "../../../src/permission/permission.repository";

describe("Role Service", () => {
    describe("Add role", () => {
        it("should throw BadRequestError if create role DTO is invalid", async () => {
            const dto: Partial<CreateRoleDTO> = {...createRoleDTO, permissionIds: undefined};

            await expect(RoleService.add(dto as CreateRoleDTO, account)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        });

        it("should throw BadRequestError if permissions length is less than 1", async () => {
            const dto: Partial<CreateRoleDTO> = {...createRoleDTO, permissionIds: []};
     
            await expect(RoleService.add(dto as CreateRoleDTO, account)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PERMISSIONS_LENGTH);
        })

        it("should throw ConflictError if role already exists by name", async () => {
            const findByNameStub = sandbox.stub(RoleRepo, "findByName").resolves(role);

            await expect(RoleService.add(createRoleDTO, account)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ROLE_ALREADY_EXISTS);
            expect(findByNameStub).to.be.calledOnce;
        })

        it("should throw NotFoundError if permission does not exist by id", async () => {
            sandbox.stub(RoleRepo, "findByName").resolves(undefined);
            const findPermissionStub = sandbox.stub(PermissionRepo, "findById").resolves(undefined)

            await expect(RoleService.add(createRoleDTO, account)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.PERMISSION_NOT_FOUND);
            expect(findPermissionStub).to.be.calledThrice;
        })
    })
})