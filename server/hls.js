"use strict";
/**
 * HLS (HTTP Live Streaming) handler for livestreams
 * Manages dynamic M3U8 playlist creation and segment handling
 *
 * Enhanced with cloud object storage support for temporary and permanent recordings
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateHLSPlaylist = createOrUpdateHLSPlaylist;
exports.endHLSStream = endHLSStream;
exports.finalizeStreamRecording = finalizeStreamRecording;
exports.handleMasterPlaylist = handleMasterPlaylist;
exports.handleMediaPlaylist = handleMediaPlaylist;
exports.handleSegment = handleSegment;
exports.uploadSegment = uploadSegment;
exports.processWebRTCChunk = processWebRTCChunk;
exports.cleanupHLSData = cleanupHLSData;
exports.getHLSStreamsInfo = getHLSStreamsInfo;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var storage_1 = require("./storage");
var object_storage_1 = require("./object-storage");
// In-memory store of active HLS streams
var hlsStreams = new Map();
// Directory for storing temporary HLS segments 
// (fallback if object storage isn't configured)
var HLS_TEMP_DIR = path_1.default.join(process.cwd(), 'uploads', 'hls');
// Ensure HLS directory exists
if (!fs_1.default.existsSync(HLS_TEMP_DIR)) {
    fs_1.default.mkdirSync(HLS_TEMP_DIR, { recursive: true });
}
/**
 * Creates or updates a stream's HLS playlist
 */
