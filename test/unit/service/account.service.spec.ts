import { sandbox, expect } from "../setup";
import { faker, account, registerAccountDTO, loginDTO, oauthLoginDTO, resetPasswordDTO, resetPasswordToken, verificationToken, role, permission } from "../data.factory";
import { AccountService } from "../../../src/account/account.service";
import { AccountRepo } from "../../../src/account/account.repository";
import { VerificationTokenRepo } from "../../../src/account/verification-token.repository"
import { ResetPasswordTokenRepo } from "../../../src/account/reset-password-token.repository"
import { MessageUtil } from "../../../src/shared/util/message.util";
import { PasswordHasherUtil } from "../../../src/shared/util/password-hasher.util"
import { RegisterAccountDTO } from "../../../src/account/dto/register-account.dto"
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { ConflictError } from "../../../src/shared/errors/conflict.error";
import { LoginDTO } from "../../../src/account/dto/login.dto";
import { OauthLoginDTO } from "../../../src/account/dto/oauth-login.dto";
import { NotFoundError } from "../../../src/shared/errors/not-found.error";
import { ResetPasswordDTO } from "../../../src/account/dto/reset-password.dto";
import { UnAuthorizedError } from "../../../src/shared/errors/unauthorized.error";
import { ForbiddenError } from "../../../src/shared/errors/forbidden.error";


