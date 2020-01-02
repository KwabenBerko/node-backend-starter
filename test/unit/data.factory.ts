import faker from "faker";
import { User, Gender } from "../../src/user/user.model";
import { RegisterUserDTO } from "../../src/user/dto/register-user.dto";
import { ResetPasswordToken } from "../../src/user/reset-password-token.model";
import { VerificationToken } from "../../src/user/verification-token.model";
import { ResetPasswordDTO } from "../../src/user/dto/reset-password.dto";
import { OauthLoginDTO } from "../../src/user/dto/oauth-login.dto";
import { LoginDTO } from "../../src/user/dto/login.dto";
import { Role } from "../../src/role/role.model";
import { CreateRoleDTO } from "../../src/role/dto/create-role.dto";
import { Permission } from "../../src/permission/permission.model";
import { ModifyRoleDTO } from "../../src/role/dto/modify-role.dto";

const password = faker.internet.password();
const phoneNumber = faker.phone.phoneNumber("+233#########");


const user: User = new User({
    firstName: faker.name.firstName(), 
    lastName: faker.name.lastName()
});
user.id = faker.random.number(50);
user.gender = Gender["F"];
user.email = faker.internet.email();
user.phoneNumber = phoneNumber;
user.password = password;
user.roles = [];
user.enabled = true;
user.verifiedAt = faker.date.past().getTime();
user.createdAt = faker.date.past().getTime();
user.modifiedAt = faker.date.recent().getTime();


const registerUserDTO: RegisterUserDTO = new RegisterUserDTO({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    gender: faker.random.arrayElement(["m", "f"]),
    email: faker.internet.email(),
    phoneNumber: phoneNumber,
    password: password,
    confirmPassword: password
});



const loginDTO = new LoginDTO({
    email: faker.internet.email(),
    password: password
});

const oauthLoginDTO = new OauthLoginDTO({
    oauthId: faker.random.uuid(),
    oauthProvider: faker.random.arrayElement(["google", "facebook"]),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName()
});

const resetPasswordDTO = new ResetPasswordDTO({
    token: faker.random.uuid(),
    password: password,
    confirmPassword: password
});

const verificationToken = new VerificationToken({
    userId: faker.random.number(3),
    token: faker.random.uuid(),
    expiresOn: faker.date.future().getTime()
});
verificationToken.id = faker.random.number(5);

const resetPasswordToken = new ResetPasswordToken({
    userId: faker.random.number(4),
    token: faker.random.uuid(),
    expiresOn: faker.date.future().getTime()
});
resetPasswordToken.id = faker.random.number(2);


const permission = new Permission({
    name: `${faker.hacker.verb().toUpperCase()}_${faker.hacker.noun().toUpperCase()}`
});
permission.id = faker.random.number(3);


const role = new Role("Super Administrator", [permission]);
role.id = faker.random.number(5);
role.createdOn = faker.date.past().getTime();
role.modifiedOn = faker.date.past().getTime();

const createRoleDTO = new CreateRoleDTO({
    name: "Basic",
    permissionIds: [2, 5, 1]
});


const modifyRoleDTO = new ModifyRoleDTO({
    name: "Auditor",
    permissionIds: [7, 9, 2, 1]
});

export {
    faker,
    user,
    registerUserDTO as registerAccountDTO,
    loginDTO,
    oauthLoginDTO,
    resetPasswordDTO,
    verificationToken,
    resetPasswordToken,
    permission,
    role,
    createRoleDTO,
    modifyRoleDTO
}
