"use strict";
/**
 * Object Storage Service for Stream Content
 *
 * Handles temporary and permanent storage of stream content in cloud object storage
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
exports.objectStorage = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// Default expiration time for temporary streams (24 hours)
var TEMP_EXPIRATION_HOURS = 24;
/**
 * Service to handle object storage operations for stream content
 * This class provides a unified interface for different storage backends
 */
var ObjectStorageService = /** @class */ (function () {
    function ObjectStorageService() {
        this.recordings = new Map();
        this.localStorageDir = path_1.default.join(process.cwd(), 'uploads', 'stream-recordings');
        this.bucketName = process.env.OBJECT_STORAGE_BUCKET || '';
        this.isConfigured = !!process.env.OBJECT_STORAGE_BUCKET;
        // Create local storage directory if it doesn't exist
        if (!fs_1.default.existsSync(this.localStorageDir)) {
            fs_1.default.mkdirSync(this.localStorageDir, { recursive: true });
        }
        console.log("Object Storage Service initialized. Using ".concat(this.isConfigured ? 'cloud object storage' : 'local storage', "."));
        if (this.isConfigured) {
            console.log("Bucket: ".concat(this.bucketName));
        }
        else {
            console.log("Local storage directory: ".concat(this.localStorageDir));
        }
    }
    /**
     * Store a stream segment (temporarily)
     * @param streamId The stream ID
     * @param userId The user ID
     * @param segmentData The segment data (buffer)
     * @param segmentIndex The segment index or name
     * @returns The URL to access the segment
     */
    ObjectStorageService.prototype.storeSegment = function (streamId, userId, segmentData, segmentIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var segmentFilename, streamDir, segmentPath, recording;
            return __generator(this, function (_a) {
                segmentFilename = "segment-".concat(segmentIndex, ".ts");
                streamDir = path_1.default.join(this.localStorageDir, "stream-".concat(streamId));
                // Create stream directory if it doesn't exist
                if (!fs_1.default.existsSync(streamDir)) {
                    fs_1.default.mkdirSync(streamDir, { recursive: true });
                }
                segmentPath = path_1.default.join(streamDir, segmentFilename);
                fs_1.default.writeFileSync(segmentPath, segmentData);
                recording = this.recordings.get(streamId);
                if (!recording) {
                    recording = {
                        streamId: streamId,
                        userId: userId,
                        segments: [],
                        playlistUrl: "/stream-recordings/stream-".concat(streamId, "/playlist.m3u8"),
                        createdAt: new Date(),
                        expiresAt: new Date(Date.now() + TEMP_EXPIRATION_HOURS * 60 * 60 * 1000),
                        size: 0,
                        duration: 0,
                        isTemporary: true
                    };
                    this.recordings.set(streamId, recording);
                }
                // Add segment to recording
                recording.segments.push(segmentFilename);
                recording.size += segmentData.length;
                recording.duration = Math.max(recording.duration, segmentIndex * 6); // Assuming 6s segments
                // If configured for cloud storage, upload to object storage bucket
                if (this.isConfigured) {
                    try {
                        // This would use an SDK for your cloud provider
                        // For example, AWS S3, Google Cloud Storage, etc.
                        // await this.uploadToBucket(segmentPath, `stream-${streamId}/${segmentFilename}`);
                        console.log("[ObjectStorage] Would upload ".concat(segmentFilename, " to cloud storage"));
                    }
                    catch (error) {
                        console.error('Error uploading to object storage:', error);
                        // Fall back to local storage if upload fails
                    }
                }
                // Return the URL to access the segment (this would be a cloud URL if available)
                return [2 /*return*/, "/stream-recordings/stream-".concat(streamId, "/").concat(segmentFilename)];
            });
        });
    };
    /**
     * Create or update a playlist file for a stream
     * @param streamId The stream ID
     * @param segments List of segment filenames
     * @returns The URL to access the playlist
     */
    ObjectStorageService.prototype.updatePlaylist = function (streamId, segments) {
        return __awaiter(this, void 0, void 0, function () {
            var streamDir, playlistPath, playlistContent, recentSegments, _i, recentSegments_1, segment;
            return __generator(this, function (_a) {
                streamDir = path_1.default.join(this.localStorageDir, "stream-".concat(streamId));
                playlistPath = path_1.default.join(streamDir, 'playlist.m3u8');
                playlistContent = '#EXTM3U\n';
                playlistContent += '#EXT-X-VERSION:3\n';
                playlistContent += '#EXT-X-TARGETDURATION:6\n'; // Assuming 6-second segments
                playlistContent += "#EXT-X-MEDIA-SEQUENCE:".concat(segments.length > 10 ? segments.length - 10 : 0, "\n");
                recentSegments = segments.slice(-10);
                for (_i = 0, recentSegments_1 = recentSegments; _i < recentSegments_1.length; _i++) {
                    segment = recentSegments_1[_i];
                    playlistContent += '#EXTINF:6.0,\n'; // Duration
                    playlistContent += segment + '\n';
                }
                // Write playlist to file
                fs_1.default.writeFileSync(playlistPath, playlistContent);
                // If configured for cloud storage, upload playlist to bucket
                if (this.isConfigured) {
                    try {
                        // await this.uploadToBucket(playlistPath, `stream-${streamId}/playlist.m3u8`);
                        console.log("[ObjectStorage] Would upload playlist.m3u8 to cloud storage");
                    }
                    catch (error) {
                        console.error('Error uploading playlist to object storage:', error);
                    }
                }
                // Return the URL to access the playlist
                return [2 /*return*/, "/stream-recordings/stream-".concat(streamId, "/playlist.m3u8")];
            });
        });
    };
    /**
     * Ask the user if they want to save or delete a stream recording
     * @param streamId The stream ID to finalize
     * @param permanent Whether to make the recording permanent (true) or delete it (false)
     */
    ObjectStorageService.prototype.finalizeRecording = function (streamId, permanent) {
        return __awaiter(this, void 0, void 0, function () {
            var recording, streamDir;
            return __generator(this, function (_a) {
                recording = this.recordings.get(streamId);
                if (!recording) {
                    return [2 /*return*/, false];
                }
                if (permanent) {
                    // Make the recording permanent
                    recording.isTemporary = false;
                    recording.expiresAt = undefined;
                    // Update the recording in the map
                    this.recordings.set(streamId, recording);
                    console.log("[ObjectStorage] Stream ".concat(streamId, " saved permanently"));
                    // Store the recording metadata in a database or storage
                    // In a real implementation, you would persist this data
                    return [2 /*return*/, true];
                }
                else {
                    streamDir = path_1.default.join(this.localStorageDir, "stream-".concat(streamId));
                    // Remove from cloud storage if configured
                    if (this.isConfigured) {
                        try {
                            // Implement deletion from cloud storage
                            console.log("[ObjectStorage] Would delete stream ".concat(streamId, " from cloud storage"));
                        }
                        catch (error) {
                            console.error('Error deleting from object storage:', error);
                        }
                    }
                    // Delete local files
                    try {
                        if (fs_1.default.existsSync(streamDir)) {
                            // Delete recursively
                            fs_1.default.rmSync(streamDir, { recursive: true, force: true });
                        }
                    }
                    catch (error) {
                        console.error('Error deleting local recording:', error);
                    }
                    // Remove from our recordings map
                    this.recordings.delete(streamId);
                    console.log("[ObjectStorage] Stream ".concat(streamId, " deleted"));
                    return [2 /*return*/, true];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get details about a stream recording
     * @param streamId The stream ID
     */
    ObjectStorageService.prototype.getRecordingDetails = function (streamId) {
        return this.recordings.get(streamId) || null;
    };
    /**
     * Serve static content from the object storage
     * This is a middleware function to serve stream recordings
     */
    ObjectStorageService.prototype.serveContent = function (req, res, next) {
        var urlPath = req.path;
        // Check if the request is for a stream recording
        if (urlPath.startsWith('/stream-recordings/')) {
            // Extract stream ID and file name from path
            var match = urlPath.match(/\/stream-recordings\/stream-(\d+)\/(.+)/);
            if (!match) {
                return res.status(404).send('Not found');
            }
            var streamId = parseInt(match[1]);
            var fileName = match[2];
            // Check if we have this recording
            var recording = this.recordings.get(streamId);
            if (!recording) {
                return res.status(404).send('Stream recording not found');
            }
            // If file is expired and temporary, reject
            if (recording.isTemporary && recording.expiresAt && recording.expiresAt < new Date()) {
                return res.status(410).send('Stream recording has expired');
            }
            // Determine file path
            var filePath = path_1.default.join(this.localStorageDir, "stream-".concat(streamId), fileName);
            // Check if file exists locally
            if (fs_1.default.existsSync(filePath)) {
                // Set appropriate content type
                if (fileName.endsWith('.m3u8')) {
                    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                }
                else if (fileName.endsWith('.ts')) {
                    res.setHeader('Content-Type', 'video/mp2t');
                }
                // Stream the file
                var fileStream = fs_1.default.createReadStream(filePath);
                fileStream.pipe(res);
            }
            else if (this.isConfigured) {
                // If not found locally but we have cloud storage, redirect to cloud URL
                // In a real implementation, generate a signed URL or proxy the content
                // For now, just return a 404
                return res.status(404).send('File not found');
            }
            else {
                return res.status(404).send('File not found');
            }
        }
        else {
            // Not a stream recording request, continue to next middleware
            next();
        }
    };
    /**
     * Clean up expired temporary recordings
     * Call this periodically to free up storage space
     */
    ObjectStorageService.prototype.cleanupExpiredRecordings = function () {
        var now = new Date();
        var cleanedCount = 0;
        // Find expired recordings
        for (var _i = 0, _a = this.recordings.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], streamId = _b[0], recording = _b[1];
            if (recording.isTemporary && recording.expiresAt && recording.expiresAt < now) {
                // Delete the recording
                this.finalizeRecording(streamId, false);
                cleanedCount++;
            }
        }
        return cleanedCount;
    };
    return ObjectStorageService;
}());
// Create singleton instance
exports.objectStorage = new ObjectStorageService();
