import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: Number(process.env.MAIL_SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_SMTP_USERNAME,
        pass: process.env.MAIL_SMTP_PASSWORD
    }
})

export namespace MailerUtil {

    export const sendMail = async () => {
        console.log(transporter.options)
        console.log(await transporter.verify());
        console.log("HERE!")
        const info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>',
            to: "bar@example.com, baz@example.com",
            subject: "Hello ✔",
            text: "Hello world?",
            html: "<b>Hello world?</b>"
        });

        console.log("Message Sent");
        console.log(info);
    }
}