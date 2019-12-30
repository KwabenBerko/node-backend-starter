import {sandbox, faker, expect} from "./setup";
import {RoleService } from "../../../src/role/role.service";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { CreateRoleDTO } from "../../../src/role/dto/create-role.dto";
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";

let createRoleDTO: Partial<CreateRoleDTO>;

beforeEach(() => {
    createRoleDTO = {
        name: "Administrator",
        permissionIds: [2, 5, 1, 9]
    }
})

describe("Role Service", () => {
    describe("Add role", () => {
        it("should throw BadRequestError if create role DTO is invalid", async () => {
            createRoleDTO.permissionIds = undefined

            await expect(RoleService.add(createRoleDTO as CreateRoleDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })
    })
})