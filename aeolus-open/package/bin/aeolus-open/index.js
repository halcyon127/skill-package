"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.runCli = void 0;
const entrypoint_1 = require("../cli/entrypoint");
const cli_config_1 = require("./cli-config");
_a = (0, entrypoint_1.createCliEntrypoint)(cli_config_1.cliConfig), exports.runCli = _a.runCli, exports.run = _a.run;
if (require.main === module) {
    void (0, exports.run)();
}
