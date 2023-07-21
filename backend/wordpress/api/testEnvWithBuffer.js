// Using a custom environment because of known bug https://github.com/facebook/jest/issues/4422
const NodeEnvironment = require("jest-environment-node");

class CustomEnvironment extends NodeEnvironment {
    async setup() {
        await super.setup();
        this.global.Uint8Array = Uint8Array;
    }
}

module.exports = CustomEnvironment;
