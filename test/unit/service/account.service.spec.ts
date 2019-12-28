import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai"
import sinon from "sinon";
import faker from "faker";
import * as AccountService from "../../../src/account/account.service";
import * as AccountRepo from "../../../src/account/account.repository";
import * as VerificationTokenRepo from "../../../src/account/verification-token.repository"
import * as ResetPasswordTokenRepo from "../../../src/account/reset-password-token.repository"
import * as MessageUtil from "../../../src/shared/util/message.util";
import * as PasswordHasherUtil from "../../../src/shared/util/password-hasher.util"
import { RegisterAccountDTO } from "../../../src/account/dto/register-account.dto"
import { BadRequestError } from "../../../src/shared/exception/bad-request.error";
import { SinonSandbox } from "sinon";
import { ConflictError } from "../../../src/shared/exception/conflict.error";
import { Account, Gender } from "../../../src/account/account.model";
import { LoginDTO } from "../../../src/account/dto/login.dto";
import { OauthLoginDTO } from "../../../src/account/dto/oauth-login.dto";
import { NotFoundError } from "../../../src/shared/exception/not-found.error";
import { VerificationToken } from "../../../src/account/verification-token.model";
import { ResetPasswordToken } from "../../../src/account/reset-password-token.model";

chai.use(chaiAsPromised);
chai.use(sinonChai)

let sandbox: SinonSandbox;
let account: Account;
let registerAccountDTO: Partial<RegisterAccountDTO>;
let loginDTO: Partial<LoginDTO>;
let oauthLoginDTO: Partial<OauthLoginDTO>;
let verificationToken: VerificationToken;
let resetPasswordToken: ResetPasswordToken;

beforeEach(() => {
    sandbox = sinon.createSandbox()
    const password = faker.internet.password();
    const phoneNumber = faker.phone.phoneNumber("+233#########");


    account = {
        id: faker.random.number(50),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        gender: Gender["F"],
        email: faker.internet.email(),
        phoneNumber: phoneNumber,
        password: password,
        enabled: true,
        createdAt: faker.date.past().getTime(),
        updatedAt: faker.date.recent().getTime()
    }

    registerAccountDTO = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        gender: faker.random.arrayElement(["m", "f"]),
        email: faker.internet.email(),
        phoneNumber: phoneNumber,
        password: password,
        confirmPassword: password
    }

    loginDTO = {
        email: faker.internet.email(),
        password: password
    }

    oauthLoginDTO = {
        oauthId: faker.random.uuid(),
        oauthProvider: faker.random.arrayElement(["google", "facebook"]),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),

    }

    verificationToken = {
        id: faker.random.number(5),
        accountId: faker.random.number(3),
        token: faker.random.uuid(),
        expiresOn: faker.date.future().getTime()
    }

    resetPasswordToken = {
        id: faker.random.number(2),
        accountId: faker.random.number(4),
        token: faker.random.uuid(),
        expiresOn: faker.date.future().getTime()
    }

})

afterEach(() => {
    sandbox.restore()
})

