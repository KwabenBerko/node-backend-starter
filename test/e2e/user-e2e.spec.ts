import "../db-setup"
import chaiHttp from "chai-http";
import { expect, chai } from "../setup";
import { server } from "../../src/server";
import { faker } from "../data.factory";

chai.use(chaiHttp);

describe("Users", () => {
    describe("Register User", () => {
        it("should successfully register user", async () => {

            const password = faker.internet.password();

            const newUser = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                gender: faker.random.arrayElement(["m", "f"]),
                email: faker.internet.email(),
                phoneNumber: faker.phone.phoneNumber("+233#########"),
                password,
                confirmPassword: password
            }

            const response = await chai.request(server)
                .post("/users/signup")
                .send(newUser)

            expect(response.status).to.be.equal(201);
            expect(response.body).to.not.be.undefined;
            expect(response.body.error).to.be.undefined;
            expect(response.body.firstName).to.be.equal(newUser.firstName);
            expect(response.body.lastName).to.be.equal(newUser.lastName)
            expect(response.body.gender).to.be.equal(newUser.gender)
            expect(response.body.email).to.be.equal(newUser.email)
            expect(response.body.phoneNumber).to.be.equal(newUser.phoneNumber)
            expect(response.body.password).to.be.undefined;
        })
    })
})
