import faker from "faker";
import { Account, Gender } from "../../src/account/account.model";
import { RegisterAccountDTO } from "../../src/account/dto/register-account.dto";
import { ResetPasswordToken } from "../../src/account/reset-password-token.model";
import { VerificationToken } from "../../src/account/verification-token.model";
import { ResetPasswordDTO } from "../../src/account/dto/reset-password.dto";
import { OauthLoginDTO } from "../../src/account/dto/oauth-login.dto";
import { LoginDTO } from "../../src/account/dto/login.dto";
import { Role } from "../../src/role/role.model";
import { CreateRoleDTO } from "../../src/role/dto/create-role.dto";
import { Permission } from "../../src/permission/permission.model";

const password = faker.internet.password();
const phoneNumber = faker.phone.phoneNumber("+233#########");


export const account: Readonly<Account> = {
    id: faker.random.number(50),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    gender: Gender["F"],
    email: faker.internet.email(),
    phoneNumber: phoneNumber,
    password: password,
    roles: [],
    enabled: true,
    verifiedAt: faker.date.past().getTime(),
    createdAt: faker.date.past().getTime(),
    modifiedAt: faker.date.recent().getTime()
};


export const registerAccountDTO: Readonly<RegisterAccountDTO> = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    gender: faker.random.arrayElement(["m", "f"]),
    email: faker.internet.email(),
    phoneNumber: phoneNumber,
    password: password,
    confirmPassword: password
};


export const loginDTO: Readonly<LoginDTO> = {
    email: faker.internet.email(),
    password: password
}

export const oauthLoginDTO: Readonly<OauthLoginDTO> = {
    oauthId: faker.random.uuid(),
    oauthProvider: faker.random.arrayElement(["google", "facebook"]),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
};

export const resetPasswordDTO: Readonly<ResetPasswordDTO> = {
    token: faker.random.uuid(),
    password,
    confirmPassword: password
};

export const verificationToken: Readonly<VerificationToken> = {
    id: faker.random.number(5),
    accountId: faker.random.number(3),
    token: faker.random.uuid(),
    expiresOn: faker.date.future().getTime()
};

export const resetPasswordToken: Readonly<ResetPasswordToken> = {
    id: faker.random.number(2),
    accountId: faker.random.number(4),
    token: faker.random.uuid(),
    expiresOn: faker.date.future().getTime()
};

export const permission: Permission = {
    id: faker.random.number(3),
    name: `${faker.hacker.verb().toUpperCase()} ${faker.hacker.noun().toUpperCase()}`
}

export const role: Readonly<Role> = {
    id: faker.random.number(5),
    name: "Super Administrator",
    permissions: [permission],
    createdAt: faker.date.past().getTime(),
    modifiedAt: faker.date.past().getTime()
};

export const createRoleDTO: Readonly<CreateRoleDTO> = {
    name: "Auditor",
    permissionIds: [2, 5, 1]
};

export {
    faker
}