describe("Account Service", () => {
    describe("Register With Email", () => {
        it("should throw BadRequestError if register DTO object is invalid", async () => {
        
            registerAccountDTO.email = undefined
            registerAccountDTO.password = undefined
            registerAccountDTO.confirmPassword = undefined
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })
    
        it("should throw BadRequestError if firstName is invalid", async() => {
            registerAccountDTO.firstName = faker.internet.ipv6()
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FIRST_NAME)
        })
    
        it("should throw BadRequestError if lastName is invalid", async() => {
            registerAccountDTO.lastName = faker.phone.phoneNumber()
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_LAST_NAME)
        })
    
        it("should throw BadRequestError if gender is invalid", async() => {
            registerAccountDTO.gender = "r"
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_GENDER)
        })
    
        it("should throw BadRequestError if email is invalid", async() => {
            registerAccountDTO.email = faker.lorem.lines(1)
    
           await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_EMAIL_ADDRESS)
        })
    
        it("should throw BadRequestError if phone number is invalid", async() => {
            registerAccountDTO.phoneNumber = "76112209"
    
           await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PHONE_NUMBER)
        })
    
        it("should throw BadRequestError if password is invalid", async() => {
            registerAccountDTO.password = "pass"
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PASSWORD)
        })
    
        it("should throw BadRequestError if password and confirmPassword are not equal", async() => {
            registerAccountDTO.password = "password"
            registerAccountDTO.confirmPassword = "pass"
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.PASSWORDS_DO_NOT_MATCH)
        })
    
        it("should throw ConflictError if account already exists", async() => {
    
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(account)
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO)).to.be.eventually.rejectedWith(ConflictError, MessageUtil.ACCOUNT_ALREADY_EXISTS)
            expect(findByEmailStub).to.be.calledOnce
        })
    
        it("should successfully create account", async() => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(undefined);
            const hashPasswordStub = sandbox.stub(PasswordHasherUtil, "hashPassword").resolves(faker.random.uuid())
            const insertAccountStub = sandbox.stub(AccountRepo, "add").resolves(account)
    
            await expect(AccountService.register(registerAccountDTO as RegisterAccountDTO))
            .to.be.eventually.fulfilled;
            expect(findByEmailStub).to.be.calledOnce
            expect(insertAccountStub).to.be.calledOnce
        })
    
    })


    describe("Login With Email", () => {
        it("should throw BadRequestError if login DTO object is invalid", async () => {
            loginDTO.email = undefined

            await expect(AccountService.login(loginDTO as LoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw BadRequestError if account does not exist", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(undefined)

            await expect(AccountService.login(loginDTO as LoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_CREDENTIALS)
            expect(findByEmailStub).to.be.calledOnce
        })

        it("should throw BadRequestError if credentials is invalid", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(account)
            const comparePasswordStub = sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(false);

            await expect(AccountService.login(loginDTO as LoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_CREDENTIALS)
            expect(findByEmailStub).to.be.calledOnce
            expect(comparePasswordStub).to.be.calledOnce
        })

        it("should successfully login user", async () => {
            const findByEmailStub = sandbox.stub(AccountRepo, "findByEmail").resolves(account)
            const comparePasswordStub = sandbox.stub(PasswordHasherUtil, "comparePassword").resolves(true);

            const promise = AccountService.login(loginDTO as LoginDTO);
            await expect(promise).to.be.eventually.fulfilled
            expect(findByEmailStub).to.be.calledOnce
            expect(comparePasswordStub).to.be.calledOnce
            expect(await promise).to.be.equal(account)
        })
    })

    describe("Oauth Login", () => {
        it("should throw BadRequestError if oauth login DTO object is invalid", async () => {
            oauthLoginDTO.oauthId = undefined

            await expect(AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA)
        })

        it("should throw BadRequestError if firstName is invalid", async () => {
            oauthLoginDTO.firstName = faker.internet.ipv6()

            await expect(AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FIRST_NAME)
        })

        it("should throw BadRequestError if lastName is invalid", async () => {
            oauthLoginDTO.lastName = faker.internet.ip()

            await expect(AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_LAST_NAME)
        })

        it("should throw BadRequestError if oauth provider is invalid", async () => {
            oauthLoginDTO.oauthProvider = "microsoft"

            await expect(AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_OAUTH_PROVIDER)
        })

        it("should create account and login if the oauthId does not exist", async () => {
            const findByOauthIdStub = sandbox.stub(AccountRepo, "findByOauthId").resolves(undefined)
            const insertAccountStub = sandbox.stub(AccountRepo, "add").resolves(account)

            const promise = AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)
            await expect(promise).to.be.fulfilled
            expect(await promise).to.be.equal(account)
            expect(findByOauthIdStub).to.be.calledOnce
            expect(insertAccountStub).to.be.calledOnce
        })

        it("should login oauthId already exist", async () => {
            const findByOauthIdStub = sandbox.stub(AccountRepo, "findByOauthId").resolves(account)
            const insertAccountStub = sandbox.stub(AccountRepo, "add").resolves(account)


            const promise = AccountService.oauthLogin(oauthLoginDTO as OauthLoginDTO)
            await expect(promise).to.be.fulfilled
            expect(await promise).to.be.equal(account)
            expect(findByOauthIdStub).to.be.calledOnce
            expect(insertAccountStub).to.not.be.called
        })
    })

    describe("Generate Verification Token", () => {

        it("should throw NotFoundError if account is not found", async () => {
            const findByIdStub = sandbox.stub(AccountRepo, "findById").resolves(undefined)
            
            await expect(AccountService.generateVerificationTokenForAccount(1)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ACCOUNT_NOT_FOUND)
            expect(findByIdStub).to.be.calledOnce
        })

        it("should create a 4 digit token ", async() => {
            sandbox.stub(AccountRepo, "findById").resolves(account)
            sandbox.stub(VerificationTokenRepo, "findByAccountId").resolves(undefined);
            sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);
            const addVerificationTokenStub = sandbox.stub(VerificationTokenRepo, "add").resolves(verificationToken);
            const createdToken = await AccountService.generateVerificationTokenForAccount(1);

            expect(createdToken.token.length).to.be.equal(4);
            expect(typeof createdToken.expiresOn).to.be.equal("number");
            expect(addVerificationTokenStub).to.be.calledOnce;
        })


        it("should delete any existing verification token record before creating a new one.", async () => {
            sandbox.stub(AccountRepo, "findById").resolves(account)
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
        const token = String(faker.random.number({min: 4, max: 4}));

        it("should throw BadRequestError if record with this token does not exist", async () => {
            const findTokenStub = sandbox.stub(VerificationTokenRepo, "findByToken").resolves(undefined);

            await expect(AccountService.verifyAccount(token)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_VERIFICATION_TOKEN);
            expect(findTokenStub).to.be.calledOnce;
        })

        it("should throw BadRequestError if token has expired", async () => {
            const date = new Date();
            date.setMinutes(date.getMinutes() - 15)

            verificationToken.expiresOn = date.getTime();
            sandbox.stub(VerificationTokenRepo, "findByToken").resolves(verificationToken);

            await expect(AccountService.verifyAccount(token)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_VERIFICATION_TOKEN);
        })

        it("should verify account", async () => {
            const date = new Date();
            date.setMinutes(date.getMinutes() + 20);
            
            verificationToken.expiresOn = date.getTime();
        
            sandbox.stub(VerificationTokenRepo, "findByToken").resolves(verificationToken);
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
            const findByIdStub = sandbox.stub(AccountRepo, "findById").resolves(undefined)
            
            await expect(AccountService.generateVerificationTokenForAccount(1)).to.be.eventually.rejectedWith(NotFoundError, MessageUtil.ACCOUNT_NOT_FOUND)
            expect(findByIdStub).to.be.calledOnce
        })


        it("should create a 4 digit token", async() => {
            sandbox.stub(AccountRepo, "findById").resolves(account)
            sandbox.stub(ResetPasswordTokenRepo, "findByAccountId").resolves(undefined)
            sandbox.stub(ResetPasswordTokenRepo, "findByToken").resolves(undefined);
            const addResetPasswordTokenStub = sandbox.stub(ResetPasswordTokenRepo, "add").resolves(verificationToken);

            const createdToken = await AccountService.generateResetPasswordTokenForAccount(1);

            expect(createdToken.token.length).to.be.equal(4);
            expect(typeof createdToken.expiresOn).to.be.equal("number");
            expect(addResetPasswordTokenStub).to.be.calledOnce;            
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
        it("should throw BadRequestError if reset password DTO is invalid", () => {
            
        })
    })

})