describe("Account Service", () => {
    describe("Register With Email", () => {
        it("should throw BadRequestError if register DTO object is invalid", async () => {

            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, email: undefined, password: undefined, confirmPassword: undefined };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw BadRequestError if firstName is invalid", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, firstName: faker.internet.ipv6() };


            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FIRST_NAME)
        })

        it("should throw BadRequestError if lastName is invalid", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, lastName: faker.phone.phoneNumber() };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_LAST_NAME)
        })

        it("should throw BadRequestError if gender is invalid", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, gender: "r" };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_GENDER)
        })

        it("should throw BadRequestError if email is invalid", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, email: faker.lorem.lines(1) };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_EMAIL_ADDRESS)
        })

        it("should throw BadRequestError if phone number is invalid", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, phoneNumber: "76112209" };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PHONE_NUMBER)
        })

        it("should throw BadRequestError if password is invalid", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, password: "pass" };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PASSWORD)
        })

        it("should throw BadRequestError if password and confirmPassword are not equal", async () => {
            const dto: Partial<RegisterAccountDTO> = { ...registerAccountDTO, password: "passwo", confirmPassword: "password" };

            await expect(AccountService.register(dto as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.PASSWORDS_DO_NOT_MATCH)
        })

        it("should throw ConflictError if account already exists", async () => {

            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(account)

            await expect(AccountService.register(registerAccountDTO)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ACCOUNT_ALREADY_EXISTS)
            expect(findByEmailStub).to.be.calledOnce
        })

        it("should successfully create account", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(undefined);
            const hashPasswordStub = sandbox.stub(PasswordHasherUtil, "hashPassword").resolves(faker.random.uuid())
            const insertAccountStub = sandbox.stub(AccountRepo, "add").resolves(account)

            await expect(AccountService.register(registerAccountDTO))
                .to.be.eventually.fulfilled;
            expect(findByEmailStub).to.be.calledOnce;
            expect(hashPasswordStub).to.be.calledOnce;
            expect(insertAccountStub).to.be.calledOnce;
        })

    })


    describe("Login With Email", () => {
        it("should throw BadRequestError if login DTO object is invalid", async () => {
            const dto: Partial<LoginDTO> = { ...loginDTO, email: undefined };

            await expect(AccountService.login(dto as LoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw UnAuthorizedError if account does not exist", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(undefined)

            await expect(AccountService.login(loginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_CREDENTIALS)
            expect(findByEmailStub).to.be.calledOnce
        })


        it("should throw UnAuthorizedError if credentials is invalid", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(account)
            const comparePasswordStub = sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(false);

            await expect(AccountService.login(loginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_CREDENTIALS)
            expect(findByEmailStub).to.be.calledOnce
            expect(comparePasswordStub).to.be.calledOnce
        })

        it("should successfully login user", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(account)
            const comparePasswordStub = sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            const promise = AccountService.login(loginDTO);
            await expect(promise).to.be.eventually.fulfilled
            expect(findByEmailStub).to.be.calledOnce
            expect(comparePasswordStub).to.be.calledOnce
            expect(await promise).to.be.equal(account)
        })

        it("should throw UnAuthorizedError if account is disabled", async () => {
            sandbox.stub(AccountRepo, "findByEmail").resolves({ ...account, enabled: false });
            sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            await expect(AccountService.login(loginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.ACCOUNT_DISABLED)
        })

        it("should throw UnAuthorizedError if account has not been verified", async () => {
            sandbox.stub(AccountRepo, "findByEmail").resolves({ ...account, verifiedAt: undefined });
            sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            await expect(AccountService.login(loginDTO as LoginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.ACCOUNT_NOT_VERIFIED)
        })
    })

    describe("Oauth Login", () => {
        it("should throw BadRequestError if oauth login DTO object is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, oauthId: undefined };

            await expect(AccountService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw BadRequestError if firstName is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, firstName: faker.internet.ipv6() };

            await expect(AccountService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FIRST_NAME)
        })

        it("should throw BadRequestError if lastName is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, lastName: faker.internet.ip() }

            await expect(AccountService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_LAST_NAME)
        })

        it("should throw BadRequestError if oauth provider is invalid", async () => {
            const dto: Partial<OauthLoginDTO> = { ...oauthLoginDTO, oauthProvider: "microsoft" };

            await expect(AccountService.oauthLogin(dto as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_OAUTH_PROVIDER)
        })

        it("should create account and login if the oauthId does not exist", async () => {
            const findByOauthIdStub = sandbox.stub(AccountRepo, "findByOauthId").resolves(undefined)
            const insertAccountStub = sandbox.stub(AccountRepo, "add").resolves(account)

            const promise = AccountService.oauthLogin(oauthLoginDTO)
            await expect(promise).to.be.fulfilled
            expect(await promise).to.be.equal(account)
            expect(findByOauthIdStub).to.be.calledOnce
            expect(insertAccountStub).to.be.calledOnce
        })

        it("should login if oauthId already exist", async () => {
            const findByOauthIdStub = sandbox.stub(AccountRepo, "findByOauthId").resolves(account)
            const insertAccountStub = sandbox.stub(AccountRepo, "add").resolves(account)


            const promise = AccountService.oauthLogin(oauthLoginDTO)
            await expect(promise).to.be.fulfilled
            expect(await promise).to.be.equal(account)
            expect(findByOauthIdStub).to.be.calledOnce
            expect(insertAccountStub).to.not.be.called
        })

        it("should throw UnAuthorizedError if account is disabled", async () => {
            const findByOauthIdStub = sandbox.stub(AccountRepo, "findByOauthId").resolves({ ...account, enabled: false });

            await expect(AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.ACCOUNT_DISABLED)
            expect(findByOauthIdStub).to.be.calledOnce;
        })
    })

    describe("Generate Verification Token", () => {

        it("should throw NotFoundError if account is not found", async () => {
            const findAccountStub = sandbox.stub(AccountRepo, "findById").resolves(undefined);

            await expect(AccountService.generateVerificationTokenForAccount(1)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ACCOUNT_NOT_FOUND)
            expect(findAccountStub).to.be.calledOnce
        })

        it("should throw ConflictError if account is already verified", async () => {
            const findAccountStub = sandbox.stub(AccountRepo, "findById").resolves(account);

            await expect(AccountService.generateVerificationTokenForAccount(1)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ACCOUNT_ALREADY_VERIFIED)
            expect(findAccountStub).to.be.calledOnce
        })

        it("should create a 4 digit verification token ", async () => {
            sandbox.stub(AccountRepo, "findById").resolves({ ...account, verifiedAt: undefined })
            sandbox.stub(VerificationTokenRepo, "findByAccountId").resolves(undefined);
            sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);
            const addVerificationTokenStub = sandbox.stub(VerificationTokenRepo, "add").resolves(verificationToken);
            const createdToken = await AccountService.generateVerificationTokenForAccount(1);

            expect(createdToken.token.length).to.be.equal(4);
            expect(typeof createdToken.expiresOn).to.be.equal("number");
            expect(addVerificationTokenStub).to.be.calledOnce;
        })

        it("should generate a unique verification token", async () => {
            sandbox.stub(AccountRepo, "findById").resolves({ ...account, verifiedAt: undefined });
            sandbox.stub(VerificationTokenRepo, "findByAccountId").resolves(undefined);
            sandbox.stub(VerificationTokenRepo, "add").resolves(verificationToken);
            const findTokenStub = sandbox.stub(VerificationTokenRepo, "findByToken")
                .onFirstCall().resolves(verificationToken)
                .onSecondCall().resolves(undefined);

            await expect(AccountService.generateVerificationTokenForAccount(1)).to.be.eventually.fulfilled;
            expect(findTokenStub).to.be.calledTwice;
        })

        it("should delete any existing verification token record before creating a new one.", async () => {
            sandbox.stub(AccountRepo, "findById").resolves({ ...account, verifiedAt: undefined })
            sandbox.stub(VerificationTokenRepo, "findByAccountId").resolves(verificationToken)
            sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);
            const removeVerificationTokenStub = sandbox.stub(VerificationTokenRepo, "remove").resolves();
            const addVerificationTokenStub = sandbox.stub(VerificationTokenRepo, "add").resolves(verificationToken);

            await expect(AccountService.generateVerificationTokenForAccount(1)).to.be.eventually.fulfilled;
            expect(removeVerificationTokenStub).to.be.calledOnce
            expect(addVerificationTokenStub).to.be.calledOnce
        })

    })

    describe("Verify Account", () => {
        const token = String(faker.random.number({ min: 4, max: 4 }));

        it("should throw BadRequestError if record with this token does not exist", async () => {
            const findTokenStub = sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);

            await expect(AccountService.verifyAccount(token)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_VERIFICATION_TOKEN);
            expect(findTokenStub).to.be.calledOnce;
        })

        it("should throw BadRequestError if token has expired", async () => {
            const date = new Date();
            date.setMinutes(date.getMinutes() - 15)

            sandbox.stub(VerificationTokenRepo, "findByToken").resolves({
                ...verificationToken, expiresOn: date.getTime()
            });

            await expect(AccountService.verifyAccount(token)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_VERIFICATION_TOKEN);
        })

        it("should verify account", async () => {
            const date = new Date();
            date.setMinutes(date.getMinutes() + 20);

            sandbox.stub(VerificationTokenRepo, "findByToken").resolves({
                ...verificationToken, expiresOn: date.getTime()
            });

            const findAccountStub = sandbox.stub(AccountRepo, "findById").resolves(account);
            const updateAccountStub = sandbox.stub(AccountRepo, "update").resolves(account);
            const removeTokenStub = sandbox.stub(VerificationTokenRepo, "remove").resolves(verificationToken);

            await expect(AccountService.verifyAccount(token)).to.be.eventually.fulfilled;
            expect(findAccountStub).to.have.been.calledOnce;
            expect(updateAccountStub).to.have.been.calledOnce;
            expect(removeTokenStub).to.be.calledOnce;
        })
    })

    describe("Generate Reset Password Token", () => {

        it("should throw NotFoundError if account is not found", async () => {
            const findAccountStub = sandbox.stub(AccountRepo, "findById").resolves(undefined)

            await expect(AccountService.generateResetPasswordTokenForAccount(1)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ACCOUNT_NOT_FOUND)
            expect(findAccountStub).to.be.calledOnce
        })

        it("should create a 4 digit reset password token", async () => {
            sandbox.stub(AccountRepo, "findById").resolves(account)
            sandbox.stub(ResetPasswordTokenRepo, "findByAccountId").resolves(undefined)
            sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);
            const addResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "add").resolves(resetPasswordToken);

            const createdToken = await AccountService.generateResetPasswordTokenForAccount(1);

            expect(createdToken.token.length).to.be.equal(4);
            expect(typeof createdToken.expiresOn).to.be.equal("number");
            expect(addResetPasswordTokenStub).to.be.calledOnce;
        })

        it("should generate a unique reset password token", async () => {
            sandbox.stub(AccountRepo, "findById").resolves(account);
            sandbox.stub(ResetPasswordTokenRepo, "findByAccountId").resolves(undefined);
            sandbox.stub(ResetPasswordTokenRepo, "add").resolves(resetPasswordToken);
            const findTokenStub = sandbox.stub(ResetPasswordTokenRepo, "findByToken")
                .onFirstCall().resolves(resetPasswordToken)
                .onSecondCall().resolves(resetPasswordToken)
                .onThirdCall().resolves(undefined);

            await expect(AccountService.generateResetPasswordTokenForAccount(1)).to.be.eventually.fulfilled;
            expect(findTokenStub).to.be.calledThrice;
        })

        it("should delete any existing reset password token record before creating a new one", async () => {
            sandbox.stub(AccountRepo, "findById").resolves(account)
            sandbox.stub(ResetPasswordTokenRepo, "findByAccountId").resolves(resetPasswordToken)
            sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);

            const removeResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "remove").resolves()
            const addResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "add").resolves(verificationToken);


            await expect(AccountService.generateResetPasswordTokenForAccount(1)).to.be.eventually.fulfilled;
            expect(removeResetPasswordTokenStub).to.be.calledOnce
            expect(addResetPasswordTokenStub).to.be.calledOnce
        })

    })

    describe("Reset Password", () => {
        it("should throw BadRequestError if reset password DTO is invalid", async () => {
            const dto: Partial<ResetPasswordDTO> = { ...resetPasswordDTO, confirmPassword: undefined }

            await expect(AccountService.resetPassword(dto as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
        })

        it("should throw BadRequestError if password is invalid", async () => {
            const dto: Partial<ResetPasswordDTO> = { ...resetPasswordDTO, password: faker.internet.password(4) }

            await expect(AccountService.resetPassword(dto as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PASSWORD);
        })

        it("should throw BadRequestError if password and confirm password values do not match", async () => {
            const dto: Partial<ResetPasswordDTO> = { ...resetPasswordDTO, password: faker.internet.password(9) }

            await expect(AccountService.resetPassword(dto as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.PASSWORDS_DO_NOT_MATCH);
        })

        it("should throw BadRequestError if token is invalid", async () => {
            sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);

            await expect(AccountService.resetPassword(resetPasswordDTO as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_RESET_PASSWORD_TOKEN);
        })

        it("should throw BadRequestError if token has expired", async () => {
            const date = new Date();
            date.setMinutes(date.getMinutes() - 60);

            sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves({ ...resetPasswordToken, expiresOn: date.getTime() });

            await expect(AccountService.resetPassword(resetPasswordDTO as ResetPasswordDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_RESET_PASSWORD_TOKEN);
        })

        it("should reset password", async () => {
            const date = new Date();
            date.setMinutes(date.getMinutes() + 15)

            sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves({ ...resetPasswordToken, expiresOn: date.getTime() });

            const findAccountStub = sandbox.stub(AccountRepo, "findById").resolves(account);
            const updateAccountStub = sandbox.stub(AccountRepo, "update").resolves(account);
            const hashPasswordStub = sandbox.stub(PasswordHasherUtil, "hashPassword").resolves(faker.random.uuid());

            await expect(AccountService.resetPassword(resetPasswordDTO as ResetPasswordDTO)).to.be.eventually.fulfilled;
            expect(findAccountStub).to.be.calledOnce;
            expect(updateAccountStub).to.be.calledOnce;
            expect(hashPasswordStub).to.be.calledOnce;
        })
    })

    describe("Check Permissions", () => {
        it("should throw ForbiddenError if roles length is less than 1", async () => {

            expect(AccountService.checkPermission("", { ...account, roles: [] })).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);

        })

        it("should throw ForbiddenError if account does not have permission", async () => {
            const permissionName = "ACCESS_DASHBOARD";

            expect(AccountService.checkPermission(permissionName, { ...account, roles: [role] })).to.be.eventually.rejectedWith(ForbiddenError, MessageUtil.PERMISSION_DENIED);

        })

        it("should resolve if account has permission", async () => {
            const permissionName = "ACCESS_DASHBOARD";

            expect(AccountService.checkPermission(permissionName, {
                ...account,
                roles: [
                    {
                        ...role, permissions: [
                            { ...permission, name: permissionName }
                        ]
                    }
                ]
            })).to.be.eventually.fulfilled;

        })
    })
})