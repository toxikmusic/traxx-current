"use strict";
/**
 * Cloudflare Integration Service
 * Handles interactions with Cloudflare Stream API for video streaming
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCloudflareService = checkCloudflareService;
exports.createLiveStream = createLiveStream;
exports.getLiveStreamInfo = getLiveStreamInfo;
exports.deleteLiveStream = deleteLiveStream;
var https_1 = __importDefault(require("https"));
// Cloudflare API configuration
var CLOUDFLARE_API_URL = 'api.cloudflare.com';
var CLOUDFLARE_API_VERSION = 'v4';
var CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
/**
 * Check if Cloudflare service is available and credentials are valid
 * @returns Promise<boolean> True if service check passes
 */
function checkCloudflareService() {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey_1;
        return __generator(this, function (_a) {
            try {
                apiKey_1 = process.env.CLOUDFLARE_API_KEY;
                if (!apiKey_1) {
                    console.warn('Cloudflare API key not configured');
                    return [2 /*return*/, false];
                }
                // For a light check, we'll just verify the connection and credentials
                // rather than making a full API call
                return [2 /*return*/, new Promise(function (resolve) {
                        var options = {
                            hostname: CLOUDFLARE_API_URL,
                            port: 443,
                            path: "/".concat(CLOUDFLARE_API_VERSION, "/user"),
                            method: 'GET',
                            headers: {
                                'Authorization': "Bearer ".concat(apiKey_1),
                                'Content-Type': 'application/json'
                            }
                        };
                        var req = https_1.default.request(options, function (res) {
                            resolve(res.statusCode === 200);
                        });
                        req.on('error', function (error) {
                            console.error('Cloudflare API connection error:', error);
                            resolve(false);
                        });
                        req.on('timeout', function () {
                            console.error('Cloudflare API connection timeout');
                            req.destroy();
                            resolve(false);
                        });
                        req.setTimeout(3000); // 3 second timeout
                        req.end();
                    })];
            }
            catch (error) {
                console.error('Error checking Cloudflare service:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Create a new live streaming video
 * @param meta Metadata for the live stream
 * @returns Promise with stream details or null on failure
 */
function createLiveStream(meta) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Implementation would go here
            return [2 /*return*/, null];
        });
    });
}
/**
 * Get information about a live stream
 * @param streamId The Cloudflare stream ID
 * @returns Promise with stream details or null on failure
 */
function getLiveStreamInfo(streamId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Implementation would go here
            return [2 /*return*/, null];
        });
    });
}
/**
 * Delete a live stream
 * @param streamId The Cloudflare stream ID
 * @returns Promise<boolean> True if deletion was successful
 */
function deleteLiveStream(streamId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Implementation would go here
            return [2 /*return*/, false];
        });
    });
}
