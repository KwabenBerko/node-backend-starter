import { PermissionRepo } from "../../../src/permission/permission.repository"
import { sandbox, expect } from "../../setup"
import { PermissionService } from "../../../src/permission/permission.service";

describe("Permission Service", () => {

    it("should successfully find all permissions of the platform", async () => {
        const findAllStub = sandbox.stub(PermissionRepo, "findAll").resolves([]);

        await expect(PermissionService.findAll()).to.be.eventually.fulfilled;
        expect(findAllStub).to.be.calledOnce;
    })

})