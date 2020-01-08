import cryptoRandomString from "crypto-random-string";
import moment from "moment";
import { ValidationUtil } from "../shared/util/validation.util";
import { PasswordHasherUtil } from "../shared/util/password-hasher.util";
import { MessageUtil } from "../shared/util/message.util";
import { UserRepo } from "./user.repository";
import { VerificationTokenRepo } from "./verification-token.repository";
import { ResetPasswordTokenRepo } from "./reset-password-token.repository"
import { RegisterUserDTO } from "./dto/register-user.dto";
import { LoginDTO } from "./dto/login.dto";
import { OauthLoginDTO } from "./dto/oauth-login.dto";
import { User, Gender, OauthProvider } from "./user.model";
import { BadRequestError } from "../shared/errors/bad-request.error";
import { ConflictError } from "../shared/errors/conflict.error";
import { NotFoundError } from "../shared/errors/not-found.error";
import { VerificationToken } from "./verification-token.model";
import { ResetPasswordToken } from "./reset-password-token.model";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { UnAuthorizedError } from "../shared/errors/unauthorized.error";
import { Role } from "../role/role.model";
import { permissionContants } from "../shared/util/constant.util";
import { ForbiddenError } from "../shared/errors/forbidden.error";
import { RoleService } from "../role/role.service";



const findByEmail = async (email: string): Promise<User> => {
    return UserRepo.findByEmail(email);
}

const findById = async (id: number): Promise<User> => {
    return UserRepo.findById(id);
}

const findByIdOrThrow = async (id: number): Promise<User> => {
    const user = await findById(id);
    if(!user){
        throw new NotFoundError(MessageUtil.USER_NOT_FOUND);
    }

    return user;
}

export namespace UserService {

    export const register = async (dto: RegisterUserDTO): Promise<User> => {
        if (!(dto.firstName && dto.lastName && dto.gender && dto.email && dto.phoneNumber && dto.password && dto.confirmPassword)) {
            throw new BadRequestError();
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
            throw new ConflictError(MessageUtil.USER_ALREADY_EXISTS)
        }

        const newUser = new User({
            firstName: dto.firstName, 
            lastName: dto.lastName
        });
        newUser.gender = Gender[dto.gender.toUpperCase() as keyof typeof Gender]
        newUser.email = dto.email;
        newUser.phoneNumber = dto.phoneNumber;
        newUser.password = await PasswordHasherUtil.hashPassword(dto.password);

        return await UserRepo.insert(newUser);

    }

    export const login = async (dto: LoginDTO): Promise<User> => {
        if (!(dto.email && dto.password)) {
            throw new BadRequestError()
        }

        const user = await findByEmail(dto.email);

        if (!user || !await PasswordHasherUtil.comparePassword(dto.password, user.password!)) {
            throw new UnAuthorizedError(MessageUtil.INVALID_CREDENTIALS)
        }

        validateUser(user);
        user.lastLoginAt = Date.now();
        
        return UserRepo.update(user);

    }

