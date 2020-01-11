import { expect } from "../../setup"
import { MailerUtil } from "../../../src/shared/util/mailer.util";


describe("Mailer Util", () => {
    it.only("should successfully send email", async () => {
        await MailerUtil.sendMail();
    })
})