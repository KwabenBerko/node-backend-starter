import nodemailer from "nodemailer";
import moment from "moment";
import { MailTypes } from "../../shared/util/constant.util";
import { MessageUtil } from "./message.util";
import { BadRequestError } from "../errors/bad-request.error";
import { ValidationUtil } from "./validation.util";
import Mail from "nodemailer/lib/mailer";


let transporter: Mail;

export namespace MailerUtil {

    export const sendMail = async (mailType: string, data: {
        firstName: string,
        email: string,
        link: string,
        expiresIn?: Date
    }): Promise<void> => {

        transporter =  nodemailer.createTransport({
            host: process.env.MAIL_SMTP_HOST,
            port: Number(process.env.MAIL_SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.MAIL_SMTP_USERNAME,
                pass: process.env.MAIL_SMTP_PASSWORD
            }
        })        

        let subject;
        let text;
        
        if(!ValidationUtil.isValidEnum(MailTypes, mailType)){
            throw new BadRequestError(MessageUtil.UNSUPPORTED_MAIL_TYPE);
        }

        if(!ValidationUtil.isValidEmail(data.email)){
            throw new BadRequestError(MessageUtil.INVALID_EMAIL_ADDRESS);
        }

        switch (mailType) {
            case MailTypes.ACCOUNT_VERIFICATION:

               if(!data.expiresIn){
                   throw new BadRequestError();
               }

                subject = MessageUtil.VERIFY_ACCOUNT_TITLE
                text = MessageUtil.VERIFY_ACCOUNT_MESSAGE({
                    firstName: data.firstName,
                    link: data.link,
                    companyName: String(process.env.COMPANY_NAME),
                    expiresInFromNow: moment(data.expiresIn).fromNow()
                });
                break;
            case MailTypes.FORGOT_PASSWORD:
                subject = MessageUtil.FORGOT_PASSWORD_TITLE
                break;
        } 

        const mailOptions: Mail.Options = {
            from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
            to: data.email,
            subject,
            text,
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(info);
    }
}