function createOrUpdateHLSPlaylist(streamId_1, userId_1, segment_1) {
    return __awaiter(this, arguments, void 0, function (streamId, userId, segment, mimeType) {
        var stream, streamInfo, useObjectStorage, newStreamInfo, streamDir, segmentIndex, segmentName, segmentUrl, segmentPath, segmentSizeKbits, segmentDurationSec, segmentBitrate, playlistUrl, error_1;
        if (mimeType === void 0) { mimeType = 'video/mp4'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, storage_1.storage.getStream(streamId)];
                case 1:
                    stream = _a.sent();
                    if (!stream) {
                        throw new Error("Stream ".concat(streamId, " not found"));
                    }
                    // Validate the user is the stream owner
                    if (stream.userId !== userId) {
                        throw new Error('Not authorized to update this stream');
                    }
                    streamInfo = hlsStreams.get(streamId.toString());
                    if (!streamInfo) {
                        useObjectStorage = process.env.OBJECT_STORAGE_BUCKET ? true : false;
                        newStreamInfo = {
                            userId: userId,
                            streamId: streamId,
                            segments: [],
                            lastUpdated: new Date(),
                            startTime: new Date(),
                            duration: 0,
                            sequence: 0,
                            bandwidth: 800000, // Default bandwidth (800kbps)
                            useObjectStorage: useObjectStorage // Use object storage if available
                        };
                        streamInfo = newStreamInfo;
                        hlsStreams.set(streamId.toString(), streamInfo);
                        // If not using object storage, ensure local directory exists
                        if (!useObjectStorage) {
                            streamDir = path_1.default.join(HLS_TEMP_DIR, streamId.toString());
                            if (!fs_1.default.existsSync(streamDir)) {
                                fs_1.default.mkdirSync(streamDir, { recursive: true });
                            }
                        }
                        console.log("Created new HLS stream ".concat(streamId, " with ").concat(useObjectStorage ? 'object storage' : 'local storage'));
                    }
                    if (!(segment && streamInfo)) return [3 /*break*/, 8];
                    segmentIndex = streamInfo.segments.length;
                    segmentName = "segment_".concat(segmentIndex, ".ts");
                    segmentUrl = void 0;
                    if (!streamInfo.useObjectStorage) return [3 /*break*/, 3];
                    return [4 /*yield*/, object_storage_1.objectStorage.storeSegment(streamId, userId, segment, segmentIndex)];
                case 2:
                    // Store in object storage
                    segmentUrl = _a.sent();
                    // Add to segments list with the returned URL
                    streamInfo.segments.push(segmentUrl);
                    return [3 /*break*/, 4];
                case 3:
                    segmentPath = path_1.default.join(HLS_TEMP_DIR, streamId.toString(), segmentName);
                    fs_1.default.writeFileSync(segmentPath, segment);
                    // Add to segments list with just the filename for local storage
                    streamInfo.segments.push(segmentName);
                    _a.label = 4;
                case 4:
                    // Update stream info
                    streamInfo.lastUpdated = new Date();
                    streamInfo.duration += 6; // Assume each segment is ~6 seconds
                    streamInfo.sequence = Math.max(0, streamInfo.segments.length - 10); // Keep a sliding window
                    segmentSizeKbits = (segment.length * 8) / 1000;
                    segmentDurationSec = 6;
                    segmentBitrate = segmentSizeKbits / segmentDurationSec;
                    // Smooth bandwidth calculation (exponential moving average)
                    streamInfo.bandwidth = Math.round(0.7 * streamInfo.bandwidth + 0.3 * segmentBitrate * 1000);
                    // Update the map
                    hlsStreams.set(streamId.toString(), streamInfo);
                    if (!(stream && !stream.isLive)) return [3 /*break*/, 6];
                    return [4 /*yield*/, storage_1.storage.updateStream(streamId, { isLive: true })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (!streamInfo.useObjectStorage) return [3 /*break*/, 8];
                    return [4 /*yield*/, object_storage_1.objectStorage.updatePlaylist(streamId, streamInfo.segments)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    playlistUrl = void 0;
                    if (streamInfo.useObjectStorage) {
                        playlistUrl = "/stream-recordings/stream-".concat(streamId, "/playlist.m3u8");
                    }
                    else {
                        playlistUrl = "/hls/".concat(streamId, "/playlist.m3u8");
                    }
                    return [2 /*return*/, playlistUrl];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error creating/updating HLS playlist:', error_1);
                    throw error_1;
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Ends a stream's HLS playlist
 *
 * @returns An object with stream details and a flag indicating if a save prompt should be shown
 */
function endHLSStream(streamId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, streamInfo, useObjectStorage, recordingDetails, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, storage_1.storage.getStream(streamId)];
                case 1:
                    stream = _a.sent();
                    if (!stream) {
                        throw new Error("Stream ".concat(streamId, " not found"));
                    }
                    // Validate the user is the stream owner
                    if (stream.userId !== userId) {
                        throw new Error('Not authorized to end this stream');
                    }
                    streamInfo = hlsStreams.get(streamId.toString());
                    useObjectStorage = (streamInfo === null || streamInfo === void 0 ? void 0 : streamInfo.useObjectStorage) || false;
                    // Remove from active HLS streams
                    hlsStreams.delete(streamId.toString());
                    // Update stream in database
                    return [4 /*yield*/, storage_1.storage.updateStream(streamId, { isLive: false })];
                case 2:
                    // Update stream in database
                    _a.sent();
                    // If using object storage, we should prompt the user to save
                    if (useObjectStorage) {
                        recordingDetails = object_storage_1.objectStorage.getRecordingDetails(streamId);
                        if (recordingDetails) {
                            return [2 /*return*/, {
                                    success: true,
                                    showSavePrompt: true,
                                    temporaryUrl: "/stream-recordings/stream-".concat(streamId, "/playlist.m3u8"),
                                    message: 'Stream ended. The recording is temporarily available.'
                                }];
                        }
                    }
                    // Default response (local storage or no recording)
                    return [2 /*return*/, {
                            success: true,
                            showSavePrompt: false,
                            message: 'Stream ended.'
                        }];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error ending HLS stream:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Finalizes a stream recording - either saves it permanently or deletes it
 */
function finalizeStreamRecording(streamId, userId, savePermanently) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, result, recordingDetails, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, storage_1.storage.getStream(streamId)];
                case 1:
                    stream = _a.sent();
                    if (!stream) {
                        throw new Error("Stream ".concat(streamId, " not found"));
                    }
                    // Validate the user is the stream owner
                    if (stream.userId !== userId) {
                        throw new Error('Not authorized to manage this stream recording');
                    }
                    return [4 /*yield*/, object_storage_1.objectStorage.finalizeRecording(streamId, savePermanently)];
                case 2:
                    result = _a.sent();
                    if (result) {
                        if (savePermanently) {
                            recordingDetails = object_storage_1.objectStorage.getRecordingDetails(streamId);
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Stream recording saved permanently',
                                    permanentUrl: recordingDetails === null || recordingDetails === void 0 ? void 0 : recordingDetails.playlistUrl
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Stream recording deleted'
                                }];
                        }
                    }
                    else {
                        return [2 /*return*/, {
                                success: false,
                                message: 'Stream recording not found'
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error finalizing stream recording:', error_3);
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Serves the master playlist for a stream
 */
function handleMasterPlaylist(req, res) {
    var streamId = req.params.streamId;
    var streamInfo = hlsStreams.get(streamId);
    if (!streamInfo) {
        // If stream isn't live but exists in database, serve VOD playlist if available
        storage_1.storage.getStream(parseInt(streamId))
            .then(function (stream) {
            if (stream) {
                // Check if recorded playlist exists
                var vodPath = path_1.default.join(HLS_TEMP_DIR, streamId, 'vod.m3u8');
                if (fs_1.default.existsSync(vodPath)) {
                    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                    return res.status(200).send(fs_1.default.readFileSync(vodPath));
                }
                res.status(404).send('Stream is not currently live and no recording is available');
            }
            else {
                res.status(404).send('Stream not found');
            }
        })
            .catch(function (err) {
            console.error("Error checking stream ".concat(streamId, ":"), err);
            res.status(500).send('Server error');
        });
        return;
    }
    // Create master playlist with multiple bitrates if needed
    // For now, we'll use a simple single-bitrate playlist
    var playlist = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=".concat(streamInfo.bandwidth, ",RESOLUTION=1280x720\nplaylist.m3u8\n");
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(playlist);
}
/**
 * Serves the media playlist for a stream
 */
function handleMediaPlaylist(req, res) {
    var streamId = req.params.streamId;
    var streamInfo = hlsStreams.get(streamId);
    if (!streamInfo) {
        // Stream isn't live
        res.status(404).send('Stream is not currently live');
        return;
    }
    // Build the media playlist
    var playlist = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXT-X-MEDIA-SEQUENCE:".concat(streamInfo.sequence, "\n");
    // Include only the last 10 segments to keep playlist small
    var recentSegments = streamInfo.segments.slice(-10);
    // Add segment entries
    recentSegments.forEach(function (segment) {
        playlist += "#EXTINF:6.0,\n";
        playlist += "".concat(segment, "\n");
    });
    // Only add endlist tag if stream is explicitly ended
    if (!hlsStreams.has(streamId)) {
        playlist += "#EXT-X-ENDLIST\n";
    }
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(playlist);
}
/**
 * Serves a segment file
 */
function handleSegment(req, res) {
    var streamId = req.params.streamId;
    var segmentId = req.params.segment;
    // Validate segment name to prevent directory traversal
    if (!segmentId.match(/^segment_\d+\.ts$/)) {
        return res.status(400).send('Invalid segment name');
    }
    var segmentPath = path_1.default.join(HLS_TEMP_DIR, streamId, segmentId);
    if (!fs_1.default.existsSync(segmentPath)) {
        return res.status(404).send('Segment not found');
    }
    res.setHeader('Content-Type', 'video/MP2T');
    fs_1.default.createReadStream(segmentPath).pipe(res);
}
/**
 * Uploads a new segment for a stream
 */
function uploadSegment(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var streamId, userId, segmentBuffer, mimeType, playlistUrl, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!req.file) {
                        return [2 /*return*/, res.status(400).json({ error: 'No segment file provided' })];
                    }
                    streamId = parseInt(req.params.streamId);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ error: 'Authentication required' })];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    segmentBuffer = req.file.buffer;
                    mimeType = req.file.mimetype;
                    return [4 /*yield*/, createOrUpdateHLSPlaylist(streamId, userId, segmentBuffer, mimeType)];
                case 2:
                    playlistUrl = _b.sent();
                    res.status(200).json({
                        success: true,
                        playlistUrl: playlistUrl,
                        message: 'Segment uploaded successfully'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _b.sent();
                    console.error('Error uploading segment:', error_4);
                    res.status(500).json({ error: 'Failed to process segment' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Converts a WebRTC media stream chunk to an HLS segment
 * Note: In a production environment, you would use FFmpeg for this
 * Here we're creating a simplified version
 */
function processWebRTCChunk(streamId, userId, chunk) {
    return __awaiter(this, void 0, void 0, function () {
        var playlistUrl, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, createOrUpdateHLSPlaylist(streamId, userId, chunk, 'video/mp4')];
                case 1:
                    playlistUrl = _a.sent();
                    return [2 /*return*/, playlistUrl];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error processing WebRTC chunk:', error_5);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cleans up old HLS data
 * Should be called periodically or when server starts
 */
function cleanupHLSData(maxAgeHours) {
    if (maxAgeHours === void 0) { maxAgeHours = 24; }
    try {
        // Get all subdirectories in the HLS directory
        var dirs = fs_1.default.readdirSync(HLS_TEMP_DIR)
            .filter(function (file) { return fs_1.default.statSync(path_1.default.join(HLS_TEMP_DIR, file)).isDirectory(); });
        var now_1 = new Date();
        dirs.forEach(function (dir) {
            var dirPath = path_1.default.join(HLS_TEMP_DIR, dir);
            var stats = fs_1.default.statSync(dirPath);
            // Check if directory is older than maxAgeHours
            var ageHours = (now_1.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60);
            if (ageHours > maxAgeHours) {
                // Delete directory and all contents
                fs_1.default.rmdirSync(dirPath, { recursive: true });
                console.log("Cleaned up old HLS data for stream ".concat(dir));
            }
        });
    }
    catch (error) {
        console.error('Error cleaning up HLS data:', error);
    }
}
// Call cleanup on module import (when server starts)
cleanupHLSData();
// Export HLS streams info (for debugging)
function getHLSStreamsInfo() {
    var info = {};
    hlsStreams.forEach(function (value, key) {
        info[key] = __assign({}, value);
    });
    return info;
}
