"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareCommandArgs = exports.getCommandUsageLines = exports.printCliError = exports.printUsage = exports.setActiveCliSurfaceUtils = void 0;
__exportStar(require("./utils-shared"), exports);
let activeCliSurfaceUtils;
const getActiveCliSurfaceUtils = () => {
    if (!activeCliSurfaceUtils) {
        throw new Error('active CLI surface utils are not set');
    }
    return activeCliSurfaceUtils;
};
const setActiveCliSurfaceUtils = (surfaceUtils) => {
    activeCliSurfaceUtils = surfaceUtils;
};
exports.setActiveCliSurfaceUtils = setActiveCliSurfaceUtils;
const printUsage = (command) => getActiveCliSurfaceUtils().printUsage(command);
exports.printUsage = printUsage;
const printCliError = (params) => getActiveCliSurfaceUtils().printCliError(params);
exports.printCliError = printCliError;
const getCommandUsageLines = (command) => getActiveCliSurfaceUtils().getCommandUsageLines(command);
exports.getCommandUsageLines = getCommandUsageLines;
const prepareCommandArgs = (command, args) => getActiveCliSurfaceUtils().prepareCommandArgs(command, args);
exports.prepareCommandArgs = prepareCommandArgs;
