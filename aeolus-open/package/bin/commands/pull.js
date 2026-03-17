"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPull = void 0;
const dashboard_1 = require("../dashboard");
const shared_1 = require("../api/shared");
const utils_1 = require("../utils");
const appendResource = (resources, seenResourceIds, resource) => {
    if (seenResourceIds.has(resource.resource)) {
        return;
    }
    seenResourceIds.add(resource.resource);
    resources.push(resource);
};
const appendPulledChartBundle = async (params) => {
    const { appId, chart, resolveSimpleDataset, resources, seenResourceIds } = params;
    const chartPath = await (0, utils_1.writeChartFile)(appId, chart.chartId, chart.simpleChart);
    appendResource(resources, seenResourceIds, {
        resource: `chart/${chart.chartId}`,
        localUri: chartPath,
    });
    const simpleDataset = resolveSimpleDataset?.(chart.datasetId) ?? chart.simpleDataset;
    if (simpleDataset === undefined) {
        return;
    }
    const datasetPath = await (0, utils_1.writeDatasetFile)(appId, chart.datasetId, simpleDataset);
    appendResource(resources, seenResourceIds, {
        resource: `dataset/${chart.datasetId}`,
        localUri: datasetPath,
    });
};
const buildDatasetLookup = (primary, fallback) => {
    const map = new Map();
    const merge = (list) => {
        const normalized = Array.isArray(list) ? list : [];
        normalized.forEach((item) => {
            if (!Number.isFinite(item.datasetId)) {
                return;
            }
            if (!map.has(item.datasetId)) {
                map.set(item.datasetId, item.simpleDataset);
            }
        });
    };
    merge(primary);
    merge(fallback);
    return (datasetId) => map.get(datasetId);
};
const pullChartWithDataset = async (chartId) => {
    const response = await (0, shared_1.fetchSimpleChart)(chartId);
    if (!response.success) {
        return {
            success: false,
            errorMessage: `pull chart failed: ${response.error.message}`,
        };
    }
    const appId = Number(response.data.appId);
    if (!Number.isFinite(appId)) {
        return {
            success: false,
            errorMessage: 'pull chart failed: appId is missing in response',
        };
    }
    const chartPath = await (0, utils_1.writeChartFile)(appId, chartId, response.data.simpleChart);
    const datasetId = response.data.datasetId;
    const datasetPath = await (0, utils_1.writeDatasetFile)(appId, datasetId, response.data.simpleDataset);
    return {
        success: true,
        resources: [
            {
                resource: `chart/${chartId}`,
                localUri: chartPath,
            },
            {
                resource: `dataset/${datasetId}`,
                localUri: datasetPath,
            },
        ],
    };
};
const runPull = async (args) => {
    const [pullDashboardUsage, pullDashboardSheetUsage, pullChartUsage, pullDatasetUsage,] = (0, utils_1.getCommandUsageLines)('pull');
    const prepared = await (0, utils_1.prepareCommandArgs)('pull', args);
    if (prepared.shouldExit) {
        return prepared.exitCode;
    }
    const [target] = prepared.restArgs;
    if (!target) {
        (0, utils_1.printCliError)({
            message: 'missing target',
            command: 'pull',
            usage: pullDashboardUsage,
            expected: [
                'dashboard/<dashboardId>',
                'dashboard/<dashboardId>/sheet/<sheetId>',
                'chart/<chartId>',
                'dataset/<datasetId>',
            ],
        });
        return 1;
    }
    if (!(0, utils_1.isValidTarget)(target)) {
        (0, utils_1.printCliError)({
            message: `invalid target "${target}"`,
            command: 'pull',
            usage: pullDashboardUsage,
            expected: [
                'dashboard/<dashboardId>',
                'dashboard/<dashboardId>/sheet/<sheetId>',
                'chart/<chartId>',
                'dataset/<datasetId>',
            ],
        });
        return 1;
    }
    const dashboardMatch = /^dashboard\/([^/]+)$/.exec(target);
    if (dashboardMatch) {
        const dashboardId = Number(dashboardMatch[1]);
        if (!Number.isFinite(dashboardId)) {
            (0, utils_1.printCliError)({
                message: `invalid dashboardId "${dashboardMatch[1]}" in target "${target}"`,
                command: 'pull',
                usage: pullDashboardUsage,
            });
            return 1;
        }
        const response = await (0, shared_1.fetchPullDashboardBundle)(dashboardId);
        if (!response.success) {
            process.stderr.write(`pull dashboard failed: ${response.error.message}\n`);
            return 1;
        }
        const appId = Number(response.data.appId);
        if (!Number.isFinite(appId)) {
            process.stderr.write('pull dashboard failed: appId is missing in response\n');
            return 1;
        }
        const resources = [];
        const seenResourceIds = new Set();
        const dashboardData = response.data.dashboard ?? response.data.simpleDashboard;
        const normalizedDashboard = (0, dashboard_1.normalizeDashboardPayload)(dashboardData);
        const dashboardPath = await (0, utils_1.writeDashboardFile)(appId, dashboardId, normalizedDashboard);
        appendResource(resources, seenResourceIds, {
            resource: `dashboard/${dashboardId}`,
            localUri: dashboardPath,
        });
        const sheets = Array.isArray(response.data.sheets) ? response.data.sheets : [];
        const resolveSimpleDataset = buildDatasetLookup(response.data.simpleDatasets, response.data.datasets);
        for (const sheet of sheets) {
            const sheetPath = await (0, utils_1.writeDashboardSheetFile)(appId, dashboardId, sheet.sheetId, sheet.simpleSheet);
            if (sheet.fullBundle !== undefined) {
                await (0, utils_1.writeDashboardSheetBundleFile)(appId, dashboardId, sheet.sheetId, sheet.fullBundle);
            }
            appendResource(resources, seenResourceIds, {
                resource: `dashboard/${dashboardId}/sheet/${sheet.sheetId}`,
                localUri: sheetPath,
            });
            const charts = Array.isArray(sheet.charts) ? sheet.charts : [];
            for (const chart of charts) {
                await appendPulledChartBundle({
                    appId,
                    chart,
                    resolveSimpleDataset,
                    resources,
                    seenResourceIds,
                });
            }
        }
        (0, utils_1.printResourceOutput)({
            action: 'FETCHED',
            resources: await (0, utils_1.withRemoteUris)(resources, appId),
        });
        return 0;
    }
    const dashboardSheetMatch = /^dashboard\/([^/]+)\/sheet\/([^/]+)$/.exec(target);
    if (dashboardSheetMatch) {
        const dashboardId = Number(dashboardSheetMatch[1]);
        const sheetId = Number(dashboardSheetMatch[2]);
        if (!Number.isFinite(dashboardId) || !Number.isFinite(sheetId)) {
            (0, utils_1.printCliError)({
                message: `invalid dashboardId or sheetId in target "${target}"`,
                command: 'pull',
                usage: pullDashboardSheetUsage,
            });
            return 1;
        }
        const response = await (0, shared_1.fetchPullDashboardSheetBundle)(dashboardId, sheetId);
        if (!response.success) {
            process.stderr.write(`pull dashboard sheet failed: ${response.error.message}\n`);
            return 1;
        }
        const appId = Number(response.data.appId);
        if (!Number.isFinite(appId)) {
            process.stderr.write('pull dashboard sheet failed: appId is missing in response\n');
            return 1;
        }
        const resources = [];
        const seenResourceIds = new Set();
        const resolveSimpleDataset = buildDatasetLookup(response.data.simpleDatasets, response.data.datasets);
        const sheetPath = await (0, utils_1.writeDashboardSheetFile)(appId, dashboardId, sheetId, response.data.simpleSheet);
        if (response.data.fullBundle !== undefined) {
            await (0, utils_1.writeDashboardSheetBundleFile)(appId, dashboardId, sheetId, response.data.fullBundle);
        }
        appendResource(resources, seenResourceIds, {
            resource: `dashboard/${dashboardId}/sheet/${sheetId}`,
            localUri: sheetPath,
        });
        const charts = Array.isArray(response.data.charts) ? response.data.charts : [];
        for (const chart of charts) {
            await appendPulledChartBundle({
                appId,
                chart,
                resolveSimpleDataset,
                resources,
                seenResourceIds,
            });
        }
        (0, utils_1.printResourceOutput)({
            action: 'FETCHED',
            resources: await (0, utils_1.withRemoteUris)(resources, appId),
        });
        return 0;
    }
    const chartMatch = /^chart\/([^/]+)$/.exec(target);
    if (chartMatch) {
        const chartId = Number(chartMatch[1]);
        if (!Number.isFinite(chartId)) {
            (0, utils_1.printCliError)({
                message: `invalid chartId "${chartMatch[1]}" in target "${target}"`,
                command: 'pull',
                usage: pullChartUsage,
            });
            return 1;
        }
        const pulledChart = await pullChartWithDataset(chartId);
        if (!pulledChart.success) {
            process.stderr.write(`${pulledChart.errorMessage}\n`);
            return 1;
        }
        (0, utils_1.printResourceOutput)({
            action: 'FETCHED',
            resources: await (0, utils_1.withRemoteUris)(pulledChart.resources),
        });
        return 0;
    }
    const datasetMatch = /^dataset\/([^/]+)$/.exec(target);
    if (datasetMatch) {
        const datasetId = Number(datasetMatch[1]);
        if (!Number.isFinite(datasetId)) {
            (0, utils_1.printCliError)({
                message: `invalid datasetId "${datasetMatch[1]}" in target "${target}"`,
                command: 'pull',
                usage: pullDatasetUsage,
            });
            return 1;
        }
        const response = await (0, shared_1.fetchSimpleDataset)(datasetId);
        if (!response.success) {
            process.stderr.write(`pull dataset failed: ${response.error.message}\n`);
            return 1;
        }
        const appId = Number(response.data.appId);
        if (!Number.isFinite(appId)) {
            process.stderr.write('pull dataset failed: appId is missing in response\n');
            return 1;
        }
        const outputPath = await (0, utils_1.writeDatasetFile)(appId, datasetId, response.data.simpleDataset);
        (0, utils_1.printResourceOutput)({
            action: 'FETCHED',
            resources: await (0, utils_1.withRemoteUris)([
                {
                    resource: `dataset/${datasetId}`,
                    localUri: outputPath,
                },
            ]),
        });
        return 0;
    }
    (0, utils_1.notImplemented)(`pull ${target}`);
    return 0;
};
exports.runPull = runPull;
