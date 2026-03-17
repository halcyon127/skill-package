"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedCommandUsageLabels = exports.createSharedCommandDocs = void 0;
const createSharedCommandDocs = (cliName) => ({
    config: {
        summary: 'Save default host/token into .aeolus/config.json',
        usage: [
            `${cliName} config --host <host>`,
            `${cliName} config --token <token>`,
            `${cliName} config --host <host> --token <token>`,
        ],
        options: [
            '--host <host>              API host',
            '--token <token>            API token',
        ],
        examples: [
            `${cliName} config --host <host>`,
            `${cliName} config --token <your-token>`,
            `${cliName} config --host <host> --token <your-token>`,
        ],
        notes: [
            'Config is stored at <workspace>/.aeolus/config.json and shared by all app/<appId>/ workspaces.',
        ],
    },
    pull: {
        summary: 'Pull remote dashboard/chart/dataset JSON to local files',
        usage: [
            `${cliName} pull dashboard/<dashboardId>`,
            `${cliName} pull dashboard/<dashboardId>/sheet/<sheetId>`,
            `${cliName} pull chart/<chartId>`,
            `${cliName} pull dataset/<datasetId>`,
        ],
        targets: [
            'dashboard/<dashboardId>',
            'dashboard/<dashboardId>/sheet/<sheetId>',
            'chart/<chartId>',
            'dataset/<datasetId>',
        ],
        output: [
            'dashboard: app/<appId>/dashboard/<dashboardId>/dashboard.json',
            'dashboard sheet: app/<appId>/dashboard/<dashboardId>/sheet/<sheetId>.json',
            'chart: app/<appId>/chart/<chartId>.json',
            'dataset: app/<appId>/dataset/<datasetId>.json',
        ],
        examples: [
            `${cliName} pull dashboard/12345`,
            `${cliName} pull dashboard/12345/sheet/67890`,
            `${cliName} pull chart/999`,
            `${cliName} pull dataset/555`,
        ],
        notes: [
            'pull dashboard/<dashboardId> fetches dashboard + all sheets + all charts + all datasets in that dashboard.',
            'pull dashboard/<dashboardId>/sheet/<sheetId> fetches sheet + all charts + all datasets used by that sheet.',
            'pull chart/<chartId> fetches the chart and its dataset together.',
        ],
    },
    search: {
        summary: 'Search datasets/charts/dashboards by keyword text',
        usage: [
            `${cliName} search <keyword> [--type <type>] [--offset <offset>] [--limit <limit>]`,
            `${cliName} search --keyword <keyword> [--type <type>] [--offset <offset>] [--limit <limit>]`,
        ],
        options: [
            '--keyword <keyword>        Explicit keyword string',
            '--type <type>              Search type: dataset | chart | dashboard',
            '--offset <offset>          Pagination offset, default 0',
            '--limit <limit>            Pagination size, default 20',
        ],
        examples: [
            `${cliName} search "revenue"`,
            `${cliName} search --keyword "weekly overview"`,
            `${cliName} search --keyword=orders --type dataset`,
            `${cliName} search "sales" --type chart --type dashboard`,
            `${cliName} search "sales" --type chart --offset 20 --limit 10`,
        ],
        notes: [
            'Positional keyword and --keyword cannot be used together.',
            'When --type is omitted, dataset/chart/dashboard are all included.',
            '--type does not support sheet.',
            '--offset must be an integer >= 0; --limit must be an integer > 0.',
        ],
    },
});
exports.createSharedCommandDocs = createSharedCommandDocs;
exports.sharedCommandUsageLabels = {
    config: 'config [options]',
    pull: 'pull <target>',
    search: 'search [keyword] [options]',
};
