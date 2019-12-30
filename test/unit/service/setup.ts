import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai"
import sinon from "sinon";
import faker from "faker";

chai.use(chaiAsPromised);
chai.use(sinonChai)


let sandbox: sinon.SinonSandbox;

beforeEach(() => {
    sandbox = sinon.createSandbox();
})

afterEach(() => {
    sandbox.restore();
})

export {
    expect,
    sandbox,
    faker
}