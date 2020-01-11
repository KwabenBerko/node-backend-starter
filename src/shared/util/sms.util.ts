import { HubtelSms } from "hubtel-sms";
import { BadRequestError } from "../errors/bad-request.error"
import { ValidationUtil } from "./validation.util";
import { MessageUtil } from "./message.util";

const hubtelSms = new HubtelSms({
    clientId: "process.env.HUBTEL_CLIENT_ID",
    clientSecret: "process.env.HUBTEL_CLIENT_SECRET"
})

export namespace SmsUtil {
    export const sendMessageTo = async (phoneNumber: string, message: string): Promise<void> => {

        if(!ValidationUtil.isValidPhoneNumber(phoneNumber)){
            throw new BadRequestError(MessageUtil.INVALID_PHONE_NUMBER)
        }

        if(!ValidationUtil.isValidSmsMessage(message)){
            throw new BadRequestError(MessageUtil.INVALID_SMS_MESSAGE_LENGTH);
        }

    
        const data = await hubtelSms.sendMessage({
            From: process.env.COMPANY_NAME as string,
            To: phoneNumber,
            Content: message
        })

        // console.log(data);
    
        return;
    
    }
}