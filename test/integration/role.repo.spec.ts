import "./db-setup";
import _ from "lodash";
import { role, faker } from "../data.factory";
import { RoleModel } from "../../src/role/role.model";
import { RoleRepo } from "../../src/role/role.repository";
import { PermissionModel } from "../../src/permission/permission.model";
import { expect } from "../setup";

describe("Role Repository", () => {

    let newRole: RoleModel;

    beforeEach(async () => {
        const permissions = await PermissionModel.query();
        newRole = {...role, id: 9999, permissions} as RoleModel;
    })

    it("should save role", async () => {
        const saved = await RoleRepo.insert(newRole);
        expect(saved).to.not.be.undefined;
        expect(saved.id).to.not.be.equal(0);
        expect(saved.id).to.not.be.equal(newRole.id);
        expect(saved.name).to.be.equal(newRole.name);
        expect(saved.createdAt).to.not.be.equal(newRole.createdAt);
        expect(saved.updatedAt).to.not.be.equal(newRole.updatedAt);
    })

    it("should find all roles", async () => {
        for(let i = 0; i < 2; i++){
            await RoleRepo.insert({
                ...newRole,
                name: faker.name.jobTitle() 
            } as RoleModel);
        }

        const roles = await RoleRepo.findAll();
        expect(roles).to.not.be.undefined;
        expect(roles).to.have.an("array");
        expect(roles).to.have.length(2);
        expect(roles[0].permissions).to.not.be.empty;
    })

    it("should find by name", async () => {
        const saved = await RoleRepo.insert(newRole);

        const found = await RoleRepo.findByName(saved.name);

        expect(found).to.not.be.undefined;
        expect(found).to.be.deep.equal(saved);
    })

    it("should find by id", async () => {
        const saved = await RoleRepo.insert(newRole);

        const found = await RoleRepo.findById(saved.id);

        expect(found).to.not.be.undefined;
        expect(found).to.be.deep.equal(saved);
    })

    it("should update role", async () => {
        const saved = await RoleRepo.insert(newRole);

        const updated = await RoleRepo.update({
            ...saved,
            name: faker.name.jobTitle(),
            permissions: [...saved.permissions.slice(0, 1)]
        } as RoleModel)

        expect(updated.name).to.not.be.equal(saved.name);
        expect(updated.permissions).to.not.be.undefined;
        expect(updated.permissions).to.have.length(1);
    })

    it("should remove role", async () => {
        const saved = await RoleRepo.insert(newRole);

        await RoleRepo.remove(saved);

        expect(await RoleRepo.findById(saved.id)).to.be.undefined;
    })
});