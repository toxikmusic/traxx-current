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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.log = log;
exports.setupVite = setupVite;
exports.createViteServer = createViteServer;
exports.serveStatic = serveStatic;
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importStar(require("path"));
var url_1 = require("url");
var vite_1 = require("vite");
var nanoid_1 = require("nanoid");
var createLogger = function () { return ({
    info: function (msg) { return console.log(msg); },
    warn: function (msg) { return console.warn(msg); },
    error: function (msg, options) { return console.error(msg); },
    clearScreen: function () { }
}); };
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, path_1.dirname)(__filename);
var viteLogger = createLogger();
function log(message, source) {
    if (source === void 0) { source = "express"; }
    var formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log("".concat(formattedTime, " [").concat(source, "] ").concat(message));
}
function setupVite(app, server) {
    return __awaiter(this, void 0, void 0, function () {
        var vite;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createViteServer(app)];
                case 1:
                    vite = _a.sent();
                    app.use("*", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                        var url, clientTemplate, template, page, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    url = req.originalUrl;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    clientTemplate = path_1.default.resolve(__dirname, "..", "client", "index.html");
                                    return [4 /*yield*/, fs_1.default.promises.readFile(clientTemplate, "utf-8")];
                                case 2:
                                    template = _a.sent();
                                    template = template.replace("src=\"/src/main.tsx\"", "src=\"/src/main.tsx?v=".concat((0, nanoid_1.nanoid)(), "\""));
                                    return [4 /*yield*/, vite.transformIndexHtml(url, template)];
                                case 3:
                                    page = _a.sent();
                                    res.status(200).set({ "Content-Type": "text/html" }).end(page);
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_1 = _a.sent();
                                    vite.ssrFixStacktrace(e_1);
                                    next(e_1);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
function createViteServer(app) {
    return __awaiter(this, void 0, void 0, function () {
        var vite, customConfig, hostHandler, specificHost, errorHandler, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Import custom configuration and host handler
                    try {
                      customConfig = require('./custom-vite-config.js');
                      log('Using custom Vite configuration for Replit compatibility');
                    } catch (e) {
                      log('No custom Vite configuration found, using defaults');
                      customConfig = {};
                    }
                    
                    try {
                      hostHandler = require('./replit-host-handler.js');
                      log('Replit host handler loaded');
                    } catch (e) {
                      log('No Replit host handler found, host errors will not be auto-fixed');
                    }
                    
                    // Check for specific host from environment variable (set by error handler)
                    specificHost = process.env.VITE_SPECIFIC_HOST;
                    if (specificHost) {
                      log(`Using specific Replit host: ${specificHost}`);
                      
                      // Debug - show all environment variables to help troubleshoot
                      console.log('--- ENVIRONMENT VARS (DEBUG) ---');
                      Object.keys(process.env)
                        .filter(key => key.startsWith('VITE_') || key.startsWith('REPL_'))
                        .forEach(key => {
                          console.log(`${key}=${process.env[key]}`);
                        });
                      console.log('-------------------------------');
                    } else {
                      log(`No specific Replit host configured`);
                    }
                    
                    // Create special error handler for host validation errors
                    errorHandler = function(err) {
                      log(`Vite server error: ${err.message}`);
                      
                      if (hostHandler && err.message.includes('not been configured as an explicit host')) {
                        log('Detected host validation error. Attempting to extract hostname...');
                        if (hostHandler.handlePotentialHostError(err)) {
                          log('Host configuration updated. Please restart the server.');
                          
                          // Force display info to console
                          console.error('\n-------------------------------------------------');
                          console.error('IMPORTANT: REPLIT HOST VALIDATION ERROR DETECTED');
                          console.error('The host configuration has been updated.');
                          console.error('Please restart the workflow to apply changes.');
                          console.error('-------------------------------------------------\n');
                        }
                      }
                    };
                    
                    return [4 /*yield*/, (0, vite_1.createServer)({
                        server: { 
                            middlewareMode: true,
                            host: '0.0.0.0',
                            strictPort: false,
                            cors: {
                              origin: '*', 
                              methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                              credentials: true,
                            },
                            hmr: {
                              clientPort: process.env.VITE_HMR_CLIENT_PORT ? Number(process.env.VITE_HMR_CLIENT_PORT) : undefined,
                              host: true,
                              overlay: false,
                            },
                            headers: {
                              "Access-Control-Allow-Origin": "*",
                              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                              "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
                            },
                            watch: {
                              usePolling: true,
                            },
                            fs: {
                              strict: false,
                              allow: ['..']
                            },
                            // Allow all hosts, especially Replit domains
                            allowedHosts: specificHost 
                              ? ['all', specificHost, '*.kirk.replit.dev'] 
                              : ['all', '*.kirk.replit.dev'],
                            ...(customConfig.server || {})
                        },
                        appType: "custom",
                        // Override with any environment variables if provided
                        clearScreen: false,
                        optimizeDeps: {
                          force: true
                        }
                    })];
                case 1:
                    vite = _a.sent();
                    
                    // Add error handler to catch and process host validation errors
                    vite.watcher.on('error', errorHandler);
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    log('Error creating Vite server: ' + e_1.message);
                    
                    // If we have the host handler, try to process the error to auto-fix host validation issues
                    if (hostHandler && hostHandler.handlePotentialHostError(e_1)) {
                        log('Updated host configuration based on error. Please restart the server.');
                    }
                    
                    // Throw error for parent handler
                    throw e_1;
                case 3:
                    // Continue to use middleware and return the vite server
                    app.use(vite.middlewares);
                    return [2 /*return*/, vite];
            }
        });
    });
}
function serveStatic(app) {
    var distPath = path_1.default.resolve(__dirname, "public");
    if (!fs_1.default.existsSync(distPath)) {
        throw new Error("Could not find the build directory: ".concat(distPath, ", make sure to build the client first"));
    }
    app.use(express_1.default.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", function (_req, res) {
        res.sendFile(path_1.default.resolve(distPath, "index.html"));
    });
}
