import cryptoRandomString from "crypto-random-string";
import moment from "moment";
import * as ValidationUtil from "../shared/util/validation.util";
import * as PasswordHasherUtil from "../shared/util/password-hasher.util";
import * as MessageUtil from "../shared/util/message.util";
import * as AccountRepo from "./account.repository"
import { RegisterAccountDTO } from "./dto/register-account.dto";
import { LoginDTO } from "./dto/login.dto";
import { OauthLoginDTO } from "./dto/oauth-login.dto";
import { Account, Gender, OauthProvider, TransmissionMedium } from "./account.model";
import { BadRequestError } from "../shared/exception/bad-request.error";
import { ConflictError } from "../shared/exception/conflict.error";
import { NotFoundError } from "../shared/exception/not-found.error";
import { VerificationToken } from "./verification-token.model";
import { ResetPasswordToken } from "./reset-password-token.model";



const findByEmail = async (email: string): Promise<Account> => {
    return AccountRepo.findByEmail(email);
}

const buildAccount = (dto: RegisterAccountDTO | OauthLoginDTO): Account =>{
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
    if(!(dto.firstName && dto.lastName && dto.gender && dto.email && dto.phoneNumber && dto.password && dto.confirmPassword)){
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
    }

    if(!ValidationUtil.isValidName(dto.firstName)){
        throw new BadRequestError(MessageUtil.INVALID_FIRST_NAME)
    }

    if(!ValidationUtil.isValidName(dto.lastName)){
        throw new BadRequestError(MessageUtil.INVALID_LAST_NAME)
    }

    if(dto.gender.length > 1 || !(ValidationUtil.isValidEnum(Gender, dto.gender))){
        throw new BadRequestError(MessageUtil.INVALID_GENDER)
    }

    if(!ValidationUtil.isValidEmail(dto.email)){
        throw new BadRequestError(MessageUtil.INVALID_EMAIL_ADDRESS)
    }

    if(!ValidationUtil.isValidPhoneNumber(dto.phoneNumber)){
        throw new BadRequestError(MessageUtil.INVALID_PHONE_NUMBER)
    }

    if(!ValidationUtil.isValidPassword(dto.password)){
        throw new BadRequestError(MessageUtil.INVALID_PASSWORD)
    }

    if(!ValidationUtil.arePasswordsTheSame(dto.password, dto.confirmPassword)){
        throw new BadRequestError(MessageUtil.PASSWORDS_DO_NOT_MATCH)
    }

    if(await findByEmail(dto.email)){
        throw new ConflictError(MessageUtil.ACCOUNT_ALREADY_EXISTS)
    }

    const newAccount = buildAccount(dto);
    newAccount.gender = Gender[dto.gender.toUpperCase() as keyof typeof Gender]
    newAccount.email = dto.email;
    newAccount.phoneNumber = dto.phoneNumber;
    newAccount.password = await PasswordHasherUtil.hashPassword(dto.password);

    const account = await AccountRepo.add(newAccount);


    return account
}

export const login = async (dto: LoginDTO): Promise<Account> => {
    if(!(dto.email && dto.password)){
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA)
    }

    const account = await findByEmail(dto.email);
    if(!account || !await PasswordHasherUtil.comparePassword(dto.password, account.password!)){
        throw new BadRequestError(MessageUtil.INVALID_CREDENTIALS)
    }

    return account;

}

export const oauthLogin = async (dto: OauthLoginDTO): Promise<Account> => {
    if(!(dto.oauthId && dto.oauthProvider && dto.firstName && dto.lastName)){
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
    }

    if(!ValidationUtil.isValidName(dto.firstName)){
        throw new BadRequestError(MessageUtil.INVALID_FIRST_NAME)
    }

    if(!ValidationUtil.isValidName(dto.lastName)){
        throw new BadRequestError(MessageUtil.INVALID_LAST_NAME)
    }

    if(!ValidationUtil.isValidEnum(OauthProvider, dto.oauthProvider)){
        throw new BadRequestError(MessageUtil.INVALID_OAUTH_PROVIDER)
    }

    let account: Account
    account = await AccountRepo.findByOauthId(dto.oauthId);
    if(!account){
        //New Oauth Account. Adding
        const newAccount = buildAccount(dto)
        account = await AccountRepo.add(newAccount)
    }

    return account;

}

export const generateVerificationTokenForAccount = async (accountId: number, medium: string) => {

    if(!medium || !ValidationUtil.isValidEnum(TransmissionMedium, medium)){
        throw new BadRequestError(MessageUtil.INVALID_MEDIUM)
    }

    const account = await AccountRepo.findById(accountId);
    if(!account){
        throw new NotFoundError(MessageUtil.ACCOUNT_NOT_FOUND);
    }


    const token = (medium == TransmissionMedium["EMAIL"])? await generateToken(32) : generateOTP(4)

    const verificationToken: VerificationToken = {
        id: 0,
        accountId: account.id,
        token,
        expiresOn: moment().add(72, "hours").toDate().getMilliseconds()
    }

    await AccountRepo.update(account)

    return {
        token,
        expiresOn: verificationToken.expiresOn
    };
}

export const verifyAccount = () => {
    throw new Error();
}

export const generateResetPasswordTokenForAccount = async (accountId: number, medium: string) => {

    if(!medium || !ValidationUtil.isValidEnum(TransmissionMedium, medium)){
        throw new BadRequestError(MessageUtil.INVALID_MEDIUM)
    }

    const account = await AccountRepo.findById(accountId);
    if(!account){
        throw new NotFoundError(MessageUtil.ACCOUNT_NOT_FOUND);
    }


    const token = (medium == TransmissionMedium["EMAIL"])? await generateToken(32) : generateOTP(4)

    const resetPasswordToken: ResetPasswordToken = {
        id: 0,
        accountId: account.id,
        token,
        expiresOn: moment().add(72, "hours").toDate().getMilliseconds()
    }


    await AccountRepo.update(account)

    return {
        token,
        expiresOn: resetPasswordToken.expiresOn
    };
}




const generateOTP = (length: number): string => {
	return cryptoRandomString({
        length,
        characters: "1234567890"
    })
};

const generateToken = (length: number): string => {
	return cryptoRandomString({
        length,
        type: "url-safe"
    })

};