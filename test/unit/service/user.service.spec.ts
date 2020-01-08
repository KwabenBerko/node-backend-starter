import { sandbox, expect } from "../../setup";
import { faker, user, registerAccountDTO, loginDTO, oauthLoginDTO, resetPasswordDTO, resetPasswordToken, verificationToken, role, permission } from "../../data.factory";
import { UserService } from "../../../src/user/user.service";
import { UserModel } from "../../../src/user/user.model";
import { permissionContants } from "../../../src/shared/util/constant.util";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { PasswordHasherUtil } from "../../../src/shared/util/password-hasher.util";
import { RegisterUserDTO } from "../../../src/user/dto/register-user.dto"
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { ConflictError } from "../../../src/shared/errors/conflict.error";
import { LoginDTO } from "../../../src/user/dto/login.dto";
import { OauthLoginDTO } from "../../../src/user/dto/oauth-login.dto";
import { NotFoundError } from "../../../src/shared/errors/not-found.error";
import { ResetPasswordDTO } from "../../../src/user/dto/reset-password.dto";
import { UnAuthorizedError } from "../../../src/shared/errors/unauthorized.error";
import { ForbiddenError } from "../../../src/shared/errors/forbidden.error";
import { RoleService } from "../../../src/role/role.service";
import { QueryBuilderType } from "objection";
import { VerificationTokenModel } from "../../../src/user/verification-token.model";


let userModelStub: Partial<QueryBuilderType<UserModel>>;
let verificationModelStub: Partial<QueryBuilderType<VerificationTokenModel>>;

beforeEach(() => {
    userModelStub = {
        findOne: undefined,
        findById: undefined,
        insert: undefined,
        patchAndFetchById: undefined
    }

    verificationModelStub = {
        findOne: undefined,
        insert: undefined,
        delete: undefined
    }

    sandbox.stub(UserModel, "query").returns(userModelStub as any);
    sandbox.stub(VerificationTokenModel, "query").returns(verificationModelStub as any);
})


