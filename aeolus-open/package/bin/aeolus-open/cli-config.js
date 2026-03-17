"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliConfig = void 0;
const config_1 = require("../commands/config");
const pull_1 = require("../commands/pull");
const search_1 = require("../commands/search");
const surface_1 = require("./surface");
exports.cliConfig = {
    surfaceUtils: surface_1.openCliSurfaceUtils,
    commandHandlers: {
        config: config_1.runConfig,
        pull: pull_1.runPull,
        search: search_1.runSearch,
    },
};
