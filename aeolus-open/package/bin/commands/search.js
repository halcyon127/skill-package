"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSearch = void 0;
const shared_1 = require("../api/shared");
const utils_1 = require("../utils");
const searchTypes = ['dataset', 'chart', 'dashboard'];
const searchTypeMap = {
    dataset: 'data_set',
    chart: 'report',
    dashboard: 'dashboard',
};
const resourceTypeMap = {
    data_set: 'dataset',
    report: 'chart',
    dashboard: 'dashboard',
};
const searchUsage = 'aeolus search <keyword> [--type <type>] [--offset <offset>] [--limit <limit>] | aeolus search --keyword <keyword> [--type <type>] [--offset <offset>] [--limit <limit>]';
const normalizeValue = (value) => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const readSeparatedOptionValue = (args, index) => {
    const value = normalizeValue(args[index + 1]);
    if (!value || value.startsWith('--')) {
        return undefined;
    }
    return value;
};
const isSearchType = (value) => searchTypes.includes(value);
const printSearchError = (message, expected) => {
    (0, utils_1.printCliError)({
        message,
        command: 'search',
        usage: searchUsage,
        expected,
    });
};
const parseIntegerOption = (params) => {
    const { rawValue, flag, min, allowZero } = params;
    const expectedText = allowZero ? `integer >= ${min}` : `integer > ${min - 1}`;
    const normalizedValue = normalizeValue(rawValue);
    if (!normalizedValue) {
        printSearchError(`missing value for ${flag}`);
        return undefined;
    }
    if (!/^\d+$/.test(normalizedValue)) {
        printSearchError(`invalid ${flag} value "${normalizedValue}"`, [expectedText]);
        return undefined;
    }
    const numericValue = Number(normalizedValue);
    if (!Number.isSafeInteger(numericValue)) {
        printSearchError(`invalid ${flag} value "${normalizedValue}"`, [expectedText]);
        return undefined;
    }
    if (numericValue < min || (!allowZero && numericValue === 0)) {
        printSearchError(`invalid ${flag} value "${normalizedValue}"`, [expectedText]);
        return undefined;
    }
    return numericValue;
};
const parseSearchArgs = (args) => {
    let explicitKeyword;
    let positionalQuery;
    const selectedTypes = [];
    let offset = 0;
    let limit = 20;
    for (let i = 0; i < args.length; i += 1) {
        const item = args[i];
        if (item.startsWith('--keyword=')) {
            explicitKeyword = normalizeValue(item.slice('--keyword='.length));
            if (!explicitKeyword) {
                printSearchError('missing value for --keyword');
                return { ok: false };
            }
            continue;
        }
        if (item === '--keyword') {
            explicitKeyword = readSeparatedOptionValue(args, i);
            if (!explicitKeyword) {
                printSearchError('missing value for --keyword');
                return { ok: false };
            }
            i += 1;
            continue;
        }
        if (item.startsWith('--type=')) {
            const typeValue = normalizeValue(item.slice('--type='.length));
            if (!typeValue || !isSearchType(typeValue)) {
                printSearchError(`invalid --type value "${typeValue ?? ''}"`, [
                    'dataset',
                    'chart',
                    'dashboard',
                ]);
                return { ok: false };
            }
            selectedTypes.push(typeValue);
            continue;
        }
        if (item === '--type') {
            const typeValue = readSeparatedOptionValue(args, i);
            if (!typeValue || !isSearchType(typeValue)) {
                printSearchError(`invalid --type value "${typeValue ?? ''}"`, [
                    'dataset',
                    'chart',
                    'dashboard',
                ]);
                return { ok: false };
            }
            selectedTypes.push(typeValue);
            i += 1;
            continue;
        }
        if (item.startsWith('--offset=')) {
            const parsedOffset = parseIntegerOption({
                rawValue: item.slice('--offset='.length),
                flag: '--offset',
                min: 0,
                allowZero: true,
            });
            if (parsedOffset === undefined) {
                return { ok: false };
            }
            offset = parsedOffset;
            continue;
        }
        if (item === '--offset') {
            const parsedOffset = parseIntegerOption({
                rawValue: readSeparatedOptionValue(args, i),
                flag: '--offset',
                min: 0,
                allowZero: true,
            });
            if (parsedOffset === undefined) {
                return { ok: false };
            }
            offset = parsedOffset;
            i += 1;
            continue;
        }
        if (item.startsWith('--limit=')) {
            const parsedLimit = parseIntegerOption({
                rawValue: item.slice('--limit='.length),
                flag: '--limit',
                min: 1,
                allowZero: false,
            });
            if (parsedLimit === undefined) {
                return { ok: false };
            }
            limit = parsedLimit;
            continue;
        }
        if (item === '--limit') {
            const parsedLimit = parseIntegerOption({
                rawValue: readSeparatedOptionValue(args, i),
                flag: '--limit',
                min: 1,
                allowZero: false,
            });
            if (parsedLimit === undefined) {
                return { ok: false };
            }
            limit = parsedLimit;
            i += 1;
            continue;
        }
        if (item.startsWith('--')) {
            printSearchError(`unknown option "${item}"`);
            return { ok: false };
        }
        if (!positionalQuery) {
            positionalQuery = item;
            continue;
        }
        printSearchError(`unexpected argument "${item}"`);
        return { ok: false };
    }
    if (explicitKeyword && positionalQuery) {
        printSearchError('cannot use positional query together with --keyword');
        return { ok: false };
    }
    const query = explicitKeyword ?? positionalQuery;
    if (!query) {
        printSearchError('missing query');
        return { ok: false };
    }
    return {
        ok: true,
        query,
        types: selectedTypes.length > 0 ? selectedTypes : [...searchTypes],
        offset,
        limit,
    };
};
const stripHighlightTags = (value) => value.replace(/<\/?span>/g, '');
const formatSearchOutput = (params) => {
    const { query, requestedTypes, offset, limit, results, total } = params;
    const lines = [
        'SEARCHED',
        `QUERY ${query}`,
        `TYPES ${requestedTypes.join(',')}`,
        `OFFSET ${offset}`,
        `LIMIT ${limit}`,
        `RESULT_COUNT ${results.length}`,
        `TOTAL ${total}`,
    ];
    if (results.length === 0) {
        return `${lines.join('\n')}\n`;
    }
    results.forEach((result) => {
        lines.push('');
        lines.push(`RESOURCE ${resourceTypeMap[result.resType]}/${result.resId}`);
        lines.push(`NAME ${stripHighlightTags(result.name)}`);
        if (result.app?.id !== undefined) {
            lines.push(`APP_ID ${result.app.id}`);
        }
        if (result.app?.name) {
            lines.push(`APP ${result.app.name}`);
        }
        if (result.lastVisitedTime) {
            lines.push(`LAST_VISITED_TIME ${result.lastVisitedTime}`);
        }
    });
    return `${lines.join('\n')}\n`;
};
const runSearch = async (args) => {
    const prepared = await (0, utils_1.prepareCommandArgs)('search', args);
    if (prepared.shouldExit) {
        return prepared.exitCode;
    }
    const parsed = parseSearchArgs(prepared.restArgs);
    if (!parsed.ok) {
        return 1;
    }
    const response = await (0, shared_1.searchResources)({
        query: parsed.query,
        offset: parsed.offset,
        limit: parsed.limit,
        types: parsed.types.map((type) => searchTypeMap[type]),
    });
    if (!response.success) {
        process.stderr.write(`search failed: ${response.error.message}\n`);
        return 1;
    }
    process.stdout.write(formatSearchOutput({
        query: parsed.query,
        requestedTypes: parsed.types,
        offset: parsed.offset,
        limit: parsed.limit,
        results: response.data.results,
        total: response.data.total,
    }));
    return 0;
};
exports.runSearch = runSearch;
