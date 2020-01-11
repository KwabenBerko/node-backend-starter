import "./db-setup";
import {resetPasswordToken, user} from "../data.factory";
import { ResetPasswordTokenRepo } from "../../src/user/reset-password-token.repository";
import { expect } from "../setup";
import moment from "moment";
import { ResetPasswordTokenModel } from "../../src/user/reset-password-token.model";
import { UserModel } from "../../src/user/user.model";


describe("Reset Password Token Repository", () => {

    let newResetPasswordToken: ResetPasswordTokenModel;

    beforeEach(async () => {
        const createdUser = await UserModel.query().insertAndFetch({...user});

        newResetPasswordToken = {...resetPasswordToken, id: 9999, userId: createdUser.id} as ResetPasswordTokenModel;
    })
    

    it("should save verification token", async () => {
        const saved = await ResetPasswordTokenRepo.insert(newResetPasswordToken);

        expect(saved).to.not.be.undefined;
        expect(saved.id).to.not.be.undefined;
        expect(saved.id).to.not.be.equal(0);
        expect(saved.id).to.not.be.equal(newResetPasswordToken.id);
        expect(saved.userId).to.be.equal(newResetPasswordToken.userId);
        expect(moment(saved.expiresOn).toISOString()).to.be.equal(moment(newResetPasswordToken.expiresOn).toISOString())

    });

    it("should remove verification token", async () => {
        const saved = await ResetPasswordTokenRepo.insert(newResetPasswordToken);
        
        await ResetPasswordTokenRepo.remove(saved);

        expect(await ResetPasswordTokenRepo.findById(saved.id)).to.be.undefined;
    })

    it("should find by id", async () => {
        const saved = await ResetPasswordTokenRepo.insert(newResetPasswordToken);
        const found = await ResetPasswordTokenRepo.findById(saved.id);

        expect(found).to.be.not.undefined;
        expect(found).to.be.deep.equal(saved);
    })

    it("should find by token", async () => {
        const saved = await ResetPasswordTokenRepo.insert(newResetPasswordToken);
        const found = await ResetPasswordTokenRepo.findByToken(saved.token);

        expect(found).to.be.not.undefined;
        expect(found).to.be.deep.equal(saved);
    })

    it("should find by user id", async () => {
        const saved = await ResetPasswordTokenRepo.insert(newResetPasswordToken);
        const found = await ResetPasswordTokenRepo.findByUserId(saved.userId);

        expect(found).to.be.not.undefined;
        expect(found).to.be.deep.equal(saved);
    })
})