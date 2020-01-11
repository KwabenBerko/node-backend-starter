import { SmsUtil } from "../../../src/shared/util/sms.util";
import { expect, sandbox } from "../../setup";
import { faker } from "../../data.factory";
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { HubtelSms } from "hubtel-sms";
import { SendMessageResponse } from "hubtel-sms/dist/lib/interfaces/SendMessageResponse";


describe("Sms Util", () => {

    const phoneNumber = faker.phone.phoneNumber("+233#########");
    const message = faker.lorem.lines(180);

    beforeEach(() => {
        process.env.HUBTEL_CLIENT_ID = faker.random.uuid();
        process.env.HUBTEL_CLIENT_SECRET = faker.random.uuid();
    })

    afterEach(() => {
        delete process.env.HUBTEL_CLIENT_ID;
        delete process.env.HUBTEL_CLIENT_SECRET;
    })

    it("should throw BadRequestError if phone number is invalid", async () => {
        await expect(SmsUtil.sendMessageTo("8977123", message)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_PHONE_NUMBER);
    })

    it("should throw BadRequestError if message is invalid", async () => {
        await expect(SmsUtil.sendMessageTo(phoneNumber, message)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_SMS_MESSAGE_LENGTH);
    })

    it("should successfully send sms", async () => {
        const sendMessageStub = sandbox.stub(HubtelSms.prototype, <any>"sendMessage").resolves({} as SendMessageResponse);

        await expect(SmsUtil.sendMessageTo(phoneNumber, message.slice(0, 150))).to.be.eventually.fulfilled;
        expect(sendMessageStub).to.be.calledOnce;
    })
})