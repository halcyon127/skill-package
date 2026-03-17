"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCliEntrypoint = void 0;
const runner_1 = require("./runner");
const createCliEntrypoint = (config) => {
    const runCli = (0, runner_1.createCliRunner)(config);
    const run = (cliArgs = process.argv.slice(2)) => (0, runner_1.runCliMain)(runCli, cliArgs);
    return {
        runCli,
        run,
    };
};
exports.createCliEntrypoint = createCliEntrypoint;
