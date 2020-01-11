import moment from "moment";
import "./db-setup";
import { expect } from "../setup";
import { user, faker, role } from "../data.factory";
import { UserRepo } from "../../src/user/user.repository";
import { UserModel } from "../../src/user/user.model";
import { PermissionModel } from "../../src/permission/permission.model";
import { RoleModel } from "../../src/role/role.model";


describe("User Repository", () => {

    let newUser: UserModel;

    beforeEach(async () => {
        const permissions = await PermissionModel.query();
        const roleOne = await RoleModel.query().insertGraphAndFetch({
            ...role,
            id: 1,
            permissions
        }, {relate: true})

        const roleTwo = await RoleModel.query().insertGraphAndFetch({
            ...role, 
            id: 2,
            name: faker.name.jobTitle(),
            permissions: [...role.permissions.slice(0, 3)]
        }, {relate: true})

        newUser = {...user, id: 99999, roles: [roleOne, roleTwo]} as UserModel
    })

    it("should save user", async () => {
        const saved = await UserRepo.insert(newUser);
        expect(saved).to.be.not.undefined;
        expect(saved.id).to.not.be.equal(0);
        expect(saved.id).to.not.be.equal(newUser.id);
        expect(saved.firstName).to.not.be.null;
        expect(saved.lastName).to.not.be.null;
        expect(saved.verifiedAt).to.be.null;
        expect(saved.lastLoginAt).to.be.null;
        expect(saved.createdAt).to.not.be.null;
        expect(saved.updatedAt).to.not.be.null;
        expect(saved.enabled).to.be.true;
        expect(saved.roles).to.have.an("array");
        expect(saved.roles).to.have.length(2);
    })

    it("should find all users", async () => {
        for(let i = 0; i < 3; i++){
            await UserRepo.insert({
                ...newUser,
                email: faker.internet.email(),
                phoneNumber: faker.phone.phoneNumber()
            } as UserModel)
        }

        const users = await UserRepo.findAll();

        expect(users).to.not.be.undefined;
        expect(users).to.be.an("array");
        expect(users).to.have.length(3);
        expect(users[0].roles).to.not.be.empty;
    })

    it("should find user by oauthId", async () => {
        const oauthId = faker.random.uuid();
        const saved = await UserRepo.insert({...newUser, oauthId} as UserModel);

        const found = await UserRepo.findByOauthId(oauthId);
        
        expect(found).to.not.be.undefined;
        expect(found).to.deep.equal(saved);
    })

    it("should find user by email", async () => {
        const saved = await UserRepo.insert(newUser);

        const found = await UserRepo.findByEmail(newUser.email);

        expect(found).to.not.be.undefined;
        expect(found).to.deep.equal(saved);
    })

    it("should update user", async () => {
        const createdAt = moment().subtract(1, "day").toISOString();
        const verifiedAt = moment().toISOString();
        const lastLoginAt = moment().subtract(2, "days").toISOString();
        
        const saved = await UserRepo.insert({...newUser, roles: [...newUser.roles.slice(0, 1)]} as UserModel);

        const updated = await UserRepo.update({
            id: saved.id,
            enabled: false,
            createdAt,
            verifiedAt,
            lastLoginAt
        })


        expect(updated).to.not.be.undefined;
        expect(updated.enabled).to.be.false;
        expect(updated.roles).to.not.be.undefined;
        expect(updated.roles).to.have.an("array");
        expect(updated.roles).to.have.length(1);
        expect(moment(updated.verifiedAt).toISOString()).to.be.equal(moment(verifiedAt).toISOString());
        expect(moment(updated.lastLoginAt).toISOString()).to.be.equal(moment(lastLoginAt).toISOString());
        expect(moment(updated.createdAt).toISOString()).to.be.not.equal(moment(createdAt).toISOString())
    })
})