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
exports.storage = exports.MemStorage = void 0;
var schema_js_1 = require("../shared/schema.js");
var express_session_1 = __importDefault(require("express-session"));
var memorystore_1 = __importDefault(require("memorystore"));
var MemoryStore = (0, memorystore_1.default)(express_session_1.default);
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.users = new Map();
        this.userSettings = new Map();
        this.streams = new Map();
        this.tracks = new Map();
        this.posts = new Map();
        this.genres = new Map();
        this.follows = new Map();
        this.likes = new Map();
        this.comments = new Map();
        this.userId = 1;
        this.userSettingsId = 1;
        this.streamId = 1;
        this.trackId = 1;
        this.postId = 1;
        this.genreId = 1;
        this.followId = 1;
        this.likeId = 1;
        this.commentId = 1;
        // Create memory session store
        this.sessionStore = new MemoryStore({
            checkPeriod: 86400000 // prune expired entries every 24h
        });
        // Production mode - no seed data
        // this.seedData();
    }
    // Users
    MemStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).find(function (user) { return user.username === username; })];
            });
        });
    };
    MemStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).find(function (user) { return user.email === email; })];
            });
        });
    };
    MemStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user;
            return __generator(this, function (_a) {
                id = this.userId++;
                user = __assign(__assign({}, insertUser), { id: id, isStreaming: false, followerCount: 0, createdAt: new Date() });
                this.users.set(id, user);
                return [2 /*return*/, user];
            });
        });
    };
    MemStorage.prototype.updateUser = function (id, userData) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, password, safeData, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUser(id)];
                    case 1:
                        existingUser = _a.sent();
                        if (!existingUser) {
                            throw new Error("User with ID ".concat(id, " not found"));
                        }
                        password = userData.password, safeData = __rest(userData, ["password"]);
                        updatedUser = __assign(__assign({}, existingUser), safeData);
                        this.users.set(id, updatedUser);
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    MemStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values())];
            });
        });
    };
    MemStorage.prototype.incrementFollowerCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = this.users.get(userId);
                if (user) {
                    user.followerCount += 1;
                    this.users.set(userId, user);
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.decrementFollowerCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = this.users.get(userId);
                if (user && user.followerCount > 0) {
                    user.followerCount -= 1;
                    this.users.set(userId, user);
                }
                return [2 /*return*/];
            });
        });
    };
    // User Settings
    MemStorage.prototype.getUserSettings = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.userSettings.values()).find(function (settings) { return settings.userId === userId; })];
            });
        });
    };
    MemStorage.prototype.createUserSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userSettings;
            return __generator(this, function (_a) {
                id = this.userSettingsId++;
                userSettings = __assign(__assign({}, settings), { id: id, createdAt: new Date(), updatedAt: new Date() });
                this.userSettings.set(id, userSettings);
                return [2 /*return*/, userSettings];
            });
        });
    };
    MemStorage.prototype.updateUserSettings = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var existingSettings, updatedSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserSettings(userId)];
                    case 1:
                        existingSettings = _a.sent();
                        if (!existingSettings) {
                            // If no settings exist, create new ones with defaults plus updates
                            return [2 /*return*/, this.createUserSettings({
                                    userId: userId,
                                    uiColor: settings.uiColor || "#8B5CF6",
                                    enableAutoplay: settings.enableAutoplay !== undefined ? settings.enableAutoplay : true,
                                    defaultSortType: settings.defaultSortType || "recent"
                                })];
                        }
                        updatedSettings = __assign(__assign(__assign({}, existingSettings), settings), { updatedAt: new Date() });
                        this.userSettings.set(existingSettings.id, updatedSettings);
                        return [2 /*return*/, updatedSettings];
                }
            });
        });
    };
    // Posts
    MemStorage.prototype.getPost = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.posts.get(id)];
            });
        });
    };
    MemStorage.prototype.getRecentPosts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.posts.values())
                        .sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })
                        .slice(0, 10)];
            });
        });
    };
    MemStorage.prototype.getPostsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.posts.values())
                        .filter(function (post) { return post.userId === userId; })
                        .sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })];
            });
        });
    };
    MemStorage.prototype.createPost = function (insertPost) {
        return __awaiter(this, void 0, void 0, function () {
            var id, postType, tags, post;
            return __generator(this, function (_a) {
                id = this.postId++;
                postType = insertPost.postType === schema_js_1.PostType.IMAGE ?
                    schema_js_1.PostType.IMAGE : schema_js_1.PostType.TEXT;
                tags = Array.isArray(insertPost.tags) ?
                    insertPost.tags :
                    (insertPost.tags ? [insertPost.tags] : []);
                post = __assign(__assign({}, insertPost), { id: id, likeCount: 0, commentCount: 0, tags: tags, postType: postType, imageUrl: insertPost.imageUrl || null, createdAt: new Date(), updatedAt: new Date() });
                this.posts.set(id, post);
                return [2 /*return*/, post];
            });
        });
    };
    MemStorage.prototype.deletePost = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var post, likesToRemove, commentsToRemove;
            var _this = this;
            return __generator(this, function (_a) {
                post = this.posts.get(id);
                if (!post) {
                    return [2 /*return*/, false];
                }
                likesToRemove = Array.from(this.likes.values())
                    .filter(function (like) { return like.contentId === id && like.contentType === 'post'; })
                    .map(function (like) { return like.id; });
                likesToRemove.forEach(function (likeId) { return _this.likes.delete(likeId); });
                commentsToRemove = Array.from(this.comments.values())
                    .filter(function (comment) { return comment.contentId === id && comment.contentType === 'post'; })
                    .map(function (comment) { return comment.id; });
                commentsToRemove.forEach(function (commentId) { return _this.comments.delete(commentId); });
                // Delete the post
                this.posts.delete(id);
                return [2 /*return*/, true];
            });
        });
    };
    // Streams
    MemStorage.prototype.getStream = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.streams.get(id)];
            });
        });
    };
    MemStorage.prototype.getFeaturedStreams = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.streams.values())
                        .filter(function (stream) { return stream.isLive; })
                        .sort(function (a, b) { return b.viewerCount - a.viewerCount; })
                        .slice(0, 6)];
            });
        });
    };
    MemStorage.prototype.getStreamsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.streams.values())
                        .filter(function (stream) { return stream.userId === userId; })
                        .sort(function (a, b) { return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(); })];
            });
        });
    };
    MemStorage.prototype.getActiveStreamsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.streams.values())
                        .filter(function (stream) { return stream.userId === userId && stream.isLive === true; })];
            });
        });
    };
    MemStorage.prototype.getAllStreams = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.streams.values())];
            });
        });
    };
    MemStorage.prototype.createStream = function (insertStream) {
        return __awaiter(this, void 0, void 0, function () {
            var id, stream, user;
            return __generator(this, function (_a) {
                id = this.streamId++;
                stream = __assign(__assign({}, insertStream), { id: id, isLive: true, viewerCount: 0, startedAt: new Date(), endedAt: null, description: insertStream.description || null, thumbnailUrl: insertStream.thumbnailUrl || null, category: insertStream.category || null, tags: insertStream.tags || null });
                this.streams.set(id, stream);
                user = this.users.get(stream.userId);
                if (user) {
                    user.isStreaming = true;
                    this.users.set(user.id, user);
                }
                return [2 /*return*/, stream];
            });
        });
    };
    MemStorage.prototype.updateStream = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var stream, updatedStream, user;
            return __generator(this, function (_a) {
                stream = this.streams.get(id);
                if (!stream) {
                    return [2 /*return*/, undefined];
                }
                updatedStream = __assign(__assign({}, stream), data);
                this.streams.set(id, updatedStream);
                // If stream is no longer live, update the user streaming status
                if (data.isLive === false) {
                    user = this.users.get(stream.userId);
                    if (user) {
                        user.isStreaming = false;
                        this.users.set(user.id, user);
                    }
                }
                return [2 /*return*/, updatedStream];
            });
        });
    };
    MemStorage.prototype.updateStreamViewerCount = function (id, count) {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                stream = this.streams.get(id);
                if (stream) {
                    stream.viewerCount = count;
                    this.streams.set(id, stream);
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.deleteStream = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var stream, user;
            return __generator(this, function (_a) {
                stream = this.streams.get(id);
                if (!stream) {
                    return [2 /*return*/, false];
                }
                // Update user streaming status if needed
                if (stream.isLive) {
                    user = this.users.get(stream.userId);
                    if (user) {
                        user.isStreaming = false;
                        this.users.set(user.id, user);
                    }
                }
                this.streams.delete(id);
                return [2 /*return*/, true];
            });
        });
    };
    // Tracks
    MemStorage.prototype.getTrack = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.tracks.get(id)];
            });
        });
    };
    MemStorage.prototype.getRecentTracks = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.tracks.values())
                        .sort(function (a, b) { return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(); })
                        .slice(0, 10)];
            });
        });
    };
    MemStorage.prototype.getTracksByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.tracks.values())
                        .filter(function (track) { return track.userId === userId; })
                        .sort(function (a, b) { return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(); })];
            });
        });
    };
    MemStorage.prototype.createTrack = function (insertTrack) {
        return __awaiter(this, void 0, void 0, function () {
            var id, track;
            return __generator(this, function (_a) {
                id = this.trackId++;
                track = __assign(__assign({}, insertTrack), { id: id, playCount: 0, likeCount: 0, uploadedAt: new Date() });
                this.tracks.set(id, track);
                return [2 /*return*/, track];
            });
        });
    };
    // Genres
    MemStorage.prototype.getGenres = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.genres.values())];
            });
        });
    };
    MemStorage.prototype.createGenre = function (insertGenre) {
        return __awaiter(this, void 0, void 0, function () {
            var id, genre;
            return __generator(this, function (_a) {
                id = this.genreId++;
                genre = __assign(__assign({}, insertGenre), { id: id });
                this.genres.set(id, genre);
                return [2 /*return*/, genre];
            });
        });
    };
    // Follows
    MemStorage.prototype.createFollow = function (insertFollow) {
        return __awaiter(this, void 0, void 0, function () {
            var id, follow;
            return __generator(this, function (_a) {
                id = this.followId++;
                follow = __assign(__assign({}, insertFollow), { id: id });
                this.follows.set(id, follow);
                return [2 /*return*/, follow];
            });
        });
    };
    MemStorage.prototype.removeFollow = function (followerId, followedId) {
        return __awaiter(this, void 0, void 0, function () {
            var followToRemove;
            return __generator(this, function (_a) {
                followToRemove = Array.from(this.follows.values()).find(function (f) { return f.followerId === followerId && f.followedId === followedId; });
                if (followToRemove) {
                    this.follows.delete(followToRemove.id);
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.isFollowing = function (followerId, followedId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.follows.values()).some(function (f) { return f.followerId === followerId && f.followedId === followedId; })];
            });
        });
    };
    MemStorage.prototype.getFollowers = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var followerIds;
            var _this = this;
            return __generator(this, function (_a) {
                followerIds = Array.from(this.follows.values())
                    .filter(function (f) { return f.followedId === userId; })
                    .map(function (f) { return f.followerId; });
                return [2 /*return*/, Promise.all(followerIds.map(function (id) { return _this.getUser(id); }))
                        .then(function (users) { return users.filter(Boolean); })];
            });
        });
    };
    MemStorage.prototype.getFollowing = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var followingIds;
            var _this = this;
            return __generator(this, function (_a) {
                followingIds = Array.from(this.follows.values())
                    .filter(function (f) { return f.followerId === userId; })
                    .map(function (f) { return f.followedId; });
                return [2 /*return*/, Promise.all(followingIds.map(function (id) { return _this.getUser(id); }))
                        .then(function (users) { return users.filter(Boolean); })];
            });
        });
    };
    // Likes
    MemStorage.prototype.createLike = function (insertLike) {
        return __awaiter(this, void 0, void 0, function () {
            var id, like, track, post;
            return __generator(this, function (_a) {
                id = this.likeId++;
                like = __assign(__assign({}, insertLike), { id: id, createdAt: new Date() });
                this.likes.set(id, like);
                // Update like count on the content
                if (insertLike.contentType === 'track') {
                    track = this.tracks.get(insertLike.contentId);
                    if (track) {
                        track.likeCount += 1;
                        this.tracks.set(track.id, track);
                    }
                }
                else if (insertLike.contentType === 'post') {
                    post = this.posts.get(insertLike.contentId);
                    if (post) {
                        post.likeCount += 1;
                        this.posts.set(post.id, post);
                    }
                }
                return [2 /*return*/, like];
            });
        });
    };
    MemStorage.prototype.removeLike = function (userId, contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var likeToRemove, track, post;
            return __generator(this, function (_a) {
                likeToRemove = Array.from(this.likes.values()).find(function (l) { return l.userId === userId && l.contentId === contentId && l.contentType === contentType; });
                if (likeToRemove) {
                    this.likes.delete(likeToRemove.id);
                    // Update like count on the content
                    if (contentType === 'track') {
                        track = this.tracks.get(contentId);
                        if (track && track.likeCount > 0) {
                            track.likeCount -= 1;
                            this.tracks.set(track.id, track);
                        }
                    }
                    else if (contentType === 'post') {
                        post = this.posts.get(contentId);
                        if (post && post.likeCount > 0) {
                            post.likeCount -= 1;
                            this.posts.set(post.id, post);
                        }
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.isLiked = function (userId, contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.likes.values()).some(function (l) { return l.userId === userId && l.contentId === contentId && l.contentType === contentType; })];
            });
        });
    };
    MemStorage.prototype.getLikeCount = function (contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.likes.values()).filter(function (l) { return l.contentId === contentId && l.contentType === contentType; }).length];
            });
        });
    };
    MemStorage.prototype.getUserLikes = function (userId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.likes.values())
                        .filter(function (l) { return l.userId === userId && l.contentType === contentType; })
                        .map(function (l) { return l.contentId; })];
            });
        });
    };
    // Comments
    MemStorage.prototype.getComment = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.comments.get(id)];
            });
        });
    };
    MemStorage.prototype.createComment = function (insertComment) {
        return __awaiter(this, void 0, void 0, function () {
            var id, comment, track, post;
            return __generator(this, function (_a) {
                id = this.commentId++;
                comment = __assign(__assign({}, insertComment), { id: id, createdAt: new Date(), updatedAt: new Date(), likeCount: 0 });
                this.comments.set(id, comment);
                // Update comment count on the content
                if (insertComment.contentType === 'track') {
                    track = this.tracks.get(insertComment.contentId);
                    if (track) {
                        // Ensure track has commentCount property or add it
                        if (!('commentCount' in track)) {
                            track.commentCount = 0;
                        }
                        track.commentCount += 1;
                        this.tracks.set(track.id, track);
                    }
                }
                else if (insertComment.contentType === 'post') {
                    post = this.posts.get(insertComment.contentId);
                    if (post) {
                        post.commentCount += 1;
                        this.posts.set(post.id, post);
                    }
                }
                return [2 /*return*/, comment];
            });
        });
    };
    MemStorage.prototype.updateComment = function (id, text) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, updatedComment;
            return __generator(this, function (_a) {
                comment = this.comments.get(id);
                if (!comment) {
                    return [2 /*return*/, undefined];
                }
                updatedComment = __assign(__assign({}, comment), { text: text, updatedAt: new Date() });
                this.comments.set(id, updatedComment);
                return [2 /*return*/, updatedComment];
            });
        });
    };
    MemStorage.prototype.deleteComment = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, track, post;
            return __generator(this, function (_a) {
                comment = this.comments.get(id);
                if (comment) {
                    this.comments.delete(id);
                    // Update comment count on the content
                    if (comment.contentType === 'track') {
                        track = this.tracks.get(comment.contentId);
                        if (track && track.commentCount > 0) {
                            track.commentCount -= 1;
                            this.tracks.set(track.id, track);
                        }
                    }
                    else if (comment.contentType === 'post') {
                        post = this.posts.get(comment.contentId);
                        if (post && post.commentCount > 0) {
                            post.commentCount -= 1;
                            this.posts.set(post.id, post);
                        }
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.getCommentsByContent = function (contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.comments.values())
                        .filter(function (c) { return c.contentId === contentId && c.contentType === contentType && !c.parentId; })
                        .sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })];
            });
        });
    };
    MemStorage.prototype.getReplies = function (commentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.comments.values())
                        .filter(function (c) { return c.parentId === commentId; })
                        .sort(function (a, b) { return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); })];
            });
        });
    };
    // Track play count
    MemStorage.prototype.incrementTrackPlayCount = function (trackId) {
        return __awaiter(this, void 0, void 0, function () {
            var track;
            return __generator(this, function (_a) {
                track = this.tracks.get(trackId);
                if (track) {
                    track.playCount += 1;
                    this.tracks.set(trackId, track);
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.deleteTrack = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var track, likesToRemove, commentsToRemove;
            var _this = this;
            return __generator(this, function (_a) {
                track = this.tracks.get(id);
                if (!track) {
                    return [2 /*return*/, false];
                }
                this.tracks.delete(id);
                likesToRemove = Array.from(this.likes.values())
                    .filter(function (like) { return like.contentId === id && like.contentType === 'track'; })
                    .map(function (like) { return like.id; });
                likesToRemove.forEach(function (likeId) { return _this.likes.delete(likeId); });
                commentsToRemove = Array.from(this.comments.values())
                    .filter(function (comment) { return comment.contentId === id && comment.contentType === 'track'; })
                    .map(function (comment) { return comment.id; });
                commentsToRemove.forEach(function (commentId) { return _this.comments.delete(commentId); });
                return [2 /*return*/, true];
            });
        });
    };
    // Creators
    MemStorage.prototype.getRecommendedCreators = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values())
                        .sort(function (a, b) { return b.followerCount - a.followerCount; })
                        .slice(0, 10)];
            });
        });
    };
    // Search functionality
    MemStorage.prototype.searchTracks = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowercaseQuery;
            return __generator(this, function (_a) {
                lowercaseQuery = query.toLowerCase();
                return [2 /*return*/, Array.from(this.tracks.values())
                        .filter(function (track) {
                        return track.title.toLowerCase().includes(lowercaseQuery) ||
                            track.artistName.toLowerCase().includes(lowercaseQuery) ||
                            (track.genre && track.genre.toLowerCase().includes(lowercaseQuery));
                    })
                        .slice(0, 10)];
            });
        });
    };
    MemStorage.prototype.searchUsers = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowercaseQuery;
            return __generator(this, function (_a) {
                lowercaseQuery = query.toLowerCase();
                return [2 /*return*/, Array.from(this.users.values())
                        .filter(function (user) {
                        return user.username.toLowerCase().includes(lowercaseQuery) ||
                            (user.displayName && user.displayName.toLowerCase().includes(lowercaseQuery)) ||
                            (user.bio && user.bio.toLowerCase().includes(lowercaseQuery));
                    })
                        .slice(0, 10)];
            });
        });
    };
    MemStorage.prototype.searchStreams = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowercaseQuery;
            return __generator(this, function (_a) {
                lowercaseQuery = query.toLowerCase();
                return [2 /*return*/, Array.from(this.streams.values())
                        .filter(function (stream) {
                        return stream.title.toLowerCase().includes(lowercaseQuery) ||
                            (stream.description && stream.description.toLowerCase().includes(lowercaseQuery)) ||
                            (stream.category && stream.category.toLowerCase().includes(lowercaseQuery));
                    })
                        .slice(0, 10)];
            });
        });
    };
    MemStorage.prototype.searchPosts = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowercaseQuery;
            return __generator(this, function (_a) {
                lowercaseQuery = query.toLowerCase();
                return [2 /*return*/, Array.from(this.posts.values())
                        .filter(function (post) {
                        return post.title.toLowerCase().includes(lowercaseQuery) ||
                            post.content.toLowerCase().includes(lowercaseQuery) ||
                            (post.tags && post.tags.some(function (tag) { return tag.toLowerCase().includes(lowercaseQuery); }));
                    })
                        .slice(0, 10)];
            });
        });
    };
    // Analytics
    MemStorage.prototype.saveAnalyticsEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In-memory implementation - in a real app this would save to a database
                console.log('Analytics event:', event);
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.getUserAnalytics = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Simplified analytics data
                return [2 /*return*/, {
                        playCount: Array.from(this.tracks.values())
                            .filter(function (track) { return track.userId === userId; })
                            .reduce(function (sum, track) { return sum + track.playCount; }, 0),
                        totalLikes: Array.from(this.likes.values())
                            .filter(function (like) {
                            var _a;
                            return like.contentType === 'track' &&
                                ((_a = _this.tracks.get(like.contentId)) === null || _a === void 0 ? void 0 : _a.userId) === userId;
                        }).length
                    }];
            });
        });
    };
    // Notifications
    MemStorage.prototype.getUserNotifications = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simplified notifications implementation
                return [2 /*return*/, []];
            });
        });
    };
    // Seed data (empty for production)
    MemStorage.prototype.seedData = function () {
        var _this = this;
        // For production, we don't include any seed data
        // Common genres that can be added by users or admins later
        var defaultGenres = [
            "Electronic", "Hip Hop", "Lo-Fi", "House", "Indie", "Techno", "Trap", "Ambient", "Jazz", "R&B"
        ];
        // Add default genres only if needed
        if (process.env.SEED_DEFAULT_GENRES === 'true') {
            defaultGenres.forEach(function (name) {
                var id = _this.genreId++;
                _this.genres.set(id, { id: id, name: name });
            });
        }
    };
    return MemStorage;
}());
exports.MemStorage = MemStorage;
// Import our database storage implementation
var database_storage_js_1 = require("./database-storage.js");
// Choose which storage to use based on environment
var useDatabase = true; // Set to true to use database storage, false for memory storage
exports.storage = useDatabase ? new database_storage_js_1.DatabaseStorage() : new MemStorage();
