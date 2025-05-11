"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.DatabaseStorage = void 0;
var schema_js_1 = require("../shared/schema.js");
var express_session_1 = __importDefault(require("express-session"));
var db_js_1 = require("./db.js");
var drizzle_orm_1 = require("drizzle-orm");
var connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
// Create the session store
var PostgresSessionStore = (0, connect_pg_simple_1.default)(express_session_1.default);
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
        // Create a PostgreSQL-backed session store using the connection from env var
        var connectionString = process.env.DATABASE_URL || '';
        var dbConfig = { connectionString: connectionString };
        this.sessionStore = new PostgresSessionStore({
            conObject: dbConfig,
            createTableIfMissing: true,
            tableName: 'session'
        });
        // Run the database migration if needed
        this.initializeDatabase();
    }
    DatabaseStorage.prototype.initializeDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingUsers, defaultGenres, _i, defaultGenres_1, name_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).limit(1)];
                    case 1:
                        existingUsers = _a.sent();
                        if (!(existingUsers.length === 0)) return [3 /*break*/, 6];
                        console.log("Initializing database with default data...");
                        defaultGenres = [
                            "Electronic", "Hip Hop", "Lo-Fi", "House", "Indie",
                            "Techno", "Trap", "Ambient", "Jazz", "R&B"
                        ];
                        _i = 0, defaultGenres_1 = defaultGenres;
                        _a.label = 2;
                    case 2:
                        if (!(_i < defaultGenres_1.length)) return [3 /*break*/, 5];
                        name_1 = defaultGenres_1[_i];
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.genres).values({ name: name_1 }).onConflictDoNothing()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // Initialize with just genres, no demo users or content
                        console.log("Database initialized with default genres only.");
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error("Error initializing database:", error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Users
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.users).values(user).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUser = function (id, userData) {
        return __awaiter(this, void 0, void 0, function () {
            var password, safeData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = userData.password, safeData = __rest(userData, ["password"]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users)
                                .set(safeData)
                                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id))
                                .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.incrementFollowerCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users)
                                .set({
                                followerCount: (user.followerCount || 0) + 1
                            })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.decrementFollowerCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        user = _a.sent();
                        if (!(user && user.followerCount && user.followerCount > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users)
                                .set({ followerCount: user.followerCount - 1 })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // User Settings
    DatabaseStorage.prototype.getUserSettings = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.userSettings).where((0, drizzle_orm_1.eq)(schema_js_1.userSettings.userId, userId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUserSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.userSettings).values(settings).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUserSettings = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserSettings(userId)];
                    case 1:
                        existing = _a.sent();
                        if (!existing) {
                            // If no settings exist, create new ones with defaults plus updates
                            return [2 /*return*/, this.createUserSettings({
                                    userId: userId,
                                    uiColor: settings.uiColor || "#8B5CF6",
                                    enableAutoplay: settings.enableAutoplay !== undefined ? settings.enableAutoplay : true,
                                    defaultSortType: settings.defaultSortType || "recent",
                                    highContrastMode: settings.highContrastMode !== undefined ? settings.highContrastMode : false
                                })];
                        }
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.userSettings)
                                .set(__assign(__assign({}, settings), { updatedAt: new Date() }))
                                .where((0, drizzle_orm_1.eq)(schema_js_1.userSettings.userId, userId))
                                .returning()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    // Posts
    DatabaseStorage.prototype.getPost = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.posts).where((0, drizzle_orm_1.eq)(schema_js_1.posts.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.getRecentPosts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.posts).orderBy((0, drizzle_orm_1.desc)(schema_js_1.posts.createdAt)).limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getPostsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.posts)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.posts.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.posts.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createPost = function (post) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.posts)
                            .values({
                            userId: post.userId,
                            title: post.title,
                            content: post.content,
                            // Let the database handle defaults for the rest
                        })
                            .returning()];
                    case 1:
                        result = _a.sent();
                        // Return created post
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.deletePost = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // First, delete associated likes
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.likes)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.likes.contentId, id), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentType, 'post')))];
                    case 1:
                        // First, delete associated likes
                        _a.sent();
                        // Delete associated comments
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.comments)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.comments.contentId, id), (0, drizzle_orm_1.eq)(schema_js_1.comments.contentType, 'post')))];
                    case 2:
                        // Delete associated comments
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.posts)
                                .where((0, drizzle_orm_1.eq)(schema_js_1.posts.id, id))
                                .returning()];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error deleting post:', error_2);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Streams
    DatabaseStorage.prototype.getStream = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select()
                            .from(schema_js_1.streams)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.streams.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.getFeaturedStreams = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select()
                            .from(schema_js_1.streams)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.streams.isLive, true))
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.streams.viewerCount))
                            .limit(6)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getStreamsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select()
                            .from(schema_js_1.streams)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.streams.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.streams.startedAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveStreamsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select()
                            .from(schema_js_1.streams)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.streams.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.streams.isLive, true)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllStreams = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select()
                            .from(schema_js_1.streams)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createStream = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.streams)
                            .values(__assign(__assign({}, stream), { isLive: true, viewerCount: 0, startedAt: new Date() }))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        // Update user streaming status
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users)
                                .set({ isStreaming: true })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, stream.userId))];
                    case 2:
                        // Update user streaming status
                        _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateStream = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.update(schema_js_1.streams)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.streams.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        if (!(data.isLive === false)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getStream(id)];
                    case 2:
                        stream = _a.sent();
                        if (!stream) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users)
                                .set({ isStreaming: false })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, stream.userId))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateStreamViewerCount = function (id, count) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.update(schema_js_1.streams)
                            .set({ viewerCount: count })
                            .where((0, drizzle_orm_1.eq)(schema_js_1.streams.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteStream = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, stream, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.streams)
                                .where((0, drizzle_orm_1.eq)(schema_js_1.streams.id, id))
                                .returning()];
                    case 1:
                        result = _a.sent();
                        if (!(result.length > 0 && result[0].isLive)) return [3 /*break*/, 3];
                        stream = result[0];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users)
                                .set({ isStreaming: false })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, stream.userId))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, result.length > 0];
                    case 4:
                        error_3 = _a.sent();
                        console.error('Error deleting stream:', error_3);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Tracks
    DatabaseStorage.prototype.getTrack = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.tracks).where((0, drizzle_orm_1.eq)(schema_js_1.tracks.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.getRecentTracks = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.tracks)
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.tracks.uploadedAt))
                            .limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTracksByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.tracks)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.tracks.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.tracks.uploadedAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTrack = function (track) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.tracks)
                            .values(__assign(__assign({}, track), { playCount: 0, likeCount: 0, uploadedAt: new Date() }))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    // Genres
    DatabaseStorage.prototype.getGenres = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.genres)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createGenre = function (genre) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.genres)
                            .values(genre)
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    // Follows
    DatabaseStorage.prototype.createFollow = function (follow) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.follows)
                            .values(follow)
                            .returning()];
                    case 1:
                        result = _a.sent();
                        // Increment follower count
                        return [4 /*yield*/, this.incrementFollowerCount(follow.followedId)];
                    case 2:
                        // Increment follower count
                        _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.removeFollow = function (followerId, followedId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.delete(schema_js_1.follows)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.follows.followerId, followerId), (0, drizzle_orm_1.eq)(schema_js_1.follows.followedId, followedId)))];
                    case 1:
                        _a.sent();
                        // Decrement follower count
                        return [4 /*yield*/, this.decrementFollowerCount(followedId)];
                    case 2:
                        // Decrement follower count
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.isFollowing = function (followerId, followedId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.follows)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.follows.followerId, followerId), (0, drizzle_orm_1.eq)(schema_js_1.follows.followedId, followedId)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DatabaseStorage.prototype.getFollowers = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var followerRelations, followerIds;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.follows)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.follows.followedId, userId))];
                    case 1:
                        followerRelations = _a.sent();
                        followerIds = followerRelations.map(function (f) { return f.followerId; });
                        if (followerIds.length === 0)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, Promise.all(followerIds.map(function (id) { return _this.getUser(id); }))
                                .then(function (users) { return users.filter(Boolean); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getFollowing = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var followingRelations, followingIds;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.follows)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.follows.followerId, userId))];
                    case 1:
                        followingRelations = _a.sent();
                        followingIds = followingRelations.map(function (f) { return f.followedId; });
                        if (followingIds.length === 0)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, Promise.all(followingIds.map(function (id) { return _this.getUser(id); }))
                                .then(function (users) { return users.filter(Boolean); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Likes
    DatabaseStorage.prototype.createLike = function (like) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Use a transaction to ensure atomic updates
                    return [4 /*yield*/, db_js_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var track, post;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.insert(schema_js_1.likes)
                                            .values(__assign(__assign({}, like), { createdAt: new Date() }))
                                            .returning()];
                                    case 1:
                                        result = _a.sent();
                                        if (!(like.contentType === 'track')) return [3 /*break*/, 5];
                                        return [4 /*yield*/, this.getTrack(like.contentId)];
                                    case 2:
                                        track = _a.sent();
                                        if (!track) return [3 /*break*/, 4];
                                        return [4 /*yield*/, tx.update(schema_js_1.tracks)
                                                .set({
                                                likeCount: (track.likeCount || 0) + 1
                                            })
                                                .where((0, drizzle_orm_1.eq)(schema_js_1.tracks.id, like.contentId))];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [3 /*break*/, 8];
                                    case 5:
                                        if (!(like.contentType === 'post')) return [3 /*break*/, 8];
                                        return [4 /*yield*/, this.getPost(like.contentId)];
                                    case 6:
                                        post = _a.sent();
                                        if (!post) return [3 /*break*/, 8];
                                        return [4 /*yield*/, tx.update(schema_js_1.posts)
                                                .set({
                                                likeCount: (post.likeCount || 0) + 1
                                            })
                                                .where((0, drizzle_orm_1.eq)(schema_js_1.posts.id, like.contentId))];
                                    case 7:
                                        _a.sent();
                                        _a.label = 8;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        // Use a transaction to ensure atomic updates
                        _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.removeLike = function (userId, contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var track, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.delete(schema_js_1.likes)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.likes.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentId, contentId), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentType, contentType)))];
                    case 1:
                        _a.sent();
                        if (!(contentType === 'track')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getTrack(contentId)];
                    case 2:
                        track = _a.sent();
                        if (!(track && track.likeCount && track.likeCount > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.tracks)
                                .set({ likeCount: track.likeCount - 1 })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.tracks.id, contentId))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 8];
                    case 5:
                        if (!(contentType === 'post')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getPost(contentId)];
                    case 6:
                        post = _a.sent();
                        if (!(post && post.likeCount && post.likeCount > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.posts)
                                .set({ likeCount: post.likeCount - 1 })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.posts.id, contentId))];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.isLiked = function (userId, contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.likes)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.likes.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentId, contentId), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentType, contentType)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLikeCount = function (contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.likes)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.likes.contentId, contentId), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentType, contentType)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserLikes = function (userId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.likes)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.likes.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentType, contentType)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (like) { return like.contentId; })];
                }
            });
        });
    };
    // Comments
    DatabaseStorage.prototype.getComment = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.comments).where((0, drizzle_orm_1.eq)(schema_js_1.comments.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var result, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.insert(schema_js_1.comments)
                            .values(__assign(__assign({}, comment), { createdAt: new Date(), updatedAt: new Date(), likeCount: 0 }))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        if (!(comment.contentType === 'track')) return [3 /*break*/, 2];
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(comment.contentType === 'post')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getPost(comment.contentId)];
                    case 3:
                        post = _a.sent();
                        if (!post) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.posts)
                                .set({ commentCount: (post.commentCount || 0) + 1 })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.posts.id, comment.contentId))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateComment = function (id, text) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.update(schema_js_1.comments)
                            .set({
                            text: text,
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema_js_1.comments.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteComment = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getComment(id)];
                    case 1:
                        comment = _a.sent();
                        if (!comment) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.comments).where((0, drizzle_orm_1.eq)(schema_js_1.comments.id, id))];
                    case 2:
                        _a.sent();
                        if (!(comment.contentType === 'post')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getPost(comment.contentId)];
                    case 3:
                        post = _a.sent();
                        if (!(post && post.commentCount && post.commentCount > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.posts)
                                .set({ commentCount: post.commentCount - 1 })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.posts.id, comment.contentId))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getCommentsByContent = function (contentId, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.comments)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.comments.contentId, contentId), (0, drizzle_orm_1.eq)(schema_js_1.comments.contentType, contentType), (0, drizzle_orm_1.isNull)(schema_js_1.comments.parentId)))
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.comments.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getReplies = function (commentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.comments)
                            .where((0, drizzle_orm_1.eq)(schema_js_1.comments.parentId, commentId))
                            .orderBy((0, drizzle_orm_1.asc)(schema_js_1.comments.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Track play count
    DatabaseStorage.prototype.incrementTrackPlayCount = function (trackId) {
        return __awaiter(this, void 0, void 0, function () {
            var track;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTrack(trackId)];
                    case 1:
                        track = _a.sent();
                        if (!track) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.tracks)
                                .set({
                                playCount: (track.playCount || 0) + 1
                            })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.tracks.id, trackId))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteTrack = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // First, delete associated likes
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.likes)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.likes.contentId, id), (0, drizzle_orm_1.eq)(schema_js_1.likes.contentType, 'track')))];
                    case 1:
                        // First, delete associated likes
                        _a.sent();
                        // Delete associated comments
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.comments)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.comments.contentId, id), (0, drizzle_orm_1.eq)(schema_js_1.comments.contentType, 'track')))];
                    case 2:
                        // Delete associated comments
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.tracks)
                                .where((0, drizzle_orm_1.eq)(schema_js_1.tracks.id, id))
                                .returning()];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Error deleting track:', error_4);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Creators
    DatabaseStorage.prototype.getRecommendedCreators = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users)
                            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.users.followerCount))
                            .limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Search functionality
    DatabaseStorage.prototype.searchTracks = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPattern, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        searchPattern = "%".concat(query, "%");
                        return [4 /*yield*/, db_js_1.db.select({
                                id: schema_js_1.tracks.id,
                                userId: schema_js_1.tracks.userId,
                                title: schema_js_1.tracks.title,
                                artistName: schema_js_1.tracks.artistName,
                                coverUrl: schema_js_1.tracks.coverUrl,
                                audioUrl: schema_js_1.tracks.audioUrl,
                                duration: schema_js_1.tracks.duration,
                                playCount: schema_js_1.tracks.playCount,
                                likeCount: schema_js_1.tracks.likeCount,
                                uploadedAt: schema_js_1.tracks.uploadedAt,
                                genre: schema_js_1.tracks.genre
                            })
                                .from(schema_js_1.tracks)
                                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_js_1.tracks.title, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.tracks.artistName, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.tracks.genre, searchPattern)))
                                .limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error in searchTracks:", error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.searchUsers = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPattern, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        searchPattern = "%".concat(query, "%");
                        return [4 /*yield*/, db_js_1.db.select({
                                id: schema_js_1.users.id,
                                username: schema_js_1.users.username,
                                password: schema_js_1.users.password,
                                email: schema_js_1.users.email,
                                displayName: schema_js_1.users.displayName,
                                bio: schema_js_1.users.bio,
                                profileImageUrl: schema_js_1.users.profileImageUrl,
                                isStreaming: schema_js_1.users.isStreaming,
                                followerCount: schema_js_1.users.followerCount,
                                createdAt: schema_js_1.users.createdAt,
                                isVerified: schema_js_1.users.isVerified,
                                verificationToken: schema_js_1.users.verificationToken,
                                verificationTokenExpiry: schema_js_1.users.verificationTokenExpiry
                            })
                                .from(schema_js_1.users)
                                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_js_1.users.username, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.users.displayName, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.users.bio, searchPattern)))
                                .limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error in searchUsers:", error_6);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.searchStreams = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPattern, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        searchPattern = "%".concat(query, "%");
                        return [4 /*yield*/, db_js_1.db.select()
                                .from(schema_js_1.streams)
                                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_js_1.streams.title, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.streams.description, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.streams.category, searchPattern)))
                                .limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error in searchStreams:", error_7);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.searchPosts = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPattern, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        searchPattern = "%".concat(query, "%");
                        return [4 /*yield*/, db_js_1.db.select({
                                id: schema_js_1.posts.id,
                                userId: schema_js_1.posts.userId,
                                title: schema_js_1.posts.title,
                                content: schema_js_1.posts.content,
                                imageUrl: schema_js_1.posts.imageUrl,
                                createdAt: schema_js_1.posts.createdAt,
                                updatedAt: schema_js_1.posts.updatedAt,
                                likeCount: schema_js_1.posts.likeCount,
                                commentCount: schema_js_1.posts.commentCount,
                                tags: schema_js_1.posts.tags,
                                postType: schema_js_1.posts.postType
                            })
                                .from(schema_js_1.posts)
                                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_js_1.posts.title, searchPattern), (0, drizzle_orm_1.ilike)(schema_js_1.posts.content, searchPattern)))
                                .limit(10)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        console.error("Error in searchPosts:", error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Analytics
    DatabaseStorage.prototype.saveAnalyticsEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For now just log the event
                console.log('Analytics event:', event);
                return [2 /*return*/];
            });
        });
    };
    DatabaseStorage.prototype.getUserAnalytics = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var playCountQuery, likesQuery, error_9;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, db_js_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT SUM(play_count) as total_plays\n        FROM tracks\n        WHERE user_id = ", "\n      "], ["\n        SELECT SUM(play_count) as total_plays\n        FROM tracks\n        WHERE user_id = ", "\n      "])), userId)];
                    case 1:
                        playCountQuery = _c.sent();
                        return [4 /*yield*/, (0, db_js_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        SELECT COUNT(*) as total_likes\n        FROM likes\n        JOIN tracks ON likes.content_id = tracks.id AND likes.content_type = 'track'\n        WHERE tracks.user_id = ", "\n      "], ["\n        SELECT COUNT(*) as total_likes\n        FROM likes\n        JOIN tracks ON likes.content_id = tracks.id AND likes.content_type = 'track'\n        WHERE tracks.user_id = ", "\n      "])), userId)];
                    case 2:
                        likesQuery = _c.sent();
                        return [2 /*return*/, {
                                playCount: ((_a = playCountQuery[0]) === null || _a === void 0 ? void 0 : _a.total_plays) || 0,
                                totalLikes: ((_b = likesQuery[0]) === null || _b === void 0 ? void 0 : _b.total_likes) || 0
                            }];
                    case 3:
                        error_9 = _c.sent();
                        console.error("Error in getUserAnalytics:", error_9);
                        return [2 /*return*/, {
                                playCount: 0,
                                totalLikes: 0
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Notifications
    DatabaseStorage.prototype.getUserNotifications = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, we would have a notifications table
                // For now, return an empty array
                return [2 /*return*/, []];
            });
        });
    };
    return DatabaseStorage;
}());
exports.DatabaseStorage = DatabaseStorage;
var templateObject_1, templateObject_2;
