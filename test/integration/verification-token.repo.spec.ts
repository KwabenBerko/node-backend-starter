import "./db-setup";
import {verificationToken} from "../data.factory";
import { VerificationTokenRepo } from "../../src/user/verification-token.repository";
import { expect } from "../setup";
import moment from "moment";
import { knex } from "../../src/shared/database";



// describe("Verification Token Repository", () => {
//     it("should save verification token", async () => {
//         const newVerificationToken = {...verificationToken};

//         const saved = await VerificationTokenRepo.insert(newVerificationToken);

//         expect(saved).to.not.be.undefined;
//         expect(saved.id).to.not.be.undefined;
//         expect(moment(saved.expiresOn).toISOString()).to.be.equal(moment(newVerificationToken.expiresOn).toISOString())

//     })
// })