    export const oauthLogin = async (dto: OauthLoginDTO): Promise<User> => {
        if (!(dto.oauthId && dto.oauthProvider && dto.firstName && dto.lastName)) {
            throw new BadRequestError();
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

        const user = await UserRepo.findByOauthId(dto.oauthId);
        if (user) {
            validateUser(user);
            user.lastLoginAt = Date.now();
            return UserRepo.update(user);
        }

        //New Oauth user. Adding
        const newUser = new User({
            firstName: dto.firstName, 
            lastName: dto.lastName
        });
        newUser.oauthId = dto.oauthId;
        newUser.oauthProvider = OauthProvider[dto.oauthProvider.toUpperCase() as keyof typeof OauthProvider];
        newUser.verifiedAt = Date.now();
        newUser.lastLoginAt = Date.now();
        return await UserRepo.insert(newUser)
       
    }

    export const generateVerificationTokenForUser = async (userId: number) => {

        const user = await findByIdOrThrow(userId);

        if (user.verifiedAt) {
            throw new ConflictError(MessageUtil.USER_ALREADY_VERIFIED);
        }

        const verificationToken = await VerificationTokenRepo.findByUserId(userId);

        if (verificationToken) {
            await VerificationTokenRepo.remove(verificationToken);
        }

        const token = await generateUniqueVerificationToken()

        const newVerificationToken = new VerificationToken({
            userId: user.id,
            token: token,
            expiresOn: moment().add(1, "hour").toDate().getMilliseconds()
        });
        

        await VerificationTokenRepo.insert(newVerificationToken);

        return {
            token: newVerificationToken.token,
            expiresOn: newVerificationToken.expiresOn
        };
    }

    export const verifyUser = async (token: string): Promise<void> => {

        const currentDateTime = moment();
        const verificationToken = await VerificationTokenRepo.findByToken(token);

        if (!verificationToken || currentDateTime.isAfter(moment(verificationToken.expiresOn))) {
            throw new BadRequestError(MessageUtil.INVALID_VERIFICATION_TOKEN);
        }

        const user = await UserRepo.findById(verificationToken.userId);
        user.verifiedAt = currentDateTime.toDate().getMilliseconds();

        await VerificationTokenRepo.remove(verificationToken);
        await UserRepo.update(user);
    }

    export const generateResetPasswordTokenForUser = async (userId: number) => {

        const user = await findByIdOrThrow(userId);

        const resetPasswordToken = await ResetPasswordTokenRepo.findByUserId(userId);
        if (resetPasswordToken) {
            await ResetPasswordTokenRepo.remove(resetPasswordToken);
        }

        const token = await generateUniqueResetPasswordToken();

        const newResetPasswordToken = new ResetPasswordToken({
            userId: user.id,
            token: token,
            expiresOn: moment().add(30, "minutes").toISOString()
        });

        await ResetPasswordTokenRepo.insert(newResetPasswordToken);

        return {
            token: newResetPasswordToken.token,
            expiresOn: newResetPasswordToken.expiresOn
        }
    }

    export const resetPassword = async (dto: ResetPasswordDTO): Promise<void> => {
        if (!(dto.token && dto.password && dto.confirmPassword)) {
            throw new BadRequestError();
        }

        if (!ValidationUtil.isValidPassword(dto.password)) {
            throw new BadRequestError(MessageUtil.INVALID_PASSWORD);
        }

        if (!ValidationUtil.arePasswordsTheSame(dto.password, dto.confirmPassword)) {
            throw new BadRequestError(MessageUtil.PASSWORDS_DO_NOT_MATCH);
        }

        const currentDateTime = moment();
        const resetPasswordToken = await ResetPasswordTokenRepo.findByToken(dto.token);

        if (!resetPasswordToken || currentDateTime.isAfter(moment(resetPasswordToken.expiresOn))) {
            throw new BadRequestError(MessageUtil.INVALID_RESET_PASSWORD_TOKEN);
        }

        const user = await UserRepo.findById(resetPasswordToken.userId);
        user.password = await PasswordHasherUtil.hashPassword(dto.password);

        await UserRepo.update(user);
    }

    export const findUsersForRole = async (role: Role): Promise<User[]> => {
        const users = (await UserRepo.findAll()).filter(user => {
            return user.roles.some((r: Role) => role.id == r.id);
        })
        return users;
    }

    export const hasPermissionTo = (
        data: {
            permission: string, 
            user: User
        }
    ): boolean => {
        if (!data.user || !data.user.roles.length) {
            return false;
        }

        let userPermissions: string[] = [];
        for (let i = 0; i < data.user.roles.length; i++) {
            data.user.roles[i].permissions.forEach(perm => {
                userPermissions.push(perm.name);
            });
        }

        if (!new Set([...userPermissions]).has(data.permission)) {
            return false;
        }

        return true;
    }

    export const hasPermissionToOrThrow = (
        data: {
            permission: string, 
            user: User
        }
    ) => {
        if(!hasPermissionTo(data)){
            throw new ForbiddenError();
        }
    }

    export const assignRoleToUser = async (
        data: {
            roleId: number, 
            userId: number, 
            currentUser: User
        }
    ) => {

        hasPermissionToOrThrow({
            permission: permissionContants.ASSIGN_ROLES_TO_USERS, 
            user: data.currentUser
        });

        const role = await RoleService.findByIdOrThrow(data.roleId);
        const user = await findByIdOrThrow(data.userId);

        user.roles.push(role);
        return await UserRepo.update(user);
    }


    export const unassignRoleFromUser = async (
        data: {
            roleId: number, 
            userId: number, 
            currentUser: User
        }
    ) => {
        hasPermissionToOrThrow({
            permission: permissionContants.UNASSIGN_ROLES_FROM_USERS, 
            user: data.currentUser
        });

        const role = await RoleService.findByIdOrThrow(data.roleId);
        const user = await findByIdOrThrow(data.userId);

        user.roles = user.roles.filter(r => r.id !== role.id);
        return await UserRepo.update(user);
    }

    export const getProfile = async (
        data: {
            userId: number, 
            currentUser: User
        }
    ): Promise<User> => {

        if(data.userId == data.currentUser.id || hasPermissionTo({
            permission: permissionContants.READ_USERS, 
            user: data.currentUser
        })){
            const user = await UserRepo.findById(data.userId);
            return user;
        }

        throw new ForbiddenError();
        
    }

    export const updateProfile = async (
        data: {
            userId: number,
            currentUser: User,
        }
    ): Promise<User> => {
        throw new Error();
    }

}

const validateUser = (user: User) => {
    if (!user.enabled) {
        throw new UnAuthorizedError(MessageUtil.USER_DISABLED);
    }

    if (!user.verifiedAt) {
        throw new UnAuthorizedError(MessageUtil.USER_NOT_VERIFIED);
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

