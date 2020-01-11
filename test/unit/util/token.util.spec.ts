import { TokenUtil, Token } from "../../../src/shared/util/token.util"
import { expect } from "../../setup";
import { faker } from "../../data.factory";
import { UnAuthorizedError } from "../../../src/shared/errors/unauthorized.error";
import { MessageUtil } from "../../../src/shared/util/message.util";

describe("Token Util", () => {
    describe("Create Token", () => {
        it("should create a token", async () => {
            const data = TokenUtil.createToken({});
            expect(data).to.not.be.undefined;
            expect(data.tokenType).to.be.equal("Bearer");
            expect(data.accessToken).to.not.be.undefined;
            expect(typeof data.expiresInMillis).to.be.equal("number");
        });
    })

    describe("Decode Token", () => {

        let createdToken: Token;
        const data = {
            id: faker.random.number(),
            email: faker.internet.email()
        }
    
        beforeEach(() => {
            createdToken = TokenUtil.createToken(data)
        })

        it.only("should throw UnAuthorizedError if token is invalid", async () => {
            await expect(TokenUtil.decodeToken(undefined!)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_AUTHORIZATION_TOKEN)
        })

        it.only("should throw UnAuthorizedError if tokenType is invalid", async () => {
            await expect(TokenUtil.decodeToken(createdToken.accessToken)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_AUTHORIZATION_TOKEN)
        });

        it.only("should throw UnAuthorizedError if token verification failed", async () => {
            await expect(TokenUtil.decodeToken(`${createdToken.tokenType} ${faker.random.uuid()}`)).to.be.eventually.rejectedWith(UnAuthorizedError, MessageUtil.INVALID_AUTHORIZATION_TOKEN);
        })

        it.only("should decode token", async () => {
            const promise = TokenUtil.decodeToken(`${createdToken.tokenType} ${createdToken.accessToken}`);
    
            await expect(promise).to.be.eventually.fulfilled;
            const decoded = await promise;
            expect(decoded).to.not.be.undefined;
            expect(decoded.id).to.be.equal(data.id);
            expect(decoded.email).to.be.equal(data.email);
        })
    })
})