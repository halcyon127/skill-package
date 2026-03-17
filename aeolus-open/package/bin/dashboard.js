"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDashboardPayload = exports.getDashboardNameFromPayload = void 0;
const resolveSheetId = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'string') {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : undefined;
    }
    return undefined;
};
const normalizeSheets = (input) => {
    if (!Array.isArray(input)) {
        return [];
    }
    const sheets = [];
    for (const item of input) {
        if (item && typeof item === 'object') {
            const sheetId = resolveSheetId(item.sheetId);
            if (sheetId !== undefined) {
                sheets.push({ sheetId });
            }
            continue;
        }
        const sheetId = resolveSheetId(item);
        if (sheetId !== undefined) {
            sheets.push({ sheetId });
        }
    }
    return sheets;
};
const getNonEmptyString = (value) => {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const getDashboardNameFromPayload = (input) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return undefined;
    }
    return getNonEmptyString(input.name);
};
exports.getDashboardNameFromPayload = getDashboardNameFromPayload;
const normalizeDashboardPayload = (input) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new Error('dashboard must be an object with name and sheets');
    }
    const value = input;
    const name = getNonEmptyString(value.name);
    if (!name) {
        throw new Error('dashboard.name is required');
    }
    return {
        name,
        sheets: normalizeSheets(value.sheets),
    };
};
exports.normalizeDashboardPayload = normalizeDashboardPayload;