describe("User Service", () => {
    describe("Register With Email", () => {
        it("should throw BadRequestError if register DTO object is invalid", async () => {

            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, email: undefined, password: undefined, confirmPassword: undefined };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw BadRequestError if firstName is invalid", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, firstName: faker.internet.ipv6() };


            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FIRST_NAME)
        })

        it("should throw BadRequestError if lastName is invalid", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, lastName: faker.phone.phoneNumber() };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_LAST_NAME)
        })

        it("should throw BadRequestError if gender is invalid", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, gender: "r" };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_GENDER)
        })

        it("should throw BadRequestError if email is invalid", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, email: faker.lorem.lines(1) };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_EMAIL_ADDRESS)
        })

        it("should throw BadRequestError if phone number is invalid", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, phoneNumber: "76112209" };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PHONE_NUMBER)
        })

        it("should throw BadRequestError if password is invalid", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, password: "pass" };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PASSWORD)
        })

        it("should throw BadRequestError if password and confirmPassword are not equal", async () => {
            const dto: Partial<RegisterUserDTO> = { ...registerAccountDTO, password: "passwo", confirmPassword: "password" };

            await expect(UserService.register(dto as RegisterUserDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.PASSWORDS_DO_NOT_MATCH)
        })

        it("should throw ConflictError if user already exists", async () => {

            userModelStub.findOne = sandbox.stub().resolves(user);

            await expect(UserService.register(registerAccountDTO)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.USER_ALREADY_EXISTS)
            expect(userModelStub.findOne).to.be.calledOnce
        })

        it("should successfully create user", async () => {
            userModelStub.findOne = sandbox.stub().resolves(undefined),
            userModelStub.insert = sandbox.stub().resolves(undefined)

            const hashPasswordStub = sandbox.stub(PasswordHasherUtil, "hashPassword").resolves(faker.random.uuid())

            await expect(UserService.register(registerAccountDTO))
                .to.be.eventually.fulfilled;
            expect(userModelStub.findOne).to.be.calledOnce;
            expect(userModelStub.insert).to.be.calledOnce;
            expect(hashPasswordStub).to.be.calledOnce;
        })

    })


    describe("Login With Email", () => {
        
        it("should throw BadRequestError if login DTO object is invalid", async () => {
            const dto: Partial<LoginDTO> = { ...loginDTO, email: undefined };

            await expect(UserService.login(dto as LoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw UnAuthorizedError if user does not exist", async () => {
            userModelStub.findOne = sandbox.stub().resolves(undefined);

            await expect(UserService.login(loginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_CREDENTIALS)
            expect(userModelStub.findOne).to.be.calledOnce;

        })


        it("should throw UnAuthorizedError if credentials is invalid", async () => {
            userModelStub.findOne = sandbox.stub().resolves(user);
            const comparePasswordStub = sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(false);

            await expect(UserService.login(loginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_CREDENTIALS)
            expect(userModelStub.findOne).to.be.calledOnce
            expect(comparePasswordStub).to.be.calledOnce
        })

        it("should successfully login user", async () => {
            userModelStub.findOne = sandbox.stub().resolves(user);
            userModelStub.patchAndFetchById = sandbox.stub().resolves(user);

            const comparePasswordStub = sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            const promise = UserService.login(loginDTO);
            await expect(promise).to.be.eventually.fulfilled;
            expect(userModelStub.findOne).to.be.calledOnce;
            expect(comparePasswordStub).to.be.calledOnce;
            expect(userModelStub.patchAndFetchById).to.be.calledOnce;
            expect(await promise).to.be.equal(user);
        })

        it("should throw UnAuthorizedError if user is disabled", async () => {
            userModelStub.findOne = sandbox.stub().resolves({ ...user, enabled: false } as UserModel);
            sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            await expect(UserService.login(loginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.USER_DISABLED)
        })

        it("should throw UnAuthorizedError if user has not been verified", async () => {
            userModelStub.findOne = sandbox.stub().resolves({ ...user, verifiedAt: undefined } as UserModel);
            sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            await expect(UserService.login(loginDTO as LoginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.USER_NOT_VERIFIED)
        })
    })

    describe("Oauth Login", () => {
        it("should throw BadRequestError if oauth login DTO object is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, oauthId: undefined };

            await expect(UserService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw BadRequestError if firstName is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, firstName: faker.internet.ipv6() };

            await expect(UserService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FIRST_NAME)
        })

        it("should throw BadRequestError if lastName is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, lastName: faker.internet.ip() }

            await expect(UserService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_LAST_NAME)
        })

        it("should throw BadRequestError if oauth provider is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, oauthProvider: "microsoft" };

            await expect(UserService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_OAUTH_PROVIDER)
        })

        it("should create user and login if the oauthId does not exist", async () => {
            userModelStub.findOne = sandbox.stub().resolves(undefined);
            userModelStub.insert = sandbox.stub().resolves(user);

            const promise = UserService.oauthLogin(oauthLoginDTO)
            await expect(promise).to.be.fulfilled
            expect(await promise).to.be.equal(user)
            expect(userModelStub.findOne).to.be.calledOnce
            expect(userModelStub.insert).to.be.calledOnce
        })

        it("should login if oauthId already exist", async () => {
            userModelStub.findOne = sandbox.stub().resolves(user);
            userModelStub.patchAndFetchById = sandbox.stub().resolves(user);
            userModelStub.insert = sandbox.stub().resolves();
      
            const promise = UserService.oauthLogin(oauthLoginDTO)
            await expect(promise).to.be.fulfilled
            expect(await promise).to.be.equal(user)
            expect(userModelStub.findOne).to.be.calledOnce
            expect(userModelStub.patchAndFetchById).to.be.calledOnce;
            expect(userModelStub.insert).to.not.be.called
        })

        it("should throw UnAuthorizedError if user is disabled", async () => {
            userModelStub.findOne = sandbox.stub().resolves({ ...user, enabled: false } as UserModel);

            await expect(UserService.oauthLogin(oauthLoginDTO as OauthLoginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.USER_DISABLED)
            expect(userModelStub.findOne).to.be.calledOnce;
        })
   })

    describe("Generate Verification Token", () => {

        it("should throw NotFoundError if user is not found", async () => {
            userModelStub.findById = sandbox.stub().resolves(undefined);
            
            await expect(UserService.generateVerificationTokenForUser(1)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.USER_NOT_FOUND)
            expect(userModelStub.findById).to.be.calledOnce
        })

        it("should throw ConflictError if user is already verified", async () => {
            userModelStub.findById = sandbox.stub().resolves(user);

            await expect(UserService.generateVerificationTokenForUser(1)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.USER_ALREADY_VERIFIED)
            expect(userModelStub.findById).to.be.calledOnce
        })

        it("should create a 4 digit verification token ", async () => {
            userModelStub.findById = sandbox.stub().resolves({ ...user, verifiedAt: undefined } as UserModel)
            verificationModelStub.findOne = sandbox.stub().resolves(undefined);
            verificationModelStub.insert = sandbox.stub().resolves(verificationToken);
            
            const createdToken = await UserService.generateVerificationTokenForUser(1);

            expect(createdToken.token.length).to.be.equal(4);
            expect(typeof createdToken.expiresOn).to.be.equal("string");
            expect(verificationModelStub.insert).to.be.calledOnce;
        })

        it("should generate a unique verification token", async () => {
            userModelStub.findById = sandbox.stub().resolves({ ...user, verifiedAt: undefined } as UserModel);
            verificationModelStub.findOne = sandbox.stub()
            .onFirstCall().resolves(undefined)
            .onSecondCall().resolves(verificationToken)
            .onThirdCall().resolves(verificationToken)
            .onCall(4).resolves(undefined);

            verificationModelStub.insert = sandbox.stub().resolves(verificationToken);

            await expect(UserService.generateVerificationTokenForUser(1)).to.be.eventually.fulfilled;
            expect(verificationModelStub.findOne).to.be.callCount(4);
        })

//         it("should delete any existing verification token record before creating a new one.", async () => {
//             sandbox.stub(UserRepo, "findById").resolves({ ...user, verifiedAt: undefined } as UserModel)
//             sandbox.stub(VerificationTokenRepo, "findByUserId").resolves(verificationToken)
//             sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);
//             const removeVerificationTokenStub = sandbox.stub(VerificationTokenRepo, "remove").resolves();
//             const addVerificationTokenStub = sandbox.stub(VerificationTokenRepo, "insert").resolves(verificationToken);

//             await expect(UserService.generateVerificationTokenForUser(1)).to.be.eventually.fulfilled;
//             expect(removeVerificationTokenStub).to.be.calledOnce
//             expect(addVerificationTokenStub).to.be.calledOnce
//         })

//     })

//     describe("Verify user", () => {
//         const token = String(faker.random.number({ min: 4, max: 4 }));

//         it("should throw BadRequestError if record with this token does not exist", async () => {
//             const findTokenStub = sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);

//             await expect(UserService.verifyUser(token)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_VERIFICATION_TOKEN);
//             expect(findTokenStub).to.be.calledOnce;
//         })

//         it("should throw BadRequestError if token has expired", async () => {
//             const date = new Date();
//             date.setMinutes(date.getMinutes() - 15)

//             sandbox.stub(VerificationTokenRepo, "findByToken").resolves({
//                 ...verificationToken, expiresOn: date.toISOString()
//             });

//             await expect(UserService.verifyUser(token)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_VERIFICATION_TOKEN);
//         })

//         it("should verify user", async () => {
//             const date = new Date();
//             date.setMinutes(date.getMinutes() + 20);

//             sandbox.stub(VerificationTokenRepo, "findByToken").resolves({
//                 ...verificationToken, expiresOn: date.toISOString()
//             });

//             const findUserStub = sandbox.stub(UserRepo, "findById").resolves(user);
//             const updateUserStub = sandbox.stub(UserRepo, "update").resolves(user);
//             const removeTokenStub = sandbox.stub(VerificationTokenRepo, "remove").resolves(verificationToken);

//             await expect(UserService.verifyUser(token)).to.be.eventually.fulfilled;
//             expect(findUserStub).to.have.been.calledOnce;
//             expect(updateUserStub).to.have.been.calledOnce;
//             expect(removeTokenStub).to.be.calledOnce;
//         })
//     })

//     describe("Generate Reset Password Token", () => {

//         it("should throw NotFoundError if user is not found", async () => {
//             const findUserStub = sandbox.stub(UserRepo, "findById").resolves(undefined)

//             await expect(UserService.generateResetPasswordTokenForUser(1)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.USER_NOT_FOUND)
//             expect(findUserStub).to.be.calledOnce
//         })

//         it("should create a 4 digit reset password token", async () => {
//             sandbox.stub(UserRepo, "findById").resolves(user)
//             sandbox.stub(ResetPasswordTokenRepo, "findByUserId").resolves(undefined)
//             sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);
//             const addResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "insert").resolves(resetPasswordToken);

//             const createdToken = await UserService.generateResetPasswordTokenForUser(1);

//             expect(createdToken.token.length).to.be.equal(4);
//             expect(typeof createdToken.expiresOn).to.be.equal("string");
//             expect(addResetPasswordTokenStub).to.be.calledOnce;
//         })

//         it("should generate a unique reset password token", async () => {
//             sandbox.stub(UserRepo, "findById").resolves(user);
//             sandbox.stub(ResetPasswordTokenRepo, "findByUserId").resolves(undefined);
//             sandbox.stub(ResetPasswordTokenRepo, "insert").resolves(resetPasswordToken);
//             const findTokenStub = sandbox.stub(ResetPasswordTokenRepo, "findByToken")
//                 .onFirstCall().resolves(resetPasswordToken)
//                 .onSecondCall().resolves(resetPasswordToken)
//                 .onThirdCall().resolves(undefined);

//             await expect(UserService.generateResetPasswordTokenForUser(1)).to.be.eventually.fulfilled;
//             expect(findTokenStub).to.be.calledThrice;
//         })

//         it("should delete any existing reset password token record before creating a new one", async () => {
//             sandbox.stub(UserRepo, "findById").resolves(user)
//             sandbox.stub(ResetPasswordTokenRepo, "findByUserId").resolves(resetPasswordToken)
//             sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);

//             const removeResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "remove").resolves()
//             const addResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "insert").resolves(verificationToken);


//             await expect(UserService.generateResetPasswordTokenForUser(1)).to.be.eventually.fulfilled;
//             expect(removeResetPasswordTokenStub).to.be.calledOnce
//             expect(addResetPasswordTokenStub).to.be.calledOnce
//         })

//     })

//     describe("Reset Password", () => {
//         it("should throw BadRequestError if reset password DTO is invalid", async () => {
//             const dto: Partial<ResetPasswordDTO> = { ...resetPasswordDTO, confirmPassword: undefined }

//             await expect(UserService.resetPassword(dto as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
//         })

//         it("should throw BadRequestError if password is invalid", async () => {
//             const dto: Partial<ResetPasswordDTO> = { ...resetPasswordDTO, password: faker.internet.password(4) }

//             await expect(UserService.resetPassword(dto as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PASSWORD);
//         })

//         it("should throw BadRequestError if password and confirm password values do not match", async () => {
//             const dto: Partial<ResetPasswordDTO> = { ...resetPasswordDTO, password: faker.internet.password(9) }

//             await expect(UserService.resetPassword(dto as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.PASSWORDS_DO_NOT_MATCH);
//         })

//         it("should throw BadRequestError if token is invalid", async () => {
//             sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);

//             await expect(UserService.resetPassword(resetPasswordDTO as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_RESET_PASSWORD_TOKEN);
//         })

//         it("should throw BadRequestError if token has expired", async () => {
//             const date = new Date();
//             date.setMinutes(date.getMinutes() - 60);

//             sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves({ ...resetPasswordToken, expiresOn: date.toISOString() });

//             await expect(UserService.resetPassword(resetPasswordDTO as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_RESET_PASSWORD_TOKEN);
//         })

//         it("should reset password", async () => {
//             const date = new Date();
//             date.setMinutes(date.getMinutes() + 15)

//             sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves({ ...resetPasswordToken, expiresOn: date.toISOString() });

//             const findUserStub = sandbox.stub(UserRepo, "findById").resolves(user);
//             const updateUserStub = sandbox.stub(UserRepo, "update").resolves(user);
//             const hashPasswordStub = sandbox.stub(PasswordHasherUtil, "hashPassword").resolves(faker.random.uuid());

//             await expect(UserService.resetPassword(resetPasswordDTO as ResetPasswordDTO)).to.be.eventually.fulfilled;
//             expect(findUserStub).to.be.calledOnce;
//             expect(updateUserStub).to.be.calledOnce;
//             expect(hashPasswordStub).to.be.calledOnce;
//         })
//     })

//     describe("Find accounts for role", () => {
//         it("should return all accounts for the specified role", async () => {
//             const userOne: UserModel = {
//                 ...user,
//                 roles: [
//                     { ...role, id: 5 }
//                 ]
//             } as UserModel;

//             const userTwo: UserModel = {
//                 ...user,
//                 roles: [
//                     { ...role, id: 3 }
//                 ]
//             } as UserModel;

//             const accountThree: UserModel = {
//                 ...user,
//                 roles: [
//                     { ...role, id: 5 }
//                 ]
//             } as UserModel;


//             sandbox.stub(UserRepo, "findAll").resolves([userOne, userTwo, accountThree])

//             const promise = UserService.findUsersForRole({ ...role, id: 5 });
//             await expect(promise).to.be.eventually.fulfilled;
//             expect(await promise).to.have.length(2);
//         })
//     })

//     describe("Has permission", () => {
//         it("should return false if roles length is less than 1", async () => {

//             expect(UserService.hasPermissionTo({
//                 permission: "",
//                 user: { ...user, roles: [] } as Partial<UserModel> as UserModel
//             })).to.be.false;

//         })

//         it("should return false if user does not have permission", async () => {

//             expect(UserService.hasPermissionTo({
//                 permission: permissionContants.READ_ROLES, 
//                 user: { ...user, roles: [role] } as UserModel
//             })).to.be.false;

//         })

//         it("should return true if user has permission", async () => {
//             const permissionName = permissionContants.READ_ROLES;

//             expect(UserService.hasPermissionTo({
//                 permission: permissionName, 
//                 user: {
//                     ...user,
//                     roles: [
//                         {
//                             ...role, permissions: [
//                                 { ...permission, name: permissionName }
//                             ]
//                         }
//                     ]
//                 } as UserModel
//             })).to.be.true;

//         })
//     })

//     describe("Get Profile", () => {
//         it("should throw ForbiddenError if userId does not belong to the current user and does not have permission to view other's profile", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(false);

//             await expect(UserService.getProfile({
//                 userId: 12,
//                 currentUser: { ...user, id: 3 } as UserModel
//             })).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
//         })

//         it("should successfully return user's profile if the userId belongs to the current user", async () => {
//             const userId = 10;
//             const findByIdStub = sandbox.stub(UserRepo, "findById").resolves(user)

//             const promise = UserService.getProfile({
//                 userId: userId, 
//                 currentUser: { ...user, id: userId } as UserModel
//             });
//             await expect(promise).to.be.eventually.fulfilled;

//             expect(await promise).to.be.not.undefined;
//             expect(findByIdStub).to.be.calledOnce;
//         })

//         it("should successfully return user's profile if the userId does not belong to the current user, but has permission to view other's profile", async () => {
//             const findByIdStub = sandbox.stub(UserRepo, "findById").resolves(user)
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);

//             const promise = UserService.getProfile({
//                 userId: 12, 
//                 currentUser: { ...user, id: 27 } as UserModel
//             });
//             await expect(promise).to.be.eventually.fulfilled;

//             expect(await promise).to.be.not.undefined;
//             expect(findByIdStub).to.be.calledOnce;
//         })
//     })

//     describe("Update Profile", () => {
//         it("should throw ForbiddenError if userId does not belong to the current user and does not have permission to update other's profile", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(false);

//             await expect(UserService.getProfile({
//                 userId: 12,
//                 currentUser: { ...user, id: 3 } as UserModel
//             })).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
//         })

//     })

//     describe("Assign role to user", () => {
//         it("should throw ForbiddenError if user does not have permission to assign roles to users", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(false);

//             await expect(UserService.assignRoleToUser({
//                 roleId: 1,
//                 userId: 5,
//                 currentUser: user
//             })).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
//         })

//         it("should throw NotFoundError if role to assign does not exist", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);
//             const findRoleStub = sandbox.stub(RoleService, "findById").resolves(undefined);

//             await expect(UserService.assignRoleToUser({
//                 roleId: 1,
//                 userId: 4, 
//                 currentUser: user
//             })).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ROLE_NOT_FOUND);

//             expect(findRoleStub).to.be.calledOnce;
//         })

//         it("should throw NotFoundError if user to assign to does not exist", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);
//             sandbox.stub(RoleService, "findById").resolves(role);
//             const findUserStub = sandbox.stub(UserRepo, "findById").resolves(undefined);

//             await expect(UserService.assignRoleToUser({
//                 roleId: 1,
//                 userId: 4, 
//                 currentUser: user
//             })).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.USER_NOT_FOUND);

//             expect(findUserStub).to.be.calledOnce;
//         });

//         it("should successfully assign role to user", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);
//             sandbox.stub(RoleService, "findById").resolves(role);
//             sandbox.stub(UserRepo, "findById").resolves(user);
//             const updateUserStub = sandbox.stub(UserRepo, "update").resolves(user);

//             await expect(UserService.assignRoleToUser({
//                 roleId: 1,
//                 userId: 4, 
//                 currentUser: user
//             })).to.be.eventually.fulfilled;

//             expect(updateUserStub).to.be.calledOnce;
//         });
//     })

//     describe("Unassign role from user", () => {
//         it("should throw ForbiddenError if user does not have permission to unassign roles from users", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(false);

//             await expect(UserService.unassignRoleFromUser({
//                 roleId: 1,
//                 userId: 5,
//                 currentUser: user
//             })).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);
//         })

//         it("should throw NotFoundError if role to assign does not exist", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);
//             const findRoleStub = sandbox.stub(RoleService, "findById").resolves(undefined);

//             await expect(UserService.unassignRoleFromUser({
//                 roleId: 1,
//                 userId: 4, 
//                 currentUser: user
//             })).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ROLE_NOT_FOUND);

//             expect(findRoleStub).to.be.calledOnce;
//         })

//         it("should throw NotFoundError if user to assign to does not exist", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);
//             sandbox.stub(RoleService, "findById").resolves(role);
//             const findUserStub = sandbox.stub(UserRepo, "findById").resolves(undefined);

//             await expect(UserService.unassignRoleFromUser({
//                 roleId: 1,
//                 userId: 4, 
//                 currentUser: user
//             })).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.USER_NOT_FOUND);

//             expect(findUserStub).to.be.calledOnce;
//         });

//         it("should successfully assign role to user", async () => {
//             sandbox.stub(UserService, "hasPermissionTo").returns(true);
//             sandbox.stub(RoleService, "findById").resolves(role);
//             sandbox.stub(UserRepo, "findById").resolves(user);
//             const updateUserStub = sandbox.stub(UserRepo, "update").resolves(user);

//             await expect(UserService.unassignRoleFromUser({
//                 roleId: 1,
//                 userId: 4, 
//                 currentUser: user
//             })).to.be.eventually.fulfilled;

//             expect(updateUserStub).to.be.calledOnce;
//         });
    })
 })