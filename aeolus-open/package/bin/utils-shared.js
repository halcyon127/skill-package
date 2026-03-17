"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCliSurfaceUtils = exports.notImplemented = exports.printVersion = exports.ensureCliIsLatest = exports.readCliVersion = exports.mergeAndWriteConfig = exports.writeConfig = exports.readConfig = exports.isHelpFlag = exports.isValidNewTarget = exports.isValidTarget = exports.printResourceOutput = exports.resolveDashboardSheetBundleFilePath = exports.resolveDashboardSheetFilePath = exports.resolveDashboardFilePath = exports.resolveDatasetFilePath = exports.resolveChartFilePath = exports.writeDashboardSheetBundleFile = exports.writeDashboardSheetFile = exports.writeDashboardFile = exports.writeChartFile = exports.writeDatasetFile = exports.withRemoteUris = exports.resolveRemoteResourceUrl = exports.extractConfigArgs = exports.getWorkspaceScope = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const configDirName = '.aeolus';
const configFileName = 'config.json';
const appDirName = 'app';
const defaultRemoteHost = 'https://data.bytedance.net';
const isNumericDirName = (value) => /^\d+$/.test(value);
const getWorkspaceScope = (cwd = process.cwd()) => {
    let currentPath = path_1.default.resolve(cwd);
    while (true) {
        const parentPath = path_1.default.dirname(currentPath);
        if (isNumericDirName(path_1.default.basename(currentPath)) &&
            path_1.default.basename(parentPath) === appDirName) {
            return {
                workspaceRoot: path_1.default.dirname(parentPath),
                currentAppId: Number(path_1.default.basename(currentPath)),
                currentAppRoot: currentPath,
            };
        }
        if (parentPath === currentPath) {
            break;
        }
        currentPath = parentPath;
    }
    return {
        workspaceRoot: path_1.default.resolve(cwd),
    };
};
exports.getWorkspaceScope = getWorkspaceScope;
const getConfigPath = () => {
    const { workspaceRoot } = (0, exports.getWorkspaceScope)();
    return path_1.default.join(workspaceRoot, configDirName, configFileName);
};
const fileExists = async (filePath) => {
    try {
        await promises_1.default.access(filePath);
        return true;
    }
    catch {
        return false;
    }
};
const listWorkspaceAppIds = async (workspaceRoot) => {
    try {
        const entries = await promises_1.default.readdir(path_1.default.join(workspaceRoot, appDirName), {
            withFileTypes: true,
        });
        return entries
            .filter((entry) => entry.isDirectory() && isNumericDirName(entry.name))
            .map((entry) => Number(entry.name))
            .filter((value) => Number.isFinite(value))
            .sort((a, b) => a - b);
    }
    catch {
        return [];
    }
};
const resolveAppScopedResourceFile = async (params) => {
    const { relativePathParts, resourceLabel, target } = params;
    const { workspaceRoot, currentAppId, currentAppRoot } = (0, exports.getWorkspaceScope)();
    if (Number.isFinite(currentAppId) && currentAppRoot) {
        const filePath = path_1.default.join(currentAppRoot, ...relativePathParts);
        if (await fileExists(filePath)) {
            return {
                success: true,
                appId: currentAppId,
                filePath,
            };
        }
        return {
            success: false,
            message: `failed to find ${resourceLabel} file for "${target}" under current app workspace "app/${currentAppId}"`,
        };
    }
    const appIds = await listWorkspaceAppIds(workspaceRoot);
    const matches = [];
    for (const appId of appIds) {
        const filePath = path_1.default.join(workspaceRoot, appDirName, String(appId), ...relativePathParts);
        if (await fileExists(filePath)) {
            matches.push({ appId, filePath });
        }
    }
    if (matches.length === 1) {
        return {
            success: true,
            appId: matches[0].appId,
            filePath: matches[0].filePath,
        };
    }
    if (matches.length === 0) {
        return {
            success: false,
            message: `failed to find ${resourceLabel} file for "${target}" under "${path_1.default.join(workspaceRoot, appDirName)}"`,
        };
    }
    return {
        success: false,
        message: `found multiple ${resourceLabel} files for "${target}" across app workspaces; run the command inside app/<appId>`,
    };
};
const normalizeValue = (value) => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const extractConfigArgs = (args) => {
    const config = {};
    const restArgs = [];
    for (let i = 0; i < args.length; i += 1) {
        const item = args[i];
        if (item.startsWith('--host=')) {
            config.host = normalizeValue(item.slice('--host='.length));
            continue;
        }
        if (item === '--host') {
            config.host = normalizeValue(args[i + 1]);
            i += 1;
            continue;
        }
        if (item.startsWith('--token=')) {
            config.token = normalizeValue(item.slice('--token='.length));
            continue;
        }
        if (item === '--token') {
            config.token = normalizeValue(args[i + 1]);
            i += 1;
            continue;
        }
        restArgs.push(item);
    }
    if (!config.host) {
        delete config.host;
    }
    if (!config.token) {
        delete config.token;
    }
    return { config, restArgs };
};
exports.extractConfigArgs = extractConfigArgs;
const getRemoteBaseUrl = async () => {
    const envHost = normalizeValue(process.env.DATA_AGENT_GLUE_HOST);
    if (envHost) {
        return envHost.replace(/\/+$/, '');
    }
    const { host } = await (0, exports.readConfig)();
    const configuredHost = normalizeValue(host);
    return (configuredHost ?? defaultRemoteHost).replace(/\/+$/, '');
};
const resolveRemoteResourceUrl = async (params) => {
    const { resource } = params;
    const baseUrl = await getRemoteBaseUrl();
    const dashboardMatch = /^dashboard\/([^/]+)$/.exec(resource);
    if (dashboardMatch) {
        return `${baseUrl}/aeolus/pages/dashboard/${dashboardMatch[1]}`;
    }
    const sheetMatch = /^dashboard\/([^/]+)\/sheet\/([^/]+)$/.exec(resource);
    if (sheetMatch) {
        return `${baseUrl}/aeolus/pages/dashboard/${sheetMatch[1]}?sheetId=${sheetMatch[2]}`;
    }
    const chartMatch = /^chart\/([^/]+)$/.exec(resource);
    if (chartMatch) {
        return `${baseUrl}/aeolus/pages/dataQuery?rid=${chartMatch[1]}`;
    }
    const datasetMatch = /^dataset\/([^/]+)$/.exec(resource);
    if (datasetMatch) {
        return `${baseUrl}/aeolus/pages/dataManage/detail/${datasetMatch[1]}`;
    }
    return undefined;
};
exports.resolveRemoteResourceUrl = resolveRemoteResourceUrl;
const withRemoteUris = async (resources, appId) => Promise.all(resources.map(async (resource) => {
    if (resource.remoteUri) {
        return resource;
    }
    const remoteUri = await (0, exports.resolveRemoteResourceUrl)({
        resource: resource.resource,
        appId,
    });
    return remoteUri ? { ...resource, remoteUri } : resource;
}));
exports.withRemoteUris = withRemoteUris;
const writeJsonFile = async (relativePathParts, content) => {
    const { workspaceRoot } = (0, exports.getWorkspaceScope)();
    const outputPath = path_1.default.join(workspaceRoot, ...relativePathParts);
    await promises_1.default.mkdir(path_1.default.dirname(outputPath), { recursive: true });
    await promises_1.default.writeFile(outputPath, JSON.stringify(content, null, 2));
    return outputPath;
};
const writeDatasetFile = (appId, datasetId, simpleDataset) => writeJsonFile([appDirName, String(appId), 'dataset', `${datasetId}.json`], simpleDataset);
exports.writeDatasetFile = writeDatasetFile;
const writeChartFile = (appId, chartId, simpleChart) => writeJsonFile([appDirName, String(appId), 'chart', `${chartId}.json`], simpleChart);
exports.writeChartFile = writeChartFile;
const writeDashboardFile = (appId, dashboardId, simpleDashboard) => writeJsonFile([appDirName, String(appId), 'dashboard', String(dashboardId), 'dashboard.json'], simpleDashboard);
exports.writeDashboardFile = writeDashboardFile;
const writeDashboardSheetFile = (appId, dashboardId, sheetId, simpleSheet) => writeJsonFile([
    appDirName,
    String(appId),
    'dashboard',
    String(dashboardId),
    'sheet',
    `${sheetId}.json`,
], simpleSheet);
exports.writeDashboardSheetFile = writeDashboardSheetFile;
const writeDashboardSheetBundleFile = (appId, dashboardId, sheetId, bundle) => writeJsonFile([
    appDirName,
    String(appId),
    '.aeolus',
    'query-bundle',
    'dashboard',
    String(dashboardId),
    'sheet',
    `${sheetId}.json`,
], bundle);
exports.writeDashboardSheetBundleFile = writeDashboardSheetBundleFile;
const resolveChartFilePath = (chartId) => resolveAppScopedResourceFile({
    relativePathParts: ['chart', `${chartId}.json`],
    resourceLabel: 'chart',
    target: `chart/${chartId}`,
});
exports.resolveChartFilePath = resolveChartFilePath;
const resolveDatasetFilePath = (datasetId) => resolveAppScopedResourceFile({
    relativePathParts: ['dataset', `${datasetId}.json`],
    resourceLabel: 'dataset',
    target: `dataset/${datasetId}`,
});
exports.resolveDatasetFilePath = resolveDatasetFilePath;
const resolveDashboardFilePath = (dashboardId) => resolveAppScopedResourceFile({
    relativePathParts: ['dashboard', `${dashboardId}`, 'dashboard.json'],
    resourceLabel: 'dashboard',
    target: `dashboard/${dashboardId}`,
});
exports.resolveDashboardFilePath = resolveDashboardFilePath;
const resolveDashboardSheetFilePath = (dashboardId, sheetId) => resolveAppScopedResourceFile({
    relativePathParts: ['dashboard', `${dashboardId}`, 'sheet', `${sheetId}.json`],
    resourceLabel: 'sheet',
    target: `dashboard/${dashboardId}/sheet/${sheetId}`,
});
exports.resolveDashboardSheetFilePath = resolveDashboardSheetFilePath;
const resolveDashboardSheetBundleFilePath = (dashboardId, sheetId) => resolveAppScopedResourceFile({
    relativePathParts: [
        '.aeolus',
        'query-bundle',
        'dashboard',
        `${dashboardId}`,
        'sheet',
        `${sheetId}.json`,
    ],
    resourceLabel: 'bundle',
    target: `dashboard/${dashboardId}/sheet/${sheetId}`,
});
exports.resolveDashboardSheetBundleFilePath = resolveDashboardSheetBundleFilePath;
const printResourceOutput = ({ action, resources, }) => {
    const lines = [action];
    if (resources.length > 0) {
        lines.push('');
        resources.forEach((item, index) => {
            lines.push(`RESOURCE ${item.resource}`);
            if (item.localUri) {
                lines.push(`LOCAL_URI ${item.localUri}`);
            }
            if (item.remoteUri) {
                lines.push(`REMOTE_URI ${item.remoteUri}`);
            }
            if (index < resources.length - 1) {
                lines.push('');
            }
        });
    }
    process.stdout.write(`${lines.join('\n')}\n`);
};
exports.printResourceOutput = printResourceOutput;
const validTargets = [
    /^dashboard\/[^/]+$/,
    /^dashboard\/[^/]+\/sheet\/[^/]+$/,
    /^chart\/[^/]+$/,
    /^dataset\/[^/]+$/,
];
const validNewTargets = [/^dashboard$/, /^dashboard\/[^/]+\/sheet$/, /^chart$/];
const isValidTarget = (target) => validTargets.some((pattern) => pattern.test(target));
exports.isValidTarget = isValidTarget;
const isValidNewTarget = (target) => validNewTargets.some((pattern) => pattern.test(target));
exports.isValidNewTarget = isValidNewTarget;
const isHelpFlag = (args) => args.includes('-h') || args.includes('--help');
exports.isHelpFlag = isHelpFlag;
const readConfig = async () => {
    try {
        const rawContent = await promises_1.default.readFile(getConfigPath(), 'utf-8');
        const parsed = JSON.parse(rawContent);
        if (!parsed || typeof parsed !== 'object') {
            return {};
        }
        const host = typeof parsed.host === 'string' ? parsed.host : undefined;
        const token = typeof parsed.token === 'string' ? parsed.token : undefined;
        return {
            host,
            token,
        };
    }
    catch {
        return {};
    }
};
exports.readConfig = readConfig;
const writeConfig = async (config) => {
    const configDir = path_1.default.join(process.cwd(), configDirName);
    const filePath = path_1.default.join(configDir, configFileName);
    await promises_1.default.mkdir(configDir, { recursive: true });
    await promises_1.default.writeFile(filePath, JSON.stringify(config, null, 2));
    try {
        await promises_1.default.chmod(filePath, 0o600);
    }
    catch { }
    return filePath;
};
exports.writeConfig = writeConfig;
const mergeAndWriteConfig = async (partialConfig) => {
    const currentConfig = await (0, exports.readConfig)();
    const nextConfig = {
        ...currentConfig,
        ...partialConfig,
    };
    const filePath = await (0, exports.writeConfig)(nextConfig);
    return { filePath, config: nextConfig };
};
exports.mergeAndWriteConfig = mergeAndWriteConfig;
const readCliPackageInfo = async () => {
    try {
        const rawContent = await promises_1.default.readFile(path_1.default.resolve(__dirname, '..', 'package.json'), 'utf-8');
        const parsed = JSON.parse(rawContent);
        const version = typeof parsed.version === 'string' ? parsed.version : 'unknown';
        const name = typeof parsed.name === 'string' ? parsed.name : '@aeolus/cli';
        return { name, version };
    }
    catch {
        return { name: '@aeolus/cli', version: 'unknown' };
    }
};
const readCliVersion = async () => {
    const pkg = await readCliPackageInfo();
    return pkg.version;
};
exports.readCliVersion = readCliVersion;
const ensureCliIsLatest = async () => {
    return true;
};
exports.ensureCliIsLatest = ensureCliIsLatest;
const printVersion = async () => {
    const version = await (0, exports.readCliVersion)();
    process.stdout.write(`${version}\n`);
};
exports.printVersion = printVersion;
const notImplemented = (message) => {
    process.stdout.write(`Not implemented: ${message}\n`);
};
exports.notImplemented = notImplemented;
const defaultGlobalOptionsSection = [
    '--host <host>              Save/override API host for this workspace',
    '--token <token>            Save/override API token for this workspace',
    '-h, --help                 Show help',
    '-v, --version              Show version',
];
const defaultOutputSection = [
    'dashboard: app/<appId>/dashboard/<dashboardId>/dashboard.json',
    'dashboard sheet: app/<appId>/dashboard/<dashboardId>/sheet/<sheetId>.json',
    'chart: app/<appId>/chart/<chartId>.json',
    'dataset: app/<appId>/dataset/<datasetId>.json',
];
const pushSection = (lines, title, sectionLines) => {
    if (sectionLines.length === 0) {
        return;
    }
    lines.push('', `${title}:`);
    sectionLines.forEach((line) => {
        lines.push(`  ${line}`);
    });
};
const createCliSurfaceUtils = (definition) => {
    const { profile, commandDocs, commandUsageLabels, globalOptionsSection = defaultGlobalOptionsSection, outputSection = defaultOutputSection, } = definition;
    const rewriteCliLabel = (line) => line.replace(/\baeolus\b/g, profile.cliName);
    const buildGlobalUsage = () => {
        const lines = [
            profile.headline,
            '',
            `Usage: ${profile.cliName} <command> [args] [options]`,
            '',
            'Commands:',
            ...profile.visibleCommands.map((command) => {
                const usageLabel = commandUsageLabels[command] ?? command;
                const summary = commandDocs[command]?.summary ?? '';
                return `  ${usageLabel.padEnd(24, ' ')}${summary}`;
            }),
            '',
            `Run "${profile.cliName} <command> --help" for command-specific details.`,
        ];
        pushSection(lines, 'Global Options', globalOptionsSection);
        pushSection(lines, 'Output Files', outputSection);
        pushSection(lines, 'Notes', profile.globalNotes.map(rewriteCliLabel));
        pushSection(lines, 'Examples', profile.globalExamples.map(rewriteCliLabel));
        return `${lines.join('\n')}\n`;
    };
    const getUsageDoc = (command) => commandDocs[command];
    const buildCommandUsage = (command) => {
        const doc = getUsageDoc(command);
        if (!doc) {
            return buildGlobalUsage();
        }
        const lines = [
            `${profile.cliName} ${command} - ${doc.summary}`,
            '',
            'Usage:',
            ...doc.usage.map((line) => `  ${rewriteCliLabel(line)}`),
        ];
        pushSection(lines, 'Targets', doc.targets ?? []);
        pushSection(lines, 'Options', doc.options ?? []);
        pushSection(lines, 'Global Options', globalOptionsSection);
        pushSection(lines, 'Output Files', doc.output ?? []);
        pushSection(lines, 'Notes', (doc.notes ?? []).map(rewriteCliLabel));
        pushSection(lines, 'Examples', (doc.examples ?? []).map(rewriteCliLabel));
        return `${lines.join('\n')}\n`;
    };
    const printUsage = (command) => {
        process.stdout.write(command ? buildCommandUsage(command) : buildGlobalUsage());
    };
    const buildUsageHint = (command) => command
        ? `Hint: run "${profile.cliName} ${command} --help" for full docs.`
        : `Hint: run "${profile.cliName} --help" for full docs.`;
    const printCliError = ({ message, command, usage, expected, }) => {
        const lines = [`Error: ${message}`];
        if (usage) {
            lines.push(`Usage: ${usage}`);
        }
        if (expected && expected.length > 0) {
            lines.push(`Expected: ${expected.join(', ')}`);
        }
        lines.push(buildUsageHint(command));
        process.stderr.write(`${lines.join('\n')}\n`);
    };
    const getCommandUsageLines = (command) => (getUsageDoc(command)?.usage ?? []).map(rewriteCliLabel);
    const prepareCommandArgs = async (command, args) => {
        if ((0, exports.isHelpFlag)(args)) {
            printUsage(command);
            return { shouldExit: true, exitCode: 0 };
        }
        const { config, restArgs } = (0, exports.extractConfigArgs)(args);
        if (config.host || config.token) {
            await (0, exports.mergeAndWriteConfig)(config);
        }
        return { shouldExit: false, restArgs };
    };
    return {
        profile,
        printUsage,
        printCliError,
        getCommandUsageLines,
        prepareCommandArgs,
    };
};
exports.createCliSurfaceUtils = createCliSurfaceUtils;
