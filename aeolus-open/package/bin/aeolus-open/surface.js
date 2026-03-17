"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openCliSurfaceUtils = void 0;
const utils_shared_1 = require("../utils-shared");
const shared_command_docs_1 = require("../cli/shared-command-docs");
const cliName = 'aeolus-open';
const profile = {
    cliName,
    headline: 'aeolus-open - external Aeolus resource CLI for AI workflows',
    visibleCommands: ['config', 'pull', 'search'],
    globalExamples: [
        'aeolus-open config --host <host> --token <your-token>',
        'aeolus-open search "revenue" --type chart',
        'aeolus-open pull dashboard/12345',
        'aeolus-open pull chart/999',
    ],
    globalNotes: [
        'Use search to discover dashboard, chart, and dataset IDs before pull.',
        'Use config or global --host/--token flags to set workspace credentials.',
    ],
};
exports.openCliSurfaceUtils = (0, utils_shared_1.createCliSurfaceUtils)({
    profile,
    commandDocs: (0, shared_command_docs_1.createSharedCommandDocs)(cliName),
    commandUsageLabels: shared_command_docs_1.sharedCommandUsageLabels,
});
