"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var storage_js_1 = require("./storage.js");
var zod_1 = require("zod");
var schema_js_1 = require("../shared/schema.js");
var auth_js_1 = require("./auth.js");
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
var vite_js_1 = require("./vite.js");
var socket_io_1 = require("socket.io");
var ws_1 = require("ws");
var uuid_1 = require("uuid");
var hls_js_1 = require("./hls.js");
var object_storage_js_1 = require("./object-storage.js");
// Ensure uploads directory exists
var uploadsDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
var storage_ = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Use original filename with timestamp to avoid collisions
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        var ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
// For regular file uploads (stored on disk)
var upload = (0, multer_1.default)({
    storage: storage_,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});
// For streaming segments (stored in memory)
var memoryUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit for stream segments
    }
});
// Helper function to generate a secure stream key (private, only for broadcasters)
// Generate a secure stream key using user ID and random bytes with base64url encoding
function generateStreamKey(userId) {
    var rawKey = "".concat(userId, "-").concat(crypto_1.default.randomBytes(16).toString('hex'));
    return Buffer.from(rawKey).toString('base64url'); // base64url avoids + and /
}
// Validate a stream key by checking its format and origin
function validateStreamKey(streamKey, userId) {
    try {
        if (!streamKey || !userId) {
            console.log("Missing streamKey or userId for validation");
            return false;
        }
        // Decode the base64url key
        var rawKey = Buffer.from(streamKey, 'base64url').toString();
        // Check if the key starts with the user ID
        var isValid = rawKey.startsWith("".concat(userId, "-"));
        console.log("Stream key validation for user ".concat(userId, ": ").concat(isValid ? 'Valid' : 'Invalid'));
        return isValid;
    }
    catch (error) {
        console.error("Stream key validation error:", error);
        return false;
    }
}
// Helper function to generate a public stream ID (for viewers)
function generatePublicStreamId() {
    return (0, uuid_1.v4)();
}
// Initialize WebSocket and Socket.IO
var io;
// Setup for chat/stream messages
var streamConnections = new Map();
var streamMessages = new Map();
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var server, wss, audioStreamingWss, streamIo, audioStreamConnections, webrtcWss, webrtcActiveStreams, activeStreams, activeHLSStreams, visualStorage, visualUpload;
        var _this = this;
        return __generator(this, function (_a) {
            server = (0, http_1.createServer)(app);
            // Initialize Socket.IO for streaming
            io = new socket_io_1.Server(server, {
                cors: {
                    origin: "*", // Allow all origins, customize this in production
                    methods: ["GET", "POST"]
                }
            });
            // Handle authentication for APIs (using passport.js)
            (0, auth_js_1.setupAuth)(app);
            // Serve static files from the uploads directory
            app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
            // Add middleware for streaming content from object storage
            app.use(object_storage_js_1.objectStorage.serveContent.bind(object_storage_js_1.objectStorage));
            wss = new ws_1.WebSocketServer({ noServer: true });
            audioStreamingWss = new ws_1.WebSocketServer({ noServer: true });
            streamIo = io.of('/stream');
            streamIo.on('connection', function (socket) {
                var _a;
                (0, vite_js_1.log)('New Socket.IO connection established', 'websocket');
                // Get connection parameters from handshake query or auth
                var query = socket.handshake.query;
                var streamId = parseInt(query.streamId || '0');
                var userId = parseInt(query.userId || '0');
                var username = query.username || 'Anonymous';
                var role = query.role || 'listener';
                var streamKey = query.streamKey || '';
                if (streamId <= 0) {
                    socket.disconnect();
                    return;
                }
                // Join a room specific to this stream
                socket.join("stream:".concat(streamId));
                // Set up Socket.IO specific handling for audio streaming
                if (role === 'broadcaster') {
                    // Handle broadcaster connection
                    (0, vite_js_1.log)("Broadcaster connected to stream ".concat(streamId), 'websocket');
                    // Verify stream key if provided
                    if (streamKey) {
                        storage_js_1.storage.getStream(streamId).then(function (stream) {
                            var _a;
                            if (!stream) {
                                (0, vite_js_1.log)("Stream ".concat(streamId, " not found"), 'websocket');
                                socket.emit('error', { message: 'Stream not found' });
                                socket.disconnect();
                                return;
                            }
                            if (stream.streamKey !== streamKey) {
                                (0, vite_js_1.log)("Invalid stream key for stream ".concat(streamId), 'websocket');
                                socket.emit('error', { message: 'Invalid stream key' });
                                socket.disconnect();
                                return;
                            }
                            (0, vite_js_1.log)("Broadcaster authenticated for stream ".concat(streamId), 'websocket');
                            // Mark the stream as live in the database
                            storage_js_1.storage.updateStream(streamId, { isLive: true });
                            // Announce the stream is live to all clients in this stream's room
                            streamIo.to("stream:".concat(streamId)).emit('stream_status', {
                                type: 'stream_status',
                                streamId: streamId,
                                isLive: true,
                                viewerCount: ((_a = streamIo.adapter.rooms.get("stream:".concat(streamId))) === null || _a === void 0 ? void 0 : _a.size) || 1
                            });
                        }).catch(function (error) {
                            (0, vite_js_1.log)("Error authenticating stream: ".concat(error), 'websocket');
                            socket.emit('error', { message: 'Authentication error' });
                            socket.disconnect();
                        });
                    }
                    // Handle audio data from broadcaster
                    socket.on('audio_data', function (data) {
                        // Forward audio data to all listeners in this stream
                        socket.to("stream:".concat(streamId)).emit('audio_data', data);
                    });
                    // Handle audio level updates
                    socket.on('audio_level', function (data) {
                        // Forward audio level to all listeners
                        socket.to("stream:".concat(streamId)).emit('audio_level', data);
                    });
                    // Handle ping/heartbeat
                    socket.on('ping', function () {
                        socket.emit('pong', { timestamp: Date.now() });
                    });
                    // Handle disconnect
                    socket.on('disconnect', function () {
                        (0, vite_js_1.log)("Broadcaster disconnected from stream ".concat(streamId), 'websocket');
                        // Mark the stream as offline in the database
                        storage_js_1.storage.updateStream(streamId, { isLive: false }).catch(function (err) {
                            (0, vite_js_1.log)("Error updating stream status: ".concat(err), 'websocket');
                        });
                        // Notify all clients that the stream has ended
                        streamIo.to("stream:".concat(streamId)).emit('stream_status', {
                            type: 'stream_status',
                            streamId: streamId,
                            isLive: false
                        });
                    });
                }
                else {
                    // Handle listener connection
                    (0, vite_js_1.log)("Listener connected to stream ".concat(streamId), 'websocket');
                    // Update viewer count for this stream
                    var viewerCount = ((_a = streamIo.adapter.rooms.get("stream:".concat(streamId))) === null || _a === void 0 ? void 0 : _a.size) || 1;
                    storage_js_1.storage.updateStreamViewerCount(streamId, viewerCount);
                    // Notify all clients about the updated viewer count
                    streamIo.to("stream:".concat(streamId)).emit('viewer_count', {
                        type: 'viewer_count',
                        streamId: streamId,
                        viewerCount: viewerCount
                    });
                    // Handle disconnect
                    socket.on('disconnect', function () {
                        var _a;
                        (0, vite_js_1.log)("Listener disconnected from stream ".concat(streamId), 'websocket');
                        // Update viewer count
                        var updatedViewerCount = ((_a = streamIo.adapter.rooms.get("stream:".concat(streamId))) === null || _a === void 0 ? void 0 : _a.size) || 0;
                        storage_js_1.storage.updateStreamViewerCount(streamId, updatedViewerCount);
                        // Notify all clients about the updated viewer count
                        streamIo.to("stream:".concat(streamId)).emit('viewer_count', {
                            type: 'viewer_count',
                            streamId: streamId,
                            viewerCount: updatedViewerCount
                        });
                    });
                }
            });
            audioStreamConnections = new Map();
            webrtcWss = new ws_1.WebSocketServer({ noServer: true });
            webrtcActiveStreams = new Map();
            // Set up the WebRTC WebSocket server
            webrtcWss.on('connection', function (ws) {
                console.log('New WebRTC signaling connection established');
                // Generate a unique ID for this connection
                var connectionId = (0, uuid_1.v4)();
                ws.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
                    var data_1, _a, streamId, stream, joinStreamId_1, isExternalId, allStreams, stream, error_1, streamExistsInWebRTC, streamExistsInLegacy, stream_1, endStreamId, leaveStreamId, stream_2, error_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 15, , 16]);
                                data_1 = JSON.parse(message.toString());
                                console.log('WebRTC message received:', data_1.type);
                                _a = data_1.type;
                                switch (_a) {
                                    case 'host-stream': return [3 /*break*/, 1];
                                    case 'join-stream': return [3 /*break*/, 2];
                                    case 'stream-offer': return [3 /*break*/, 7];
                                    case 'stream-answer': return [3 /*break*/, 8];
                                    case 'ice-candidate': return [3 /*break*/, 9];
                                    case 'chat-message': return [3 /*break*/, 10];
                                    case 'end-stream': return [3 /*break*/, 11];
                                    case 'leave-stream': return [3 /*break*/, 12];
                                }
                                return [3 /*break*/, 13];
                            case 1:
                                streamId = data_1.data.streamId;
                                if (!webrtcActiveStreams.has(streamId)) {
                                    webrtcActiveStreams.set(streamId, {
                                        hostId: connectionId,
                                        viewers: new Set(),
                                        userId: undefined, // Will be populated when available
                                        streamKey: undefined // Will be populated when available
                                    });
                                }
                                else {
                                    stream = webrtcActiveStreams.get(streamId);
                                    stream.hostId = connectionId;
                                }
                                console.log("Host ".concat(connectionId, " started stream ").concat(streamId));
                                return [3 /*break*/, 14];
                            case 2:
                                joinStreamId_1 = data_1.data.streamId;
                                isExternalId = data_1.data.isExternalId;
                                if (!isExternalId) return [3 /*break*/, 6];
                                console.log("Looking up internal ID for external stream ID: ".concat(joinStreamId_1));
                                _b.label = 3;
                            case 3:
                                _b.trys.push([3, 5, , 6]);
                                return [4 /*yield*/, storage_js_1.storage.getAllStreams()];
                            case 4:
                                allStreams = _b.sent();
                                stream = allStreams.find(function (s) { return s.externalStreamId === joinStreamId_1; });
                                if (stream) {
                                    console.log("Found stream with external ID ".concat(joinStreamId_1, ", internal ID: ").concat(stream.id));
                                    joinStreamId_1 = stream.id.toString();
                                }
                                else {
                                    console.log("No stream found with external ID: ".concat(joinStreamId_1));
                                    ws.send(JSON.stringify({
                                        type: 'stream-not-found',
                                        data: { streamId: joinStreamId_1 }
                                    }));
                                    return [2 /*return*/]; // Early return if no matching stream
                                }
                                return [3 /*break*/, 6];
                            case 5:
                                error_1 = _b.sent();
                                console.error("Error looking up external stream ID ".concat(joinStreamId_1, ":"), error_1);
                                ws.send(JSON.stringify({
                                    type: 'stream-not-found',
                                    data: { streamId: joinStreamId_1 }
                                }));
                                return [2 /*return*/]; // Early return on error
                            case 6:
                                streamExistsInWebRTC = webrtcActiveStreams.has(joinStreamId_1);
                                streamExistsInLegacy = activeStreams.has(joinStreamId_1);
                                if (streamExistsInWebRTC || streamExistsInLegacy) {
                                    // If stream exists in legacy map but not WebRTC map, copy it
                                    if (!streamExistsInWebRTC && streamExistsInLegacy) {
                                        console.log("Copying stream ".concat(joinStreamId_1, " from legacy to WebRTC map"));
                                        webrtcActiveStreams.set(joinStreamId_1, {
                                            hostId: activeStreams.get(joinStreamId_1).hostId,
                                            viewers: new Set(),
                                            userId: activeStreams.get(joinStreamId_1).userId,
                                            streamKey: activeStreams.get(joinStreamId_1).streamKey
                                        });
                                    }
                                    stream_1 = webrtcActiveStreams.get(joinStreamId_1);
                                    stream_1.viewers.add(connectionId);
                                    // Notify host about new viewer
                                    webrtcWss.clients.forEach(function (client) {
                                        if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'viewer-joined',
                                                data: { viewerId: connectionId }
                                            }));
                                        }
                                    });
                                    // Update viewer count
                                    webrtcWss.clients.forEach(function (client) {
                                        if (client.readyState === ws_1.WebSocket.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'viewer-count',
                                                data: { count: stream_1.viewers.size }
                                            }));
                                        }
                                    });
                                    console.log("Viewer ".concat(connectionId, " joined stream ").concat(joinStreamId_1));
                                }
                                else {
                                    console.log("Stream not found: ".concat(joinStreamId_1));
                                    ws.send(JSON.stringify({
                                        type: 'stream-not-found'
                                    }));
                                }
                                return [3 /*break*/, 14];
                            case 7:
                                // Forward offer to specific viewer
                                webrtcWss.clients.forEach(function (client) {
                                    if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: 'stream-offer',
                                            data: {
                                                hostId: connectionId,
                                                description: data_1.data.description
                                            }
                                        }));
                                    }
                                });
                                return [3 /*break*/, 14];
                            case 8:
                                // Forward answer to host
                                webrtcWss.clients.forEach(function (client) {
                                    if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: 'stream-answer',
                                            data: {
                                                viewerId: connectionId,
                                                description: data_1.data.description
                                            }
                                        }));
                                    }
                                });
                                return [3 /*break*/, 14];
                            case 9:
                                // Forward ICE candidate
                                webrtcWss.clients.forEach(function (client) {
                                    if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: 'ice-candidate',
                                            data: {
                                                from: connectionId,
                                                candidate: data_1.data.candidate
                                            }
                                        }));
                                    }
                                });
                                return [3 /*break*/, 14];
                            case 10:
                                // Broadcast chat message to all clients
                                webrtcWss.clients.forEach(function (client) {
                                    if (client.readyState === ws_1.WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: 'chat-message',
                                            data: {
                                                senderId: connectionId,
                                                message: data_1.data.message,
                                                timestamp: new Date().toISOString()
                                            }
                                        }));
                                    }
                                });
                                return [3 /*break*/, 14];
                            case 11:
                                endStreamId = data_1.data.streamId;
                                if (webrtcActiveStreams.has(endStreamId)) {
                                    // Notify all viewers that the stream has ended
                                    webrtcWss.clients.forEach(function (client) {
                                        if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'stream-ended'
                                            }));
                                        }
                                    });
                                    webrtcActiveStreams.delete(endStreamId);
                                    console.log("Stream ".concat(endStreamId, " ended by host"));
                                }
                                return [3 /*break*/, 14];
                            case 12:
                                leaveStreamId = data_1.data.streamId;
                                if (webrtcActiveStreams.has(leaveStreamId)) {
                                    stream_2 = webrtcActiveStreams.get(leaveStreamId);
                                    stream_2.viewers.delete(connectionId);
                                    // Notify host that a viewer has left
                                    webrtcWss.clients.forEach(function (client) {
                                        if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'viewer-left',
                                                data: { viewerId: connectionId }
                                            }));
                                        }
                                    });
                                    // Update viewer count
                                    webrtcWss.clients.forEach(function (client) {
                                        if (client.readyState === ws_1.WebSocket.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'viewer-count',
                                                data: { count: stream_2.viewers.size }
                                            }));
                                        }
                                    });
                                }
                                return [3 /*break*/, 14];
                            case 13:
                                console.warn('Unknown message type:', data_1.type);
                                _b.label = 14;
                            case 14: return [3 /*break*/, 16];
                            case 15:
                                error_2 = _b.sent();
                                console.error('Error processing WebSocket message:', error_2);
                                return [3 /*break*/, 16];
                            case 16: return [2 /*return*/];
                        }
                    });
                }); });
                // Handle disconnect
                ws.on('close', function () {
                    console.log('WebRTC signaling connection closed:', connectionId);
                    var _loop_1 = function (streamId) {
                        var stream = webrtcActiveStreams.get(streamId);
                        if (stream.hostId === connectionId) {
                            // Host disconnected, end the stream
                            webrtcWss.clients.forEach(function (client) {
                                if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'stream-ended'
                                    }));
                                }
                            });
                            webrtcActiveStreams.delete(streamId);
                            console.log("Stream ".concat(streamId, " ended because host disconnected"));
                        }
                        else if (stream.viewers.has(connectionId)) {
                            // Viewer disconnected
                            stream.viewers.delete(connectionId);
                            // Notify host that a viewer has left
                            webrtcWss.clients.forEach(function (client) {
                                if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'viewer-left',
                                        data: { viewerId: connectionId }
                                    }));
                                }
                            });
                            // Update viewer count
                            webrtcWss.clients.forEach(function (client) {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'viewer-count',
                                        data: { count: stream.viewers.size }
                                    }));
                                }
                            });
                        }
                    };
                    // Clean up any streams this connection was hosting
                    for (var _i = 0, _a = Array.from(webrtcActiveStreams.keys()); _i < _a.length; _i++) {
                        var streamId = _a[_i];
                        _loop_1(streamId);
                    }
                });
            });
            // Handle HTTP->WebSocket upgrade for all WebSocket endpoints
            server.on('upgrade', function (request, socket, head) {
                var pathname = new URL(request.url || "", "http://".concat(request.headers.host)).pathname;
                // Route to appropriate WebSocket server based on path
                if (pathname === '/ws/chat') {
                    wss.handleUpgrade(request, socket, head, function (ws) {
                        wss.emit('connection', ws, request);
                    });
                }
                else if (pathname === '/ws/audio') {
                    audioStreamingWss.handleUpgrade(request, socket, head, function (ws) {
                        audioStreamingWss.emit('connection', ws, request);
                    });
                }
                else if (pathname === '/ws') {
                    // Handle the WebRTC signaling WebSocket
                    webrtcWss.handleUpgrade(request, socket, head, function (ws) {
                        webrtcWss.emit('connection', ws, request);
                    });
                }
                else {
                    // Unhandled WebSocket upgrade path
                    socket.destroy();
                }
            });
            activeStreams = new Map();
            activeHLSStreams = new Map();
            // Setup Socket.IO for WebRTC streams
            io.on("connection", function (socket) {
                console.log("User connected:", socket.id);
                // Host starting a stream
                socket.on("host-stream", function (_a) {
                    var streamId = _a.streamId, userId = _a.userId, streamKey = _a.streamKey;
                    if (!activeStreams.has(streamId)) {
                        activeStreams.set(streamId, {
                            hostId: socket.id,
                            viewers: new Set(),
                            userId: userId,
                            streamKey: streamKey
                        });
                    }
                    else {
                        var stream = activeStreams.get(streamId);
                        stream.hostId = socket.id;
                        if (userId)
                            stream.userId = userId;
                        if (streamKey)
                            stream.streamKey = streamKey;
                    }
                    socket.join("stream:".concat(streamId));
                    console.log("Host ".concat(socket.id, " started stream ").concat(streamId));
                });
                // Viewer joining a stream
                socket.on("join-stream", function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                    var effectiveStreamId, allStreams, stream, error_3, stream;
                    var streamId = _b.streamId, isExternalId = _b.isExternalId;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                effectiveStreamId = streamId;
                                if (!isExternalId) return [3 /*break*/, 4];
                                console.log("Socket.IO: Looking up internal ID for external stream ID: ".concat(streamId));
                                _c.label = 1;
                            case 1:
                                _c.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, storage_js_1.storage.getAllStreams()];
                            case 2:
                                allStreams = _c.sent();
                                stream = allStreams.find(function (s) { return s.externalStreamId === streamId; });
                                if (stream) {
                                    console.log("Socket.IO: Found stream with external ID ".concat(streamId, ", internal ID: ").concat(stream.id));
                                    effectiveStreamId = stream.id.toString();
                                }
                                else {
                                    console.log("Socket.IO: No stream found with external ID: ".concat(streamId));
                                    socket.emit("stream-not-found");
                                    return [2 /*return*/]; // Early return if no matching stream
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                error_3 = _c.sent();
                                console.error("Socket.IO: Error looking up external stream ID ".concat(streamId, ":"), error_3);
                                socket.emit("stream-not-found");
                                return [2 /*return*/]; // Early return on error
                            case 4:
                                if (activeStreams.has(effectiveStreamId)) {
                                    socket.join("stream:".concat(effectiveStreamId));
                                    stream = activeStreams.get(effectiveStreamId);
                                    stream.viewers.add(socket.id);
                                    // Notify host about new viewer
                                    if (stream.hostId) {
                                        io.to(stream.hostId).emit("viewer-joined", { viewerId: socket.id });
                                    }
                                    // Update viewer count for everyone in the room
                                    io.to(effectiveStreamId).emit("viewer-count", { count: stream.viewers.size });
                                    console.log("Viewer ".concat(socket.id, " joined stream ").concat(effectiveStreamId));
                                }
                                else {
                                    socket.emit("stream-not-found");
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Signaling for WebRTC
                socket.on("signal", function (_a) {
                    var to = _a.to, signal = _a.signal;
                    io.to(to).emit("signal", {
                        from: socket.id,
                        signal: signal
                    });
                });
                // Host sending stream offer to viewers
                socket.on("stream-offer", function (_a) {
                    var streamId = _a.streamId, description = _a.description, viewerId = _a.viewerId;
                    io.to(viewerId).emit("stream-offer", {
                        hostId: socket.id,
                        description: description
                    });
                });
                // Viewer sending answer to host
                socket.on("stream-answer", function (_a) {
                    var hostId = _a.hostId, description = _a.description;
                    io.to(hostId).emit("stream-answer", {
                        viewerId: socket.id,
                        description: description
                    });
                });
                // ICE candidate exchange
                socket.on("ice-candidate", function (_a) {
                    var targetId = _a.targetId, candidate = _a.candidate;
                    io.to(targetId).emit("ice-candidate", {
                        from: socket.id,
                        candidate: candidate
                    });
                });
                // Chat message
                socket.on("chat-message", function (_a) {
                    var streamId = _a.streamId, message = _a.message;
                    io.to("stream:".concat(streamId)).emit("chat-message", {
                        senderId: socket.id,
                        message: message,
                        timestamp: new Date().toISOString()
                    });
                });
                // Disconnect handler
                socket.on("disconnect", function () {
                    console.log("User disconnected:", socket.id);
                    // Check if the disconnected user was hosting any streams
                    for (var _i = 0, _a = Array.from(activeStreams.keys()); _i < _a.length; _i++) {
                        var streamId = _a[_i];
                        var stream = activeStreams.get(streamId);
                        if (stream.hostId === socket.id) {
                            // Notify all viewers that the stream has ended
                            io.to("stream:".concat(streamId)).emit("stream-ended");
                            activeStreams.delete(streamId);
                            console.log("Stream ".concat(streamId, " ended because host disconnected"));
                        }
                        else if (stream.viewers.has(socket.id)) {
                            // Remove viewer from the stream
                            stream.viewers.delete(socket.id);
                            // Notify host that a viewer has left
                            if (stream.hostId) {
                                io.to(stream.hostId).emit("viewer-left", { viewerId: socket.id });
                            }
                            // Update viewer count
                            io.to("stream:".concat(streamId)).emit("viewer-count", { count: stream.viewers.size });
                        }
                    }
                });
            });
            // Add some basic API endpoints
            app.get("/api/streams", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streams, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Promise.resolve([])];
                        case 1:
                            streams = _a.sent();
                            res.json(streams);
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            console.error("Error fetching streams:", error_4);
                            res.status(500).json({ message: "Failed to fetch streams" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // WebRTC Stream API endpoint for stream creation
            app.post("/api/streams/webrtc", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, userName, privateStreamKey, publicStreamId, streamData, streamIdMapping, response, dbError_1, error_5;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 6, , 7]);
                            // Require authentication for creating streams
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({
                                        success: false,
                                        message: "Authentication required to create a stream"
                                    })];
                            }
                            userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.userId;
                            userName = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || req.body.userName || 'Anonymous';
                            if (!userId) {
                                return [2 /*return*/, res.status(400).json({
                                        success: false,
                                        message: "User ID is required"
                                    })];
                            }
                            privateStreamKey = generateStreamKey(userId);
                            publicStreamId = generatePublicStreamId();
                            // Add to the WebRTC streams map with both IDs
                            webrtcActiveStreams.set(publicStreamId, {
                                hostId: "",
                                viewers: new Set(),
                                userId: userId,
                                streamKey: privateStreamKey
                            });
                            // Add to the regular active streams map for backward compatibility
                            activeStreams.set(publicStreamId, {
                                hostId: "",
                                viewers: new Set(),
                                userId: userId,
                                streamKey: privateStreamKey
                            });
                            console.log("Created new WebRTC stream with public ID: ".concat(publicStreamId));
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, storage_js_1.storage.createStream({
                                    userId: userId,
                                    title: req.body.title || "".concat(userName, "'s Stream"),
                                    description: req.body.description || "Live stream by ".concat(userName),
                                    streamKey: privateStreamKey, // Private key stored securely
                                    isLive: true, // Mark as live immediately
                                    category: req.body.category || "Music", // Default category
                                    tags: req.body.tags || ["live", "webrtc"],
                                    protocol: req.body.protocol || "webrtc",
                                    streamType: req.body.streamType || "video",
                                    externalStreamId: publicStreamId // Store public ID for reference
                                })];
                        case 2:
                            streamData = _c.sent();
                            console.log("Saved stream to database with ID ".concat(streamData.id, ", public ID: ").concat(publicStreamId));
                            // Update user's streaming status
                            return [4 /*yield*/, storage_js_1.storage.updateUser(userId, { isStreaming: true })];
                        case 3:
                            // Update user's streaming status
                            _c.sent();
                            streamIdMapping = new Map();
                            streamIdMapping.set(publicStreamId, streamData.id);
                            response = {
                                success: true,
                                streamId: publicStreamId, // Public ID for sharing
                                privateStreamKey: privateStreamKey, // Private key only for this response
                                dbStreamId: streamData.id,
                                shareUrl: "".concat(req.protocol, "://").concat(req.get("host"), "/stream/").concat(publicStreamId)
                            };
                            // If createShareableUrl was requested, create a temporary shareable URL
                            if (req.body.createShareableUrl) {
                                console.log("Creating shareable URL for WebRTC stream", publicStreamId);
                                // We already have the share URL constructed above
                                // You could add additional metadata or tracking here if needed
                            }
                            return [2 /*return*/, res.json(response)];
                        case 4:
                            dbError_1 = _c.sent();
                            console.error("Failed to save stream to database:", dbError_1);
                            // Clean up if database save fails
                            webrtcActiveStreams.delete(publicStreamId);
                            activeStreams.delete(publicStreamId);
                            return [2 /*return*/, res.status(500).json({
                                    success: false,
                                    message: "Failed to create stream in database",
                                    error: dbError_1.message
                                })];
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            error_5 = _c.sent();
                            console.error("Error creating WebRTC stream:", error_5);
                            res.status(500).json({
                                success: false,
                                message: "Failed to create stream",
                                error: error_5.message
                            });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // WebRTC Stream API endpoint to check if a stream exists
            app.get("/api/streams/webrtc/:streamId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, inMemoryExists, stream, dbStreams, dbStreamByExternalId, dbStreamByKey, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            streamId = req.params.streamId;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            inMemoryExists = activeStreams.has(streamId) || webrtcActiveStreams.has(streamId);
                            if (inMemoryExists) {
                                stream = webrtcActiveStreams.has(streamId)
                                    ? webrtcActiveStreams.get(streamId)
                                    : activeStreams.get(streamId);
                                return [2 /*return*/, res.json({
                                        success: true,
                                        streamId: streamId,
                                        viewerCount: stream.viewers.size,
                                        isLive: true
                                    })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getFeaturedStreams()];
                        case 2:
                            dbStreams = _a.sent();
                            dbStreamByExternalId = dbStreams.find(function (s) { return s.externalStreamId === streamId && s.isLive; });
                            dbStreamByKey = dbStreamByExternalId || dbStreams.find(function (s) { return s.streamKey === streamId && s.isLive; });
                            if (dbStreamByKey) {
                                console.log("Stream ".concat(streamId, " found in database but not in memory"));
                                // Recreate in-memory stream from database entry
                                webrtcActiveStreams.set(streamId, {
                                    hostId: "",
                                    viewers: new Set(),
                                    userId: dbStreamByKey.userId,
                                    streamKey: dbStreamByKey.streamKey || streamId
                                });
                                return [2 /*return*/, res.json({
                                        success: true,
                                        streamId: streamId,
                                        dbStreamId: dbStreamByKey.id,
                                        viewerCount: 0, // No viewers yet since we just restored it
                                        isLive: true
                                    })];
                            }
                            // Stream not found in memory or database
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: "Stream not found"
                                })];
                        case 3:
                            error_6 = _a.sent();
                            console.error("Error checking stream:", error_6);
                            return [2 /*return*/, res.status(500).json({
                                    success: false,
                                    message: "Error checking stream status"
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Get featured streams
            app.get("/api/streams/featured", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var featuredStreams, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_js_1.storage.getFeaturedStreams()];
                        case 1:
                            featuredStreams = _a.sent();
                            res.json(featuredStreams);
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            console.error("Error fetching featured streams:", error_7);
                            res.status(500).json({ message: "Failed to fetch featured streams" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get streams by user
            app.get("/api/streams/user/:userId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, userStreams, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = parseInt(req.params.userId);
                            if (isNaN(userId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid user ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getStreamsByUser(userId)];
                        case 1:
                            userStreams = _a.sent();
                            res.json(userStreams);
                            return [3 /*break*/, 3];
                        case 2:
                            error_8 = _a.sent();
                            console.error("Error fetching user streams:", error_8);
                            res.status(500).json({ message: "Failed to fetch user streams" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/streams/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, inMemoryExists, dbStream, streamData, isActive, visualElementInfo, isOwner, error_9;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            streamId = parseInt(req.params.id);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid stream ID" })];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            inMemoryExists = activeStreams.has(streamId.toString()) || webrtcActiveStreams.has(streamId.toString());
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamId)];
                        case 2:
                            dbStream = _b.sent();
                            if (!dbStream && !inMemoryExists) {
                                return [2 /*return*/, res.status(404).json({ success: false, message: "Stream not found" })];
                            }
                            streamData = dbStream || {};
                            isActive = inMemoryExists;
                            visualElementInfo = {};
                            if (dbStream && dbStream.visualElementUrl) {
                                visualElementInfo = {
                                    hasVisualElement: true,
                                    visualElementUrl: dbStream.visualElementUrl,
                                    visualElementType: dbStream.visualElementType || 'image'
                                };
                            }
                            isOwner = req.isAuthenticated() && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === (dbStream === null || dbStream === void 0 ? void 0 : dbStream.userId);
                            // Return appropriate data including privateStreamKey for owner
                            res.json({
                                success: true,
                                stream: __assign(__assign(__assign(__assign({}, streamData), { streamType: (dbStream === null || dbStream === void 0 ? void 0 : dbStream.streamType) || 'video', isActive: isActive }), visualElementInfo), { protocol: webrtcActiveStreams.has(streamId.toString()) ? 'webrtc' :
                                        activeStreams.has(streamId.toString()) ? 'hls' :
                                            (dbStream === null || dbStream === void 0 ? void 0 : dbStream.protocol) || 'webrtc', 
                                    // Include these fields for backward compatibility and also with the new naming convention
                                    privateStreamKey: isOwner ? dbStream === null || dbStream === void 0 ? void 0 : dbStream.streamKey : undefined, publicStreamId: dbStream === null || dbStream === void 0 ? void 0 : dbStream.externalStreamId, streamKey: isOwner ? dbStream === null || dbStream === void 0 ? void 0 : dbStream.streamKey : undefined, externalStreamId: dbStream === null || dbStream === void 0 ? void 0 : dbStream.externalStreamId, 
                                    // Include a share URL for convenience
                                    shareUrl: "".concat(req.protocol, "://").concat(req.get("host"), "/stream/").concat(dbStream === null || dbStream === void 0 ? void 0 : dbStream.externalStreamId) })
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_9 = _b.sent();
                            console.error("Error fetching stream details:", error_9);
                            res.status(500).json({ success: false, message: "Failed to fetch stream details" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/streams", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var activeStreams_1, streamSchema, validatedData, privateStreamKey, publicStreamId, newStream, error_10;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, storage_js_1.storage.getActiveStreamsByUser((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)];
                        case 2:
                            activeStreams_1 = _d.sent();
                            if (activeStreams_1.length > 0) {
                                return [2 /*return*/, res.status(400).json({
                                        message: "You already have an active stream. Please end your current stream before starting a new one.",
                                        existingStream: activeStreams_1[0]
                                    })];
                            }
                            streamSchema = schema_js_1.insertStreamSchema.extend({
                                title: zod_1.z.string().min(3).max(100),
                                description: zod_1.z.string().max(2000).optional(),
                                streamType: zod_1.z.enum(["video", "audio"]).default("video"),
                                protocol: zod_1.z.enum(["webrtc", "hls", "cloudflare"]).default("webrtc"),
                                useCamera: zod_1.z.boolean().default(true),
                                useMicrophone: zod_1.z.boolean().default(true),
                                useSystemAudio: zod_1.z.boolean().default(false),
                                hasVisualElement: zod_1.z.boolean().default(false)
                            });
                            validatedData = streamSchema.parse(req.body);
                            privateStreamKey = generateStreamKey((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                            publicStreamId = generatePublicStreamId();
                            return [4 /*yield*/, storage_js_1.storage.createStream(__assign(__assign({}, validatedData), { userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id, streamKey: privateStreamKey, externalStreamId: publicStreamId }))];
                        case 3:
                            newStream = _d.sent();
                            // Return the stream with both IDs
                            res.status(201).json(__assign(__assign({}, newStream), { shareUrl: "".concat(req.protocol, "://").concat(req.get("host"), "/stream/").concat(publicStreamId) }));
                            return [3 /*break*/, 5];
                        case 4:
                            error_10 = _d.sent();
                            console.error("Error creating stream:", error_10);
                            res.status(400).json({ message: "Invalid stream data", error: error_10 });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get all tracks
            app.get("/api/tracks", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var tracks, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_js_1.storage.getRecentTracks()];
                        case 1:
                            tracks = _a.sent();
                            res.json(tracks);
                            return [3 /*break*/, 3];
                        case 2:
                            error_11 = _a.sent();
                            console.error("Error fetching tracks:", error_11);
                            res.status(500).json({ message: "Failed to fetch tracks" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get recent tracks
            app.get("/api/tracks/recent", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var recentTracks, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_js_1.storage.getRecentTracks()];
                        case 1:
                            recentTracks = _a.sent();
                            res.json(recentTracks);
                            return [3 /*break*/, 3];
                        case 2:
                            error_12 = _a.sent();
                            console.error("Error fetching recent tracks:", error_12);
                            res.status(500).json({ message: "Failed to fetch recent tracks" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get tracks by user
            app.get("/api/tracks/user/:userId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, userTracks, error_13;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = parseInt(req.params.userId);
                            if (isNaN(userId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid user ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getTracksByUser(userId)];
                        case 1:
                            userTracks = _a.sent();
                            res.json(userTracks);
                            return [3 /*break*/, 3];
                        case 2:
                            error_13 = _a.sent();
                            console.error("Error fetching user tracks:", error_13);
                            res.status(500).json({ message: "Failed to fetch user tracks" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get a specific track
            app.get("/api/tracks/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var trackId, track, error_14;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            trackId = parseInt(req.params.id);
                            if (isNaN(trackId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid track ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getTrack(trackId)];
                        case 1:
                            track = _a.sent();
                            if (!track) {
                                return [2 /*return*/, res.status(404).json({ message: "Track not found" })];
                            }
                            res.json(track);
                            return [3 /*break*/, 3];
                        case 2:
                            error_14 = _a.sent();
                            console.error("Error fetching track:", error_14);
                            res.status(500).json({ message: "Failed to fetch track" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get recommended creators
            app.get("/api/creators/recommended", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var recommendedCreators, error_15;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_js_1.storage.getRecommendedCreators()];
                        case 1:
                            recommendedCreators = _a.sent();
                            res.json(recommendedCreators);
                            return [3 /*break*/, 3];
                        case 2:
                            error_15 = _a.sent();
                            console.error("Error fetching recommended creators:", error_15);
                            res.status(500).json({ message: "Failed to fetch recommended creators" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user by ID
            app.get("/api/users/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user, password, safeUser, error_16;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = parseInt(req.params.id);
                            if (isNaN(userId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid user ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getUser(userId)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            password = user.password, safeUser = __rest(user, ["password"]);
                            res.json(safeUser);
                            return [3 /*break*/, 3];
                        case 2:
                            error_16 = _a.sent();
                            console.error("Error fetching user:", error_16);
                            res.status(500).json({ message: "Failed to fetch user" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user by username
            app.get("/api/users/by-username/:username", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var username, user, password, safeUser, error_17;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            username = req.params.username;
                            if (!username) {
                                return [2 /*return*/, res.status(400).json({ message: "Username is required" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getUserByUsername(username)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            password = user.password, safeUser = __rest(user, ["password"]);
                            res.json(safeUser);
                            return [3 /*break*/, 3];
                        case 2:
                            error_17 = _a.sent();
                            console.error("Error fetching user by username:", error_17);
                            res.status(500).json({ message: "Failed to fetch user by username" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user settings
            app.get("/api/user-settings/:userId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, settings, defaultSettings, error_18;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            userId = parseInt(req.params.userId);
                            if (isNaN(userId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid user ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getUserSettings(userId)];
                        case 1:
                            settings = _a.sent();
                            if (!!settings) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_js_1.storage.createUserSettings({
                                    userId: userId,
                                    uiColor: "#8B5CF6",
                                    enableAutoplay: true,
                                    defaultSortType: "recent",
                                    highContrastMode: false
                                })];
                        case 2:
                            defaultSettings = _a.sent();
                            return [2 /*return*/, res.json(defaultSettings)];
                        case 3:
                            res.json(settings);
                            return [3 /*break*/, 5];
                        case 4:
                            error_18 = _a.sent();
                            console.error("Error fetching user settings:", error_18);
                            res.status(500).json({ message: "Failed to fetch user settings" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Update user settings
            app.patch("/api/user-settings/:userId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a, uiColor, enableAutoplay, defaultSortType, highContrastMode, updatedSettings, error_19;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            userId = parseInt(req.params.userId);
                            if (isNaN(userId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid user ID" })];
                            }
                            _a = req.body, uiColor = _a.uiColor, enableAutoplay = _a.enableAutoplay, defaultSortType = _a.defaultSortType, highContrastMode = _a.highContrastMode;
                            return [4 /*yield*/, storage_js_1.storage.updateUserSettings(userId, {
                                    uiColor: uiColor,
                                    enableAutoplay: enableAutoplay,
                                    defaultSortType: defaultSortType,
                                    highContrastMode: highContrastMode
                                })];
                        case 1:
                            updatedSettings = _b.sent();
                            console.log("Updated user settings:", updatedSettings);
                            res.json(updatedSettings);
                            return [3 /*break*/, 3];
                        case 2:
                            error_19 = _b.sent();
                            console.error("Error updating user settings:", error_19);
                            res.status(500).json({ message: "Failed to update user settings" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get all posts
            app.get("/api/posts", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var posts, error_20;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_js_1.storage.getRecentPosts()];
                        case 1:
                            posts = _a.sent();
                            res.json(posts);
                            return [3 /*break*/, 3];
                        case 2:
                            error_20 = _a.sent();
                            console.error("Error fetching posts:", error_20);
                            res.status(500).json({ message: "Failed to fetch posts" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get posts by user
            app.get("/api/posts/user/:userId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, userPosts, error_21;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = parseInt(req.params.userId);
                            if (isNaN(userId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid user ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getPostsByUser(userId)];
                        case 1:
                            userPosts = _a.sent();
                            res.json(userPosts);
                            return [3 /*break*/, 3];
                        case 2:
                            error_21 = _a.sent();
                            console.error("Error fetching user posts:", error_21);
                            res.status(500).json({ message: "Failed to fetch user posts" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Check if user has liked content
            app.get("/api/likes/check", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, contentId, contentType, isLiked, error_22;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = parseInt(req.query.userId);
                            contentId = parseInt(req.query.contentId);
                            contentType = req.query.contentType;
                            if (isNaN(userId) || isNaN(contentId) || !contentType) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid parameters" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.isLiked(userId, contentId, contentType)];
                        case 1:
                            isLiked = _a.sent();
                            res.json({ isLiked: isLiked });
                            return [3 /*break*/, 3];
                        case 2:
                            error_22 = _a.sent();
                            console.error("Error checking like status:", error_22);
                            res.status(500).json({ message: "Failed to check like status" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get like count for content
            app.get("/api/likes/count/:contentType/:contentId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var contentId, contentType, likeCount, error_23;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            contentId = parseInt(req.params.contentId);
                            contentType = req.params.contentType;
                            if (isNaN(contentId) || !contentType) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid parameters" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getLikeCount(contentId, contentType)];
                        case 1:
                            likeCount = _a.sent();
                            res.json({ likeCount: likeCount });
                            return [3 /*break*/, 3];
                        case 2:
                            error_23 = _a.sent();
                            console.error("Error fetching like count:", error_23);
                            res.status(500).json({ message: "Failed to fetch like count" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create like
            app.post("/api/likes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var likeData, like, error_24;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            likeData = {
                                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                                contentId: req.body.contentId,
                                contentType: req.body.contentType
                            };
                            return [4 /*yield*/, storage_js_1.storage.createLike(likeData)];
                        case 2:
                            like = _b.sent();
                            res.status(201).json(like);
                            return [3 /*break*/, 4];
                        case 3:
                            error_24 = _b.sent();
                            console.error("Error creating like:", error_24);
                            res.status(500).json({ message: "Failed to create like" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Remove like
            app.delete("/api/likes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, contentId, contentType, error_25;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                            contentId = parseInt(req.query.contentId);
                            contentType = req.query.contentType;
                            if (isNaN(contentId) || !contentType) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid parameters" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.removeLike(userId, contentId, contentType)];
                        case 2:
                            _b.sent();
                            res.json({ success: true });
                            return [3 /*break*/, 4];
                        case 3:
                            error_25 = _b.sent();
                            console.error("Error removing like:", error_25);
                            res.status(500).json({ message: "Failed to remove like" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // End a stream
            app.post("/api/streams/:id/end", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, stream, updatedStream, error_26;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            streamId = parseInt(req.params.id);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid stream ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamId)];
                        case 1:
                            stream = _b.sent();
                            if (!stream) {
                                return [2 /*return*/, res.status(404).json({ message: "Stream not found" })];
                            }
                            // Check authorization (only stream owner can end it)
                            if (req.isAuthenticated() && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== stream.userId) {
                                return [2 /*return*/, res.status(403).json({ message: "Not authorized to end this stream" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.updateStream(streamId, {
                                    isLive: false,
                                    endedAt: new Date()
                                })];
                        case 2:
                            updatedStream = _b.sent();
                            res.json(updatedStream);
                            return [3 /*break*/, 4];
                        case 3:
                            error_26 = _b.sent();
                            console.error("Error ending stream:", error_26);
                            res.status(500).json({ message: "Failed to end stream" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Delete a stream
            app.delete("/api/streams/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, stream, error_27;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            streamId = parseInt(req.params.id);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid stream ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamId)];
                        case 1:
                            stream = _b.sent();
                            if (!stream) {
                                return [2 /*return*/, res.status(404).json({ message: "Stream not found" })];
                            }
                            // Check authorization (only stream owner can delete it)
                            if (req.isAuthenticated() && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== stream.userId) {
                                return [2 /*return*/, res.status(403).json({ message: "Not authorized to delete this stream" })];
                            }
                            // Delete the stream
                            return [4 /*yield*/, storage_js_1.storage.deleteStream(streamId)];
                        case 2:
                            // Delete the stream
                            _b.sent();
                            res.json({ success: true });
                            return [3 /*break*/, 4];
                        case 3:
                            error_27 = _b.sent();
                            console.error("Error deleting stream:", error_27);
                            res.status(500).json({ message: "Failed to delete stream" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Delete track endpoint
            app.delete("/api/tracks/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var trackId, track, success, error_28;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            trackId = parseInt(req.params.id);
                            if (isNaN(trackId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid track ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getTrack(trackId)];
                        case 1:
                            track = _b.sent();
                            if (!track) {
                                return [2 /*return*/, res.status(404).json({ message: "Track not found" })];
                            }
                            // Check authorization (only track owner can delete it)
                            if (req.isAuthenticated() && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== track.userId) {
                                return [2 /*return*/, res.status(403).json({ message: "Not authorized to delete this track" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.deleteTrack(trackId)];
                        case 2:
                            success = _b.sent();
                            if (success) {
                                res.json({ success: true });
                            }
                            else {
                                res.status(500).json({ message: "Failed to delete track" });
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_28 = _b.sent();
                            console.error("Error deleting track:", error_28);
                            res.status(500).json({ message: "Failed to delete track" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Delete post endpoint
            app.delete("/api/posts/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var postId, post, success, error_29;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            postId = parseInt(req.params.id);
                            if (isNaN(postId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid post ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getPost(postId)];
                        case 1:
                            post = _b.sent();
                            if (!post) {
                                return [2 /*return*/, res.status(404).json({ message: "Post not found" })];
                            }
                            // Check authorization (only post owner can delete it)
                            if (req.isAuthenticated() && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== post.userId) {
                                return [2 /*return*/, res.status(403).json({ message: "Not authorized to delete this post" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.deletePost(postId)];
                        case 2:
                            success = _b.sent();
                            if (success) {
                                res.json({ success: true });
                            }
                            else {
                                res.status(500).json({ message: "Failed to delete post" });
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_29 = _b.sent();
                            console.error("Error deleting post:", error_29);
                            res.status(500).json({ message: "Failed to delete post" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // HLS Streaming Routes
            // Route to serve the master playlist (index.m3u8)
            app.get("/hls/:streamId/master.m3u8", hls_js_1.handleMasterPlaylist);
            // Route to serve the media playlist (playlist.m3u8)
            app.get("/hls/:streamId/playlist.m3u8", hls_js_1.handleMediaPlaylist);
            // Route to serve individual segments
            app.get("/hls/:streamId/:segment", hls_js_1.handleSegment);
            // Route to upload HLS segments (for direct uploads from broadcaster)
            app.post("/api/streams/:streamId/segment", function (req, res, next) {
                memoryUpload.single('segment')(req, res, function (err) {
                    if (err)
                        return next(err);
                    (0, hls_js_1.uploadSegment)(req, res);
                });
            });
            visualStorage = multer_1.default.diskStorage({
                destination: function (req, file, cb) {
                    var uploadsDir = path_1.default.join(process.cwd(), 'uploads/visual-elements');
                    if (!fs_1.default.existsSync(uploadsDir)) {
                        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
                    }
                    cb(null, uploadsDir);
                },
                filename: function (req, file, cb) {
                    var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    var ext = path_1.default.extname(file.originalname);
                    cb(null, "visual-".concat(uniqueSuffix).concat(ext));
                }
            });
            visualUpload = (0, multer_1.default)({
                storage: visualStorage,
                limits: {
                    fileSize: 10 * 1024 * 1024, // 10MB limit
                },
                fileFilter: function (req, file, cb) {
                    // Accept only images and videos
                    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('Only images and videos are allowed'));
                    }
                }
            });
            app.post("/api/streams/:id/visual-element", function (req, res, next) {
                visualUpload.single('visualElement')(req, res, function (err) {
                    if (err)
                        return next(err);
                    if (!req.isAuthenticated()) {
                        return res.status(401).json({ message: "Unauthorized" });
                    }
                    var streamId = parseInt(req.params.id);
                    try {
                        // Rest of the handler will be added via next edit
                        next();
                    }
                    catch (error) {
                        next(error);
                    }
                });
            }, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, stream, file, visualElementType, baseUrl, visualElementUrl, updatedStream, error_30;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            streamId = parseInt(req.params.id);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamId)];
                        case 2:
                            stream = _b.sent();
                            if (!stream) {
                                return [2 /*return*/, res.status(404).json({ message: "Stream not found" })];
                            }
                            // Recheck authentication since TypeScript thinks req.user might be undefined
                            if (!req.user || stream.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                                return [2 /*return*/, res.status(403).json({ message: "You don't have permission to modify this stream" })];
                            }
                            if (!req.file) {
                                return [2 /*return*/, res.status(400).json({ message: "No file uploaded" })];
                            }
                            file = req.file;
                            visualElementType = file.mimetype.startsWith('image/') ? 'image' : 'video';
                            baseUrl = process.env.BASE_URL || "".concat(req.protocol, "://").concat(req.get('host'));
                            visualElementUrl = "".concat(baseUrl, "/uploads/visual-elements/").concat(file.filename);
                            return [4 /*yield*/, storage_js_1.storage.updateStream(streamId, {
                                    hasVisualElement: true,
                                    visualElementType: visualElementType,
                                    visualElementUrl: visualElementUrl
                                })];
                        case 3:
                            updatedStream = _b.sent();
                            res.status(200).json({
                                message: "Visual element uploaded successfully",
                                stream: updatedStream
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_30 = _b.sent();
                            console.error("Error uploading visual element:", error_30);
                            res.status(500).json({ message: "Failed to upload visual element" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Route to initialize HLS stream
            app.post("/api/streams/:streamId/hls", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, stream, playlistUrl, segmentUrl, hlsFolderPath, error_31;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 5, , 6]);
                            streamId = parseInt(req.params.streamId);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid stream ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamId)];
                        case 2:
                            stream = _c.sent();
                            if (!stream) {
                                return [2 /*return*/, res.status(404).json({ message: "Stream not found" })];
                            }
                            // Check authorization (only stream owner can initialize HLS)
                            // Recheck authentication since TypeScript thinks req.user might be undefined
                            if (!req.user || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== stream.userId) {
                                return [2 /*return*/, res.status(403).json({ message: "Not authorized to initialize this stream" })];
                            }
                            return [4 /*yield*/, (0, hls_js_1.createOrUpdateHLSPlaylist)(streamId, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id)];
                        case 3:
                            playlistUrl = _c.sent();
                            segmentUrl = "/api/streams/".concat(streamId, "/segment");
                            hlsFolderPath = path_1.default.join(process.cwd(), 'uploads', 'hls', streamId.toString());
                            // Update stream with HLS URL and other HLS info
                            return [4 /*yield*/, storage_js_1.storage.updateStream(streamId, {
                                    isLive: true,
                                    hlsPlaylistUrl: playlistUrl,
                                    hlsSegmentUrl: segmentUrl,
                                    hlsFolderPath: hlsFolderPath
                                })];
                        case 4:
                            // Update stream with HLS URL and other HLS info
                            _c.sent();
                            res.json({
                                success: true,
                                streamId: streamId,
                                hlsPlaylistUrl: playlistUrl,
                                hlsSegmentUrl: segmentUrl
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_31 = _c.sent();
                            console.error("Error initializing HLS stream:", error_31);
                            res.status(500).json({ message: "Failed to initialize HLS stream" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Route to end HLS stream and finalize recording
            app.post("/api/streams/:streamId/hls/end", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, endResult, error_32;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            streamId = parseInt(req.params.streamId);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid stream ID" })];
                            }
                            // Make sure req.user is defined
                            if (!req.user) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized - user not authenticated" })];
                            }
                            return [4 /*yield*/, (0, hls_js_1.endHLSStream)(streamId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id)];
                        case 2:
                            endResult = _b.sent();
                            // Update stream in database
                            return [4 /*yield*/, storage_js_1.storage.updateStream(streamId, {
                                    isLive: false,
                                    endedAt: new Date()
                                })];
                        case 3:
                            // Update stream in database
                            _b.sent();
                            // Return result with potential save prompt
                            res.json(endResult);
                            return [3 /*break*/, 5];
                        case 4:
                            error_32 = _b.sent();
                            console.error("Error ending HLS stream:", error_32);
                            res.status(500).json({ message: "Failed to end HLS stream" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Route to finalize a stream recording (save or delete)
            app.post("/api/streams/:streamId/recording/finalize", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, savePermanently, result, error_33;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            streamId = parseInt(req.params.streamId);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid stream ID" })];
                            }
                            savePermanently = req.body.savePermanently;
                            if (typeof savePermanently !== 'boolean') {
                                return [2 /*return*/, res.status(400).json({ message: "Missing or invalid 'savePermanently' parameter" })];
                            }
                            // Make sure req.user is defined
                            if (!req.user) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized - user not authenticated" })];
                            }
                            return [4 /*yield*/, (0, hls_js_1.finalizeStreamRecording)(streamId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, savePermanently)];
                        case 2:
                            result = _b.sent();
                            res.json(result);
                            return [3 /*break*/, 4];
                        case 3:
                            error_33 = _b.sent();
                            console.error("Error finalizing stream recording:", error_33);
                            res.status(500).json({ message: "Failed to finalize recording" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Handle Cloudflare Stream started event
            app.post("/api/streams/:streamId/started", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, stream, cloudflareStreamId, updatedStream, error_34;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!req.isAuthenticated() || !req.user) {
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            streamId = parseInt(req.params.streamId);
                            if (isNaN(streamId)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid stream ID" })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamId)];
                        case 2:
                            stream = _b.sent();
                            if (!stream) {
                                return [2 /*return*/, res.status(404).json({ message: "Stream not found" })];
                            }
                            // Verify stream ownership
                            if (stream.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                                return [2 /*return*/, res.status(403).json({ message: "You don't have permission to update this stream" })];
                            }
                            cloudflareStreamId = req.body.cloudflareStreamId;
                            return [4 /*yield*/, storage_js_1.storage.updateStream(streamId, {
                                    externalStreamId: cloudflareStreamId,
                                    startedAt: new Date(),
                                    isLive: true
                                })];
                        case 3:
                            updatedStream = _b.sent();
                            console.log("Cloudflare Stream started with ID ".concat(cloudflareStreamId, " for stream ").concat(streamId));
                            return [2 /*return*/, res.json({ success: true, stream: updatedStream })];
                        case 4:
                            error_34 = _b.sent();
                            console.error("Error updating Cloudflare stream info:", error_34);
                            return [2 /*return*/, res.status(500).json({ message: "Failed to update stream information" })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // HLS version of the webrtc stream creation endpoint
            app.post("/api/streams/hls", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, userName, activeStreams_2, privateStreamKey, publicStreamId, streamData, playlistUrl, segmentUrl, hlsFolderPath, response, error_35;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 6, , 7]);
                            // Require authentication for creating streams
                            if (!req.isAuthenticated() || !req.user) {
                                return [2 /*return*/, res.status(401).json({
                                        success: false,
                                        message: "Authentication required to create a stream"
                                    })];
                            }
                            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                            userName = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || 'Anonymous';
                            return [4 /*yield*/, storage_js_1.storage.getActiveStreamsByUser(userId)];
                        case 1:
                            activeStreams_2 = _c.sent();
                            if (activeStreams_2.length > 0) {
                                return [2 /*return*/, res.status(400).json({
                                        success: false,
                                        message: "You already have an active stream. Please end your current stream before starting a new one.",
                                        existingStream: activeStreams_2[0]
                                    })];
                            }
                            privateStreamKey = generateStreamKey(userId);
                            publicStreamId = generatePublicStreamId();
                            return [4 /*yield*/, storage_js_1.storage.createStream({
                                    userId: userId,
                                    title: req.body.title || "".concat(userName, "'s Stream"),
                                    description: req.body.description || "Live stream by ".concat(userName),
                                    streamKey: privateStreamKey,
                                    externalStreamId: publicStreamId,
                                    isLive: true, // Mark as live immediately
                                    category: req.body.category || "Music", // Default category
                                    tags: req.body.tags || ["live", "hls"],
                                    protocol: "hls" // Set the protocol to HLS
                                })];
                        case 2:
                            streamData = _c.sent();
                            return [4 /*yield*/, (0, hls_js_1.createOrUpdateHLSPlaylist)(streamData.id, userId)];
                        case 3:
                            playlistUrl = _c.sent();
                            segmentUrl = "/api/streams/".concat(streamData.id, "/segment");
                            hlsFolderPath = path_1.default.join(process.cwd(), 'uploads', 'hls', streamData.id.toString());
                            // Update stream with HLS URL and other HLS info
                            return [4 /*yield*/, storage_js_1.storage.updateStream(streamData.id, {
                                    hlsPlaylistUrl: playlistUrl,
                                    hlsSegmentUrl: segmentUrl,
                                    hlsFolderPath: hlsFolderPath
                                })];
                        case 4:
                            // Update stream with HLS URL and other HLS info
                            _c.sent();
                            // Update user's streaming status
                            return [4 /*yield*/, storage_js_1.storage.updateUser(userId, { isStreaming: true })];
                        case 5:
                            // Update user's streaming status
                            _c.sent();
                            response = {
                                success: true,
                                streamId: streamData.id,
                                streamKey: privateStreamKey, // Only sent to the creator (for backward compatibility)
                                privateStreamKey: privateStreamKey,
                                publicStreamId: publicStreamId,
                                hlsPlaylistUrl: playlistUrl,
                                hlsSegmentUrl: segmentUrl,
                                shareUrl: "".concat(req.protocol, "://").concat(req.get("host"), "/stream/").concat(publicStreamId)
                            };
                            // If createShareableUrl was requested, create a temporary shareable URL
                            if (req.body.createShareableUrl) {
                                console.log("Creating shareable URL for stream", streamData.id);
                                // We already have the share URL constructed above
                                // You could add additional metadata or tracking here if needed
                            }
                            return [2 /*return*/, res.status(201).json(response)];
                        case 6:
                            error_35 = _c.sent();
                            console.error("Error creating HLS stream:", error_35);
                            res.status(500).json({
                                success: false,
                                message: "Failed to create stream",
                                error: error_35.message
                            });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // Generic stream check endpoint used by JoinStream component
            app.get("/api/streams/:streamId/check", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, isNumeric, stream, inMemoryExists, streamData, userStreams, matchingStream, error_36;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            streamId = req.params.streamId;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            isNumeric = /^\d+$/.test(streamId);
                            stream = void 0;
                            if (!isNumeric) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_js_1.storage.getStream(parseInt(streamId))];
                        case 2:
                            // If numeric ID, look up directly in database
                            stream = _a.sent();
                            if (stream && stream.isLive) {
                                return [2 /*return*/, res.json({
                                        exists: true,
                                        streamId: stream.id,
                                        title: stream.title,
                                        isLive: true,
                                        viewerCount: stream.viewerCount,
                                        protocol: stream.protocol
                                    })];
                            }
                            _a.label = 3;
                        case 3:
                            inMemoryExists = activeStreams.has(streamId) || webrtcActiveStreams.has(streamId);
                            if (!inMemoryExists) return [3 /*break*/, 6];
                            streamData = webrtcActiveStreams.has(streamId)
                                ? webrtcActiveStreams.get(streamId)
                                : activeStreams.get(streamId);
                            if (!streamData.userId) return [3 /*break*/, 5];
                            return [4 /*yield*/, storage_js_1.storage.getStreamsByUser(streamData.userId)];
                        case 4:
                            userStreams = _a.sent();
                            matchingStream = userStreams.find(function (s) { return s.isLive &&
                                (s.streamKey === streamId || s.id.toString() === streamId); });
                            if (matchingStream) {
                                return [2 /*return*/, res.json({
                                        exists: true,
                                        streamId: matchingStream.id,
                                        title: matchingStream.title,
                                        isLive: true,
                                        viewerCount: matchingStream.viewerCount ||
                                            (webrtcActiveStreams.has(streamId) ? webrtcActiveStreams.get(streamId).viewers.size : 0),
                                        protocol: matchingStream.protocol || 'webrtc'
                                    })];
                            }
                            _a.label = 5;
                        case 5: 
                        // Fallback if we can't find the stream in the database
                        return [2 /*return*/, res.json({
                                exists: true,
                                streamId: streamId,
                                title: "Live Stream",
                                isLive: true,
                                viewerCount: webrtcActiveStreams.has(streamId)
                                    ? webrtcActiveStreams.get(streamId).viewers.size
                                    : 0,
                                protocol: 'webrtc'
                            })];
                        case 6: 
                        // If we get here, the stream wasn't found
                        return [2 /*return*/, res.json({
                                exists: false,
                                message: "Stream not found or not live"
                            })];
                        case 7:
                            error_36 = _a.sent();
                            console.error("Error checking stream:", error_36);
                            return [2 /*return*/, res.status(500).json({
                                    exists: false,
                                    message: "Error checking stream status",
                                    error: error_36.message
                                })];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            /**
             * Validate a stream key (for broadcasters)
             * This endpoint verifies that a provided stream key is valid for a given stream
             */
            app.post("/api/streams/validate-key", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamId, streamKey, streamIdNumber, stream, exactMatch, userMatch, isValid, error_37;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            streamId = req.body.streamId;
                            streamKey = req.body.streamKey;
                            if (!streamId || !streamKey) {
                                return [2 /*return*/, res.status(400).json({
                                        valid: false,
                                        message: "Stream ID and stream key are required"
                                    })];
                            }
                            streamIdNumber = void 0;
                            try {
                                streamIdNumber = parseInt(streamId.toString());
                                if (isNaN(streamIdNumber)) {
                                    throw new Error("Invalid stream ID format");
                                }
                            }
                            catch (e) {
                                return [2 /*return*/, res.status(400).json({
                                        valid: false,
                                        message: "Invalid stream ID format"
                                    })];
                            }
                            return [4 /*yield*/, storage_js_1.storage.getStream(streamIdNumber)];
                        case 1:
                            stream = _a.sent();
                            if (!stream) {
                                return [2 /*return*/, res.status(404).json({
                                        valid: false,
                                        message: "Stream not found"
                                    })];
                            }
                            console.log("Validating stream key for stream ".concat(streamIdNumber, " with userId ").concat(stream.userId));
                            exactMatch = stream.streamKey === streamKey;
                            userMatch = false;
                            if (stream.userId) {
                                userMatch = validateStreamKey(streamKey, stream.userId);
                            }
                            isValid = exactMatch || userMatch;
                            console.log("Stream key validation result: exact=".concat(exactMatch, ", userMatch=").concat(userMatch, ", valid=").concat(isValid));
                            return [2 /*return*/, res.json({
                                    valid: isValid,
                                    message: isValid ? "Stream key is valid" : "Invalid stream key"
                                })];
                        case 2:
                            error_37 = _a.sent();
                            console.error("Error validating stream key:", error_37);
                            res.status(500).json({
                                valid: false,
                                message: "Error validating stream key"
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            /**
             * Verify a stream key via GET request (for broadcasters)
             * This is a convenience endpoint that allows validation via query parameters
             */
            app.get("/api/streams/verify-key", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var streamKey_1, streams, matchingStream, _i, streams_1, stream, safeStreamData, _omittedKey, safeStream, error_38;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            console.log("Verify stream key request received with query:", req.query);
                            streamKey_1 = req.query.streamKey;
                            if (!streamKey_1 || typeof streamKey_1 !== 'string') {
                                return [2 /*return*/, res.status(400).json({
                                        success: false,
                                        message: "Stream key is required"
                                    })];
                            }
                            console.log("Looking for stream with key: ".concat(streamKey_1));
                            return [4 /*yield*/, storage_js_1.storage.getAllStreams()];
                        case 1:
                            streams = _a.sent();
                            console.log("Found ".concat(streams.length, " streams in total"));
                            matchingStream = streams.find(function (stream) { return stream.streamKey === streamKey_1; });
                            // If no exact match, try to validate the key against each stream's user ID
                            if (!matchingStream) {
                                for (_i = 0, streams_1 = streams; _i < streams_1.length; _i++) {
                                    stream = streams_1[_i];
                                    // Make sure userId is defined before validation
                                    if (stream.userId && validateStreamKey(streamKey_1, stream.userId)) {
                                        console.log("Found stream with validated key for user: ".concat(stream.userId));
                                        matchingStream = stream;
                                        break;
                                    }
                                }
                            }
                            // Additional debugging
                            if (streams.length > 0) {
                                console.log("First stream key check:", {
                                    streamKeyExists: !!streams[0].streamKey,
                                    // Only check other properties if they exist
                                    keyRelatedProps: Object.keys(streams[0]).filter(function (key) { return key.includes('key') || key.includes('Key'); })
                                });
                            }
                            if (!matchingStream) {
                                console.log("No matching stream found for the provided key");
                                return [2 /*return*/, res.status(401).json({
                                        success: false,
                                        message: "Invalid stream key"
                                    })];
                            }
                            console.log("Found matching stream: ID=".concat(matchingStream.id, ", title=").concat(matchingStream.title));
                            safeStreamData = __assign({}, matchingStream);
                            _omittedKey = safeStreamData.streamKey, safeStream = __rest(safeStreamData, ["streamKey"]);
                            return [2 /*return*/, res.status(200).json({
                                    success: true,
                                    message: "Stream key is valid",
                                    stream: safeStream
                                })];
                        case 2:
                            error_38 = _a.sent();
                            console.error("Error verifying stream key:", error_38);
                            res.status(500).json({
                                success: false,
                                message: "Error verifying stream key"
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            /**
             * Get stream by public ID (for viewers)
             * This endpoint allows viewers to access stream information using the public stream ID
             */
            app.get("/api/streams/public/:publicId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var publicId_1, allStreams, stream, safeStreamData, _streamKey2, safeData, error_39;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            publicId_1 = req.params.publicId;
                            if (!publicId_1) {
                                return [2 /*return*/, res.status(400).json({
                                        success: false,
                                        message: "Public stream ID is required"
                                    })];
                            }
                            console.log("Looking for stream with public ID: ".concat(publicId_1));
                            return [4 /*yield*/, storage_js_1.storage.getAllStreams()];
                        case 1:
                            allStreams = _a.sent();
                            console.log("Found ".concat(allStreams.length, " streams in total"));
                            stream = allStreams.find(function (s) { return s.externalStreamId === publicId_1; });
                            // Additional debugging
                            if (allStreams.length > 0) {
                                console.log("First stream external IDs:", {
                                    externalStreamId: allStreams[0].externalStreamId,
                                    otherProps: Object.keys(allStreams[0]).filter(function (key) { return key.includes('id') || key.includes('Id'); })
                                });
                            }
                            if (!stream) {
                                console.log("No matching stream found for the provided public ID");
                                return [2 /*return*/, res.status(404).json({
                                        success: false,
                                        message: "Stream not found"
                                    })];
                            }
                            console.log("Found matching stream: ID=".concat(stream.id, ", title=").concat(stream.title));
                            safeStreamData = __assign({}, stream);
                            _streamKey2 = safeStreamData.streamKey, safeData = __rest(safeStreamData, ["streamKey"]);
                            res.json({
                                success: true,
                                stream: safeData
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_39 = _a.sent();
                            console.error("Error fetching stream by public ID:", error_39);
                            res.status(500).json({
                                success: false,
                                message: "Failed to fetch stream"
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/, server];
        });
    });
}
