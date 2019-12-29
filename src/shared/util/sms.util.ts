import { HubtelSms } from "hubtel-sms";
import { BadRequestError } from "../errors/bad-request.error"
import * as ValidationUtil from "./validation.util";
import * as MessageUtil from "./message.util";

const hubtelSms = new HubtelSms({
    clientId: process.env.HUBTEL_CLIENT_ID,
    clientSecret: process.env.HUBTEL_CLIENT_SECRET
})

export const sendMessageTo = async (phoneNumber: string, message: string): Promise<void> => {
    if(!(phoneNumber && message)){
        throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA)
    }

    if(!ValidationUtil.isValidPhoneNumber(phoneNumber)){
        throw new BadRequestError(MessageUtil.INVALID_PHONE_NUMBER)
    }

    const data = await hubtelSms.sendMessage({
        From: process.env.COMPANY_NAME as string,
        To: phoneNumber,
        Content: message
    })

    return;

}