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
import { ModifyRoleDTO } from "../../src/role/dto/modify-role.dto";

const password = faker.internet.password();
const phoneNumber = faker.phone.phoneNumber("+233#########");


const account: Account = new Account(faker.name.firstName(), faker.name.lastName());
account.id = faker.random.number(50);
account.gender = Gender["F"];
account.email = faker.internet.email();
account.phoneNumber = phoneNumber;
account.password = password;
account.roles = [];
account.enabled = true;
account.verifiedAt = faker.date.past().getTime();
account.createdAt = faker.date.past().getTime();
account.modifiedAt = faker.date.recent().getTime();


const registerAccountDTO: RegisterAccountDTO = new RegisterAccountDTO();
registerAccountDTO.firstName = faker.name.firstName();
registerAccountDTO.lastName = faker.name.lastName();
registerAccountDTO.gender = faker.random.arrayElement(["m", "f"]);
registerAccountDTO.email = faker.internet.email();
registerAccountDTO.phoneNumber = phoneNumber;
registerAccountDTO.password = password;
registerAccountDTO.confirmPassword = password;



const loginDTO = new LoginDTO();
loginDTO.email = faker.internet.email();
loginDTO.password = password;

const oauthLoginDTO = new OauthLoginDTO();
oauthLoginDTO.oauthId = faker.random.uuid();
oauthLoginDTO.oauthProvider = faker.random.arrayElement(["google", "facebook"]);
oauthLoginDTO.firstName = faker.name.firstName();
oauthLoginDTO.lastName = faker.name.lastName();

const resetPasswordDTO = new ResetPasswordDTO();
resetPasswordDTO.token = faker.random.uuid();
resetPasswordDTO.password = password;
resetPasswordDTO.confirmPassword = password;

const verificationToken = new VerificationToken({
    accountId: faker.random.number(3),
    token: faker.random.uuid(),
    expiresOn: faker.date.future().getTime()
});
verificationToken.id = faker.random.number(5);

const resetPasswordToken = new ResetPasswordToken({
    accountId: faker.random.number(4),
    token: faker.random.uuid(),
    expiresOn: faker.date.future().getTime()
});
resetPasswordToken.id = faker.random.number(2);


const permission = new Permission();
permission.id = faker.random.number(3);
permission.name = `${faker.hacker.verb().toUpperCase()}_${faker.hacker.noun().toUpperCase()}`;


const role = new Role("Super Administrator", [permission]);
role.id = faker.random.number(5);
role.createdAt = faker.date.past().getTime();
role.modifiedAt = faker.date.past().getTime();

const createRoleDTO = new CreateRoleDTO();
createRoleDTO.name = "Auditor";
createRoleDTO.permissionIds = [2, 5, 1];


const modifyRoleDTO = new ModifyRoleDTO();
modifyRoleDTO.name = "Auditor",
modifyRoleDTO.permissionIds = [7, 9, 2, 1];

export {
    faker,
    account,
    registerAccountDTO,
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
