"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCliMain = exports.createCliRunner = void 0;
const utils_1 = require("../utils");
const isCliCommand = (value, config) => value in config.commandHandlers;
const createCliRunner = (config) => {
    return async (cliArgs) => {
        (0, utils_1.setActiveCliSurfaceUtils)(config.surfaceUtils);
        const [command, ...rest] = cliArgs;
        const { cliName, visibleCommands } = config.surfaceUtils.profile;
        if (command === '-v' || command === '--version') {
            await (0, utils_1.printVersion)();
            return 0;
        }
        if (!command || command === '-h' || command === '--help') {
            (0, utils_1.printUsage)();
            return 0;
        }
        if (isCliCommand(command, config)) {
            const isLatest = await (0, utils_1.ensureCliIsLatest)();
            if (!isLatest) {
                return 1;
            }
            return config.commandHandlers[command](rest);
        }
        (0, utils_1.printCliError)({
            message: `unknown command "${command}"`,
            usage: `${cliName} <command> [args] [options]`,
            expected: visibleCommands,
        });
        return 1;
    };
};
exports.createCliRunner = createCliRunner;
const runCliMain = async (runCli, cliArgs = process.argv.slice(2)) => {
    try {
        process.exit(await runCli(cliArgs));
    }
    catch (error) {
        process.stderr.write(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
};
exports.runCliMain = runCliMain;
