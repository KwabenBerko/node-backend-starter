import cryptoRandomString from "crypto-random-string";
import moment from "moment";
import * as ValidationUtil from "../shared/util/validation.util";
import * as PasswordHasherUtil from "../shared/util/password-hasher.util";
import * as MessageUtil from "../shared/util/message.util";
import * as AccountRepo from "./account.repository";
import * as VerificationTokenRepo from "./verification-token.repository";
import * as ResetPasswordTokenRepo from "./reset-password-token.repository"
import { RegisterAccountDTO } from "./dto/register-account.dto";
import { LoginDTO } from "./dto/login.dto";
import { OauthLoginDTO } from "./dto/oauth-login.dto";
import { Account, Gender, OauthProvider } from "./account.model";
import { BadRequestError } from "../shared/errors/bad-request.error";
import { ConflictError } from "../shared/errors/conflict.error";
import { NotFoundError } from "../shared/errors/not-found.error";
import { VerificationToken } from "./verification-token.model";
import { ResetPasswordToken } from "./reset-password-token.model";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { UnAuthorizedError } from "../shared/errors/unauthorized.error";



const findByEmail = async (email: string): Promise<Account> => {
    return AccountRepo.findByEmail(email);
}

const buildAccount = (dto: RegisterAccountDTO | OauthLoginDTO): Account => {
    return {
        id: 0, //Will be auto incremeted by repo.
        firstName: dto.firstName,
        lastName: dto.lastName,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
}

export const register = async (dto: RegisterAccountDTO): Promise<Account> => {
    if (!(dto.firstName && dto.lastName && dto.gender && dto.email && dto.phoneNumber && dto.password && dto.confirmPassword)) {
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
    }

    if (!ValidationUtil.isValidName(dto.firstName)) {
        throw new BadRequestError(MessageUtil.INVALID_FIRST_NAME)
    }

    if (!ValidationUtil.isValidName(dto.lastName)) {
        throw new BadRequestError(MessageUtil.INVALID_LAST_NAME)
    }

    if (!ValidationUtil.isValidEnum(Gender, dto.gender)) {
        throw new BadRequestError(MessageUtil.INVALID_GENDER)
    }

    if (!ValidationUtil.isValidEmail(dto.email)) {
        throw new BadRequestError(MessageUtil.INVALID_EMAIL_ADDRESS)
    }

    if (!ValidationUtil.isValidPhoneNumber(dto.phoneNumber)) {
        throw new BadRequestError(MessageUtil.INVALID_PHONE_NUMBER)
    }

    if (!ValidationUtil.isValidPassword(dto.password)) {
        throw new BadRequestError(MessageUtil.INVALID_PASSWORD)
    }

    if (!ValidationUtil.arePasswordsTheSame(dto.password, dto.confirmPassword)) {
        throw new BadRequestError(MessageUtil.PASSWORDS_DO_NOT_MATCH)
    }

    if (await findByEmail(dto.email)) {
        throw new ConflictError(MessageUtil.ACCOUNT_ALREADY_EXISTS)
    }

    const newAccount = buildAccount(dto);
    newAccount.gender = Gender[dto.gender.toUpperCase() as keyof typeof Gender]
    newAccount.email = dto.email;
    newAccount.phoneNumber = dto.phoneNumber;
    newAccount.password = await PasswordHasherUtil.hashPassword(dto.password);

    return await AccountRepo.add(newAccount);

}

export const login = async (dto: LoginDTO): Promise<Account> => {
    if (!(dto.email && dto.password)) {
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA)
    }

    const account = await findByEmail(dto.email);

    if (!account || !await PasswordHasherUtil.comparePassword(dto.password, account.password!)) {
        throw new UnAuthorizedError(MessageUtil.INVALID_CREDENTIALS)
    }

    performAccountSecurityChecks(account);

    return account;

}

export const oauthLogin = async (dto: OauthLoginDTO): Promise<Account> => {
    if (!(dto.oauthId && dto.oauthProvider && dto.firstName && dto.lastName)) {
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
    }

    if (!ValidationUtil.isValidName(dto.firstName)) {
        throw new BadRequestError(MessageUtil.INVALID_FIRST_NAME)
    }

    if (!ValidationUtil.isValidName(dto.lastName)) {
        throw new BadRequestError(MessageUtil.INVALID_LAST_NAME)
    }

    if (!ValidationUtil.isValidEnum(OauthProvider, dto.oauthProvider)) {
        throw new BadRequestError(MessageUtil.INVALID_OAUTH_PROVIDER)
    }

    let account: Account
    account = await AccountRepo.findByOauthId(dto.oauthId);
    if(account){
        performAccountSecurityChecks(account);
    }
    else{
        //New Oauth Account. Adding
        const newAccount = buildAccount(dto)
        account = await AccountRepo.add(newAccount)
    }

    return account;

}

