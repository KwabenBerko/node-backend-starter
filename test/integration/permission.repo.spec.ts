import { PermissionRepo } from "../../src/permission/permission.repository"
import { expect } from "../setup";
import { Permissions } from "../../src/shared/util/constant.util";

describe("Permission Repository", () => {
    it("should find all permissions", async () => {
        //Total number of permissions comes from the PermissionConstants Object in constant.util.ts
        const permissions = await PermissionRepo.findAll();

        expect(permissions).to.not.be.undefined;
        expect(permissions).to.be.an("array");
        expect(permissions).to.have.length(7);
    })

    it("should permission by id", async () => {
        //Permission with id of 1 is the READ_USERS permission according to the constant.util.ts file.
        const permission = await PermissionRepo.findById(1);

        expect(permission).to.be.not.undefined;
        expect(permission.name).to.be.equal(Permissions.READ_USERS);
    })
})