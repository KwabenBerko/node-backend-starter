import { sandbox, expect } from "../setup";
import { role, createRoleDTO, user, permission, faker, modifyRoleDTO } from "../data.factory";
import { RoleService } from "../../../src/role/role.service";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { CreateRoleDTO } from "../../../src/role/dto/create-role.dto";
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { ConflictError } from "../../../src/shared/errors/conflict.error";
import { RoleRepo } from "../../../src/role/role.repository";
import { NotFoundError } from "../../../src/shared/errors/not-found.error";
import { PermissionRepo } from "../../../src/role/permission.repository";
import { ForbiddenError } from "../../../src/shared/errors/forbidden.error";
import { UserService } from "../../../src/user/user.service";
import { ModifyRoleDTO } from "../../../src/role/dto/modify-role.dto";

describe("Role Service", () => {

    describe("Find all roles", () => {
        it("should throw ForbiddenError if user does not have permission to read roles", async () => {
            const hasPermissionToStub = sandbox.stub(UserService, "hasPermissionTo").returns(false);

            await expect(RoleService.findAll(user)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
            expect(hasPermissionToStub).to.be.calledOnce;
        })

        it("should successfully find all roles", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            const findAllStub = sandbox.stub(RoleRepo, "findAll").resolves([role]);

            await expect(RoleService.findAll(user)).to.be.eventually.fulfilled;
            expect(findAllStub).to.be.calledOnce;
        })
    })

    describe("Add role", () => {

        it("should throw ForbiddenError if user does not have permission to add roles", async () => {
            const hasPermissionToStub = sandbox.stub(UserService, "hasPermissionTo").returns(false);

            await expect(RoleService.add(createRoleDTO, user)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
            expect(hasPermissionToStub).to.be.calledOnce;
        })

        it("should throw BadRequestError if create role DTO is invalid", async () => {
            sandbox.stub(UserService, "hasPermissionTo").resolves(true);
            const dto: Partial<CreateRoleDTO> = { ...createRoleDTO, permissionIds: undefined };

            await expect(RoleService.add(dto as CreateRoleDTO, user)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        });

        it("should throw BadRequestError if permissions length is less than 1", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);

            const dto: Partial<CreateRoleDTO> = { ...createRoleDTO, permissionIds: [] };

            await expect(RoleService.add(dto as CreateRoleDTO, user)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PERMISSIONS_LENGTH);
        })

        it("should throw ConflictError if role already exists by name", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            const findByNameStub = sandbox.stub(RoleRepo, "findByName").resolves(role);

            await expect(RoleService.add(createRoleDTO, user)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ROLE_ALREADY_EXISTS);
            expect(findByNameStub).to.be.calledOnce;
        })

        it("should throw NotFoundError if permission does not exist by id", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findByName").resolves(undefined);
            const findPermissionStub = sandbox.stub(PermissionRepo, "findById").resolves(undefined)

            await expect(RoleService.add(createRoleDTO, user)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.PERMISSION_NOT_FOUND);
            expect(findPermissionStub).to.be.calledThrice;
        })

        it("should successfully add role", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(PermissionRepo, "findById").resolves(permission);
            sandbox.stub(RoleRepo, "findByName").resolves(undefined);
            const insertRoleStub = sandbox.stub(RoleRepo, "insert").resolves(role);

            await expect(RoleService.add(createRoleDTO, user)).to.be.eventually.fulfilled;
            expect(insertRoleStub).to.be.calledOnce;
        })
    })

    describe("Remove role", () => {
        it("should throw ConflictError if user does not have permissions to delete roles", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(false);

            await expect(RoleService.remove(faker.random.number(4), user)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
        })

        it("should throw NotFoundError if role is not found", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(undefined);
            const removeRoleStub = sandbox.stub(RoleRepo, "remove").resolves(role);

            await expect(RoleService.remove(faker.random.number(4), user)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ROLE_NOT_FOUND);
            expect(removeRoleStub).to.not.be.calledOnce;
        });

        it("should throw ConflictError if role is still in use by other accounts. ", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(UserService, "findUsersForRole").resolves([user, user]);

            await expect(RoleService.remove(faker.random.number(4), user)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ROLE_IN_USE);
        })

        it("should successfully remove role", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(UserService, "findUsersForRole").resolves([])
            const removeRoleStub = sandbox.stub(RoleRepo, "remove").resolves(role);

            await expect(RoleService.remove(faker.random.number(4), user)).to.be.eventually.fulfilled;
            expect(removeRoleStub).to.be.calledOnce;
        })
    });

    describe("Modify role", () => {
        it("should throw ForbiddenError if user does not have permission to modify roles", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(false);

            await expect(RoleService.modify(1, modifyRoleDTO, user)).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
        });

        it("should throw BadRequestError if modify role DTO is invalid", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            const dto: Partial<ModifyRoleDTO> = { ...modifyRoleDTO, name: undefined };

            await expect(RoleService.modify(1, dto as ModifyRoleDTO, user)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
        });

        it("should throw BadRequestError if permissionIds length is less than 1", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            const dto: Partial<ModifyRoleDTO> = { ...modifyRoleDTO, permissionIds: [] };

            await expect(RoleService.modify(1, dto as ModifyRoleDTO, user)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
        });

        it("should throw NotFoundError if role to modify does not exist", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(undefined);

            await expect(RoleService.modify(1, modifyRoleDTO, user)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ROLE_NOT_FOUND);
        })

        it("should throw NotFoundError if any of the permissions does not exist", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(PermissionRepo, "findById").resolves(undefined);

            await expect(RoleService.modify(1, modifyRoleDTO, user)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.PERMISSION_NOT_FOUND);
        })

        it("should successfully modify role", async () => {
            sandbox.stub(UserService, "hasPermissionTo").returns(true);
            sandbox.stub(RoleRepo, "findById").resolves(role);
            sandbox.stub(PermissionRepo, "findById").resolves(permission);
            const updateRoleStub = sandbox.stub(RoleRepo, "update").resolves(role);

            await expect(RoleService.modify(1, modifyRoleDTO, user)).to.be.eventually.fulfilled;
            expect(updateRoleStub).to.be.calledOnce;
        })
    })
})