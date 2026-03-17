"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postJson = exports.requestJson = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("../utils");
const defaultHost = 'https://data.bytedance.net';
const buildUrl = (baseUrl, path) => {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBaseUrl}/${normalizedPath}`;
};
const normalizeNonEmptyValue = (value) => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const getEnvValue = (name) => normalizeNonEmptyValue(process.env[name]);
const normalizeTitanPassportId = (value) => {
    const raw = normalizeNonEmptyValue(value);
    if (!raw) {
        return undefined;
    }
    const cleaned = raw.endsWith(';') ? raw.slice(0, -1).trim() : raw;
    return cleaned.length > 0 ? cleaned : undefined;
};
const resolveRequestConfig = async () => {
    const envHost = getEnvValue('DATA_AGENT_GLUE_HOST');
    const envPassportId = getEnvValue('DATA_AGENT_TITAN_PASSPORT_ID');
    const { host, token } = await (0, utils_1.readConfig)();
    return {
        baseUrl: envHost ?? host ?? defaultHost,
        titanPassportId: normalizeTitanPassportId(envPassportId ?? token),
    };
};
const buildHeaders = (titanPassportId) => {
    const headers = {
        'content-type': 'application/json',
    };
    if (titanPassportId) {
        headers.cookie = `titan_passport_id=${titanPassportId};`;
    }
    return headers;
};
const requestJson = async (path, body) => {
    const { baseUrl, titanPassportId } = await resolveRequestConfig();
    const url = buildUrl(baseUrl, path);
    const headers = buildHeaders(titanPassportId);
    const res = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    return (await res.json());
};
exports.requestJson = requestJson;
const isObject = (value) => typeof value === 'object' && value !== null;
const normalizeApiResponse = (raw) => {
    if (isObject(raw) && typeof raw.success === 'boolean') {
        return raw;
    }
    if (isObject(raw) && typeof raw.code === 'string') {
        if (raw.code === 'aeolus/ok' &&
            isObject(raw.data) &&
            typeof raw.data.success === 'boolean') {
            return raw.data;
        }
        if (raw.code === 'aeolus/ok' && raw.data !== undefined) {
            return {
                success: true,
                data: raw.data,
            };
        }
        return {
            success: false,
            error: {
                message: (typeof raw.msg === 'string' && raw.msg) ||
                    raw.code ||
                    'unknown error',
            },
        };
    }
    return {
        success: false,
        error: {
            message: 'unexpected response format',
        },
    };
};
const postJson = async (path, body) => {
    const response = await (0, exports.requestJson)(path, body);
    return normalizeApiResponse(response);
};
exports.postJson = postJson;
