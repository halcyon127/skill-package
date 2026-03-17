"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runConfig = void 0;
const utils_1 = require("../utils");
const runConfig = async (args) => {
    if ((0, utils_1.isHelpFlag)(args)) {
        (0, utils_1.printUsage)('config');
        return 0;
    }
    const { config, restArgs } = (0, utils_1.extractConfigArgs)(args);
    if (restArgs.length > 0) {
        (0, utils_1.printCliError)({
            message: `unexpected argument "${restArgs[0]}"`,
            command: 'config',
            usage: 'aeolus config --host <host> [--token <token>]',
        });
        return 1;
    }
    if (!config.host && !config.token) {
        (0, utils_1.printCliError)({
            message: 'at least one of --host or --token is required',
            command: 'config',
            usage: 'aeolus config --host <host> [--token <token>]',
        });
        return 1;
    }
    const { filePath } = await (0, utils_1.mergeAndWriteConfig)(config);
    process.stdout.write(`config saved: ${filePath}\n`);
    return 0;
};
exports.runConfig = runConfig;