export const generateVerificationTokenForAccount = async (accountId: number) => {

    const account = await AccountRepo.findById(accountId);
    if (!account) {
        throw new NotFoundError(MessageUtil.ACCOUNT_NOT_FOUND);
    }

    if(account.verifiedAt){
        throw new ConflictError(MessageUtil.ACCOUNT_ALREADY_VERIFIED);
    }

    const verificationToken = await VerificationTokenRepo.findByAccountId(accountId);

    if (verificationToken) {
        await VerificationTokenRepo.remove(verificationToken);
    }

    const token = await generateUniqueVerificationToken()

    const newVerificationToken: VerificationToken = {
        id: 0,
        accountId: account.id,
        token: token,
        expiresOn: moment().add(1, "hour").toDate().getMilliseconds()
    }

    await VerificationTokenRepo.add(newVerificationToken);

    return {
        token: newVerificationToken.token,
        expiresOn: newVerificationToken.expiresOn
    };
}

export const verifyAccount = async (token: string): Promise<void> => {

    const currentDateTime = moment();
    const verificationToken = await VerificationTokenRepo.findByToken(token);

    if (!verificationToken || currentDateTime.isAfter(moment(verificationToken.expiresOn))) {
        throw new BadRequestError(MessageUtil.INVALID_VERIFICATION_TOKEN);
    }

    const account = await AccountRepo.findById(verificationToken.accountId);
    account.verifiedAt = currentDateTime.toDate().getMilliseconds();

    await VerificationTokenRepo.remove(verificationToken);
    await AccountRepo.update(account);
}

export const generateResetPasswordTokenForAccount = async (accountId: number) => {

    const account = await AccountRepo.findById(accountId);
    if (!account) {
        throw new NotFoundError(MessageUtil.ACCOUNT_NOT_FOUND);
    }

    const resetPasswordToken = await ResetPasswordTokenRepo.findByAccountId(accountId);
    if (resetPasswordToken) {
        await ResetPasswordTokenRepo.remove(resetPasswordToken);
    }

    const token = await generateUniqueResetPasswordToken();

    const newResetPasswordToken: ResetPasswordToken = {
        id: 0,
        accountId: account.id,
        token: token,
        expiresOn: moment().add(30, "minutes").toDate().getMilliseconds()
    }

    await ResetPasswordTokenRepo.add(newResetPasswordToken);

    return {
        token: newResetPasswordToken.token,
        expiresOn: newResetPasswordToken.expiresOn
    }
}

export const resetPassword = async (dto: ResetPasswordDTO): Promise<void> => {
    if(!(dto.token && dto.password && dto.confirmPassword)){
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
    }

    if(!ValidationUtil.isValidPassword(dto.password)){
        throw new BadRequestError(MessageUtil.INVALID_PASSWORD);
    }

    if(!ValidationUtil.arePasswordsTheSame(dto.password, dto.confirmPassword)){
        throw new BadRequestError(MessageUtil.PASSWORDS_DO_NOT_MATCH);
    }

    const currentDateTime = moment();
    const resetPasswordToken = await ResetPasswordTokenRepo.findByToken(dto.token);

    if(!resetPasswordToken || currentDateTime.isAfter(moment(resetPasswordToken.expiresOn))){
        throw new BadRequestError(MessageUtil.INVALID_RESET_PASSWORD_TOKEN);
    }

    const account = await AccountRepo.findById(resetPasswordToken.accountId);
    account.password = await PasswordHasherUtil.hashPassword(dto.password);

    await AccountRepo.update(account);
}

const performAccountSecurityChecks = (account: Account) => {
    if(!account.enabled){
        throw new UnAuthorizedError(MessageUtil.ACCOUNT_DISABLED);
    }
}

const generateUniqueResetPasswordToken = async (): Promise<string> => {
    const token = generateToken(4);

    if (await ResetPasswordTokenRepo.findByToken(token)) {
        return generateUniqueResetPasswordToken();
    }

    return token;
}

const generateUniqueVerificationToken = async (): Promise<string> => {
    const token = generateToken(4);

    if (await VerificationTokenRepo.findByToken(token)) {
        return generateUniqueVerificationToken();
    }

    return token;
}


const generateToken = (length: number): string => {
    return cryptoRandomString({
        length,
        characters: "1234567890"
    })
};
