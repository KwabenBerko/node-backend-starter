// import moment from "moment";
// import "./db-setup";
// import { expect } from "../setup";
// import { user, faker } from "../data.factory";
// import { UserRepo } from "../../src/user/user.repository";
// import { User } from "../../src/user/user.model";

// console.log("User Repo");

// describe("User Repository", () => {
//     it("should save user", async () => {
//         const newUser: User = {...user};
//         const savedUser = await UserRepo.insert(newUser);
//         expect(savedUser).to.be.not.undefined;
//     })

//     it("should find all users", async () => {
//         for(let i = 0; i < 3; i++){
//             await UserRepo.insert({
//                 ...user,
//                 email: faker.internet.email(),
//                 phoneNumber: faker.phone.phoneNumber()
//             })
//         }

//         const users = await UserRepo.findAll();

//         expect(users).to.not.be.undefined;
//         expect(users).to.be.an("array");
//         expect(users).to.have.length(3);
//     })

//     it("should find user by oauthId", async () => {
//         const newUser: User = {...user, oauthId: faker.random.uuid()};
//         await UserRepo.insert(newUser);

//         const savedUser = await UserRepo.findByOauthId(newUser.oauthId);
        
//         expect(savedUser).to.not.be.undefined;
//         expect(savedUser.firstName).to.be.equal(newUser.firstName)
//         expect(savedUser.lastName).to.be.equal(newUser.lastName);
//     })

//     it("should find users by email", async () => {
//         const newUser = {...user}
//         await UserRepo.insert(newUser);

//         const savedUser = await UserRepo.findByEmail(newUser.email);

//         expect(savedUser).to.not.be.undefined;
//         expect(savedUser.firstName).to.be.equal(newUser.firstName);
//         expect(savedUser.lastName).to.be.equal(newUser.lastName);
//     })

//     it("should update user", async () => {
//         const createdAt = moment().toISOString();
//         const verifiedAt = moment().toISOString();
//         const lastLoginAt = moment().subtract(2, "days").toISOString();
        
//         const savedUser = await UserRepo.insert({...user});

//         const updatedUser = await UserRepo.update({
//             id: savedUser.id,
//             enabled: false,
//             createdAt,
//             verifiedAt,
//             lastLoginAt
//         })


//         expect(updatedUser).to.not.be.undefined;
//         expect(updatedUser.enabled).to.be.false;
//         expect(moment(updatedUser.verifiedAt).toISOString()).to.be.equal(moment(verifiedAt).toISOString());
//         expect(moment(updatedUser.lastLoginAt).toISOString()).to.be.equal(moment(lastLoginAt).toISOString());
//         expect(moment(updatedUser.createdAt).toISOString()).to.be.not.equal(moment(createdAt).toISOString())
//     })
// })