import { sandbox, expect } from "../setup";
import { role, createRoleDTO, account, permission, faker, modifyRoleDTO } from "../data.factory";
import { RoleService } from "../../../src/role/role.service";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { CreateRoleDTO } from "../../../src/role/dto/create-role.dto";
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { ConflictError } from "../../../src/shared/errors/conflict.error";
import { RoleRepo } from "../../../src/role/role.repository";
import { NotFoundError } from "../../../src/shared/errors/not-found.error";
import { PermissionRepo } from "../../../src/permission/permission.repository";
import { ForbiddenError } from "../../../src/shared/errors/forbidden.error";
import { AccountService } from "../../../src/account/account.service";
import { ModifyRoleDTO } from "../../../src/role/dto/modify-role.dto";

describe("Role Service", () => {
    describe("Add role", () => {

        it("should throw ForbiddenError if account does not have permission to add roles", async () => {
            const hasPermissionStub = sandbox.stub(AccountService, "hasPermission").returns(false);

            await expect(RoleService.add(createRoleDTO, account)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
            expect(hasPermissionStub).to.be.calledOnce;
        })

        it("should throw BadRequestError if create role DTO is invalid", async () => {
            sandbox.stub(AccountService, "hasPermission").resolves(true);
            const dto: Partial<CreateRoleDTO> = { ...createRoleDTO, permissionIds: undefined };

            await expect(RoleService.add(dto as CreateRoleDTO, account)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        });

        it("should throw BadRequestError if permissions length is less than 1", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);

            const dto: Partial<CreateRoleDTO> = { ...createRoleDTO, permissionIds: [] };

            await expect(RoleService.add(dto as CreateRoleDTO, account)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PERMISSIONS_LENGTH);
        })

        it("should throw ConflictError if role already exists by name", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            const findByNameStub = sandbox.stub(RoleRepo, "findByName").resolves(role);

            await expect(RoleService.add(createRoleDTO, account)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ROLE_ALREADY_EXISTS);
            expect(findByNameStub).to.be.calledOnce;
        })

        it("should throw NotFoundError if permission does not exist by id", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findByName").resolves(undefined);
            const findPermissionStub = sandbox.stub(PermissionRepo, "findById").resolves(undefined)

            await expect(RoleService.add(createRoleDTO, account)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.PERMISSION_NOT_FOUND);
            expect(findPermissionStub).to.be.calledThrice;
        })

        it("should successfully add role", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(PermissionRepo, "findById").resolves(permission);
            sandbox.stub(RoleRepo, "findByName").resolves(undefined);
            const insertRoleStub = sandbox.stub(RoleRepo, "insert").resolves(role);

            await expect(RoleService.add(createRoleDTO, account)).to.be.eventually.fulfilled;
            expect(insertRoleStub).to.be.calledOnce;
        })
    })

    describe("Remove role", () => {
        it("should throw ConflictError if account does not have permissions to delete roles", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(false);

            await expect(RoleService.remove(faker.random.number(4), account)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
        })

        it("should throw NotFoundError if role is not found", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(undefined);
            const removeRoleStub = sandbox.stub(RoleRepo, "remove").resolves(role);

            await expect(RoleService.remove(faker.random.number(4), account)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ROLE_NOT_FOUND);
            expect(removeRoleStub).to.not.be.calledOnce;
        });

        it("should throw ConflictError if role is still in use by other accounts. ", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(AccountService, "findAccountsForRole").resolves([account, account]);

            await expect(RoleService.remove(faker.random.number(4), account)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ROLE_IN_USE);
        })

        it("should successfully remove role", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(AccountService, "findAccountsForRole").resolves([])
            const removeRoleStub = sandbox.stub(RoleRepo, "remove").resolves(role);

            await expect(RoleService.remove(faker.random.number(4), account)).to.be.eventually.fulfilled;
            expect(removeRoleStub).to.be.calledOnce;
        })
    });

    describe("Modify role", () => {
        it("should throw ForbiddenError if account does not have permission to modify roles", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(false);

            await expect(RoleService.modify(1, modifyRoleDTO, account)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
        });

        it("should throw BadRequestError if modify role DTO is invalid", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            const dto: Partial<ModifyRoleDTO> = { ...modifyRoleDTO, name: undefined };

            await expect(RoleService.modify(1, dto as ModifyRoleDTO, account)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
        });

        it("should throw BadRequestError if permissionIds length is less than 1", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            const dto: Partial<ModifyRoleDTO> = { ...modifyRoleDTO, permissionIds: [] };

            await expect(RoleService.modify(1, dto as ModifyRoleDTO, account)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
        });

        it("should throw NotFoundError if role to modify does not exist", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(undefined);

            await expect(RoleService.modify(1, modifyRoleDTO, account)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ROLE_NOT_FOUND);
        })

        it("should throw NotFoundError if any of the permissions does not exist", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(PermissionRepo, "findById").resolves(undefined);

            await expect(RoleService.modify(1, modifyRoleDTO, account)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.PERMISSION_NOT_FOUND);
        })

        it("should successfully modify role", async () => {
            sandbox.stub(AccountService, "hasPermission").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(PermissionRepo, "findById").resolves(permission);
            const updateRoleStub = sandbox.stub(RoleRepo, "update").resolves(role);

            await expect(RoleService.modify(1, modifyRoleDTO, account)).to.be.eventually.fulfilled;
            expect(updateRoleStub).to.be.calledOnce;
        })
    })
})