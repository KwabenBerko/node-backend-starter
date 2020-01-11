import { expect, sandbox } from "../../setup"
import { MailerUtil } from "../../../src/shared/util/mailer.util";
import { MailTypes } from "../../../src/shared/util/constant.util";
import { faker } from "../../data.factory";
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { MessageUtil } from "../../../src/shared/util/message.util";
import Mail = require("nodemailer/lib/mailer");


describe("Mailer Util", () => {

    before(() => {
        process.env.MAIL_SMTP_HOST = faker.random.uuid();
        process.env.MAIL_SMTP_PORT = faker.random.uuid();
        process.env.MAIL_SMTP_USERNAME = faker.random.uuid();
        process.env.MAIL_SMTP_PASSWORD = faker.random.uuid();
    })

    after(() => {
        delete process.env.MAIL_SMTP_HOST;
        delete process.env.MAIL_SMTP_PORT;
        delete process.env.MAIL_SMTP_USERNAME;
        delete process.env.MAIL_SMTP_PASSWORD;
    })

    it("should throw BadRequestError if mail type is not supported.", async () => {
        await expect(MailerUtil.sendMail(faker.name.title(), {
            firstName: faker.name.firstName(),
            email: faker.internet.email(),
            link: faker.internet.url()
        })).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.UNSUPPORTED_MAIL_TYPE)
    });

    it("should throw BadRequestError if email is invalid", async () => {
        await expect(MailerUtil.sendMail(MailTypes.FORGOT_PASSWORD, {
            firstName: faker.name.firstName(),
            email: faker.phone.phoneNumber(),
            link: faker.internet.url()
        })).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_EMAIL_ADDRESS);
    })

    

    it("should throw BadRequestError if expiresInFromNow field is empty", async () => {
        await expect (MailerUtil.sendMail(MailTypes.ACCOUNT_VERIFICATION, {
            firstName: faker.name.firstName(),
            email: faker.internet.email(),
            link: faker.internet.url()
        })).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
    })

    it("should successfully send email", async () => {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 165);

        const sendMailStub = sandbox.stub(Mail.prototype, "sendMail").resolves();

        await expect (MailerUtil.sendMail(MailTypes.ACCOUNT_VERIFICATION, {
            firstName: faker.name.firstName(),
            email: faker.internet.email(),
            link: faker.internet.url(),
            expiresIn: date
        })).to.be.eventually.fulfilled;

        expect(sendMailStub).to.be.calledOnce;
    })
})