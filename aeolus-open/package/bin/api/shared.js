"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchResources = exports.fetchSimpleDataset = exports.fetchSimpleChart = exports.fetchPullDashboardSheetBundle = exports.fetchPullDashboardBundle = void 0;
const base_1 = require("./base");
const pullDashboardBundlePath = '/aeolus/glue/api/v1/ai_dashboard_util/pull_dashboard_bundle';
const pullDashboardSheetBundlePath = '/aeolus/glue/api/v1/ai_dashboard_util/pull_dashboard_sheet_bundle';
const toSimpleChartPath = '/aeolus/glue/api/v1/ai_dashboard_util/to_simple_chart';
const toSimpleDatasetPath = '/aeolus/glue/api/v1/ai_dashboard_util/to_simple_dataset';
const searchResourcesPath = '/aeolus/api/v3/home/search';
const fetchPullDashboardBundle = async (dashboardId) => (0, base_1.postJson)(pullDashboardBundlePath, {
    dashboardId,
});
exports.fetchPullDashboardBundle = fetchPullDashboardBundle;
const fetchPullDashboardSheetBundle = async (dashboardId, sheetId) => (0, base_1.postJson)(pullDashboardSheetBundlePath, {
    dashboardId,
    sheetId,
});
exports.fetchPullDashboardSheetBundle = fetchPullDashboardSheetBundle;
const fetchSimpleChart = async (chartId) => (0, base_1.postJson)(toSimpleChartPath, {
    reportId: chartId,
});
exports.fetchSimpleChart = fetchSimpleChart;
const fetchSimpleDataset = async (datasetId) => (0, base_1.postJson)(toSimpleDatasetPath, {
    datasetId,
});
exports.fetchSimpleDataset = fetchSimpleDataset;
const searchResources = async (params) => {
    const { query, limit = 20, offset = 0, types } = params;
    const filter = types && types.length > 0
        ? {
            leaf: 0,
            name: 'root',
            op: 'or',
            val: [
                {
                    leaf: 1,
                    name: 'res_type',
                    op: 'in',
                    val: types,
                },
            ],
        }
        : undefined;
    const response = await (0, base_1.requestJson)(searchResourcesPath, {
        query,
        offset,
        limit,
        ...(filter ? { filter } : {}),
    });
    if (response.code === 'aeolus/ok' && response.data) {
        return {
            success: true,
            data: response.data,
        };
    }
    return {
        success: false,
        error: {
            message: response.msg ?? response.code ?? 'unknown error',
        },
    };
};
exports.searchResources = searchResources;
