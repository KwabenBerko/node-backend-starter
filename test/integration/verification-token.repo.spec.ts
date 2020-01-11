import "../db-setup";
import {verificationToken, user} from "../data.factory";
import { VerificationTokenRepo } from "../../src/user/verification-token.repository";
import { expect } from "../setup";
import moment from "moment";
import { VerificationTokenModel } from "../../src/user/verification-token.model";
import { UserModel } from "../../src/user/user.model";


describe("Verification Token Repository", () => {

    let newVerificationToken: VerificationTokenModel;
    
    beforeEach(async () => {
        const createdUser = await UserModel.query().insertAndFetch({...user});

        newVerificationToken = {...verificationToken, id: 9999, userId: createdUser.id} as VerificationTokenModel;
    })
    

    it("should save verification token", async () => {
        const saved = await VerificationTokenRepo.insert(newVerificationToken);

        expect(saved).to.not.be.undefined;
        expect(saved.id).to.not.be.undefined;
        expect(saved.id).to.not.be.equal(0);
        expect(saved.id).to.not.be.equal(newVerificationToken.id);
        expect(saved.userId).to.be.equal(newVerificationToken.userId);
        expect(moment(saved.expiresOn).toISOString()).to.be.equal(moment(newVerificationToken.expiresOn).toISOString())

    });

    it("should remove verification token", async () => {
        const saved = await VerificationTokenRepo.insert(newVerificationToken);
        
        await VerificationTokenRepo.remove(saved);

        expect(await VerificationTokenRepo.findById(saved.id)).to.be.undefined;
    })

    it("should find by id", async () => {
        const saved = await VerificationTokenRepo.insert(newVerificationToken);
        const found = await VerificationTokenRepo.findById(saved.id);

        expect(found).to.be.not.undefined;
        expect(found).to.be.deep.equal(saved);
    })

    it("should find by token", async () => {
        const saved = await VerificationTokenRepo.insert(newVerificationToken);
        const found = await VerificationTokenRepo.findByToken(saved.token);

        expect(found).to.be.not.undefined;
        expect(found).to.be.deep.equal(saved);
    })

    it("should find by user id", async () => {
        const saved = await VerificationTokenRepo.insert(newVerificationToken);
        const found = await VerificationTokenRepo.findByUserId(saved.userId);

        expect(found).to.be.not.undefined;
        expect(found).to.be.deep.equal(saved);
    })
})