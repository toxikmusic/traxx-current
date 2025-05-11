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
exports.setupAuth = setupAuth;
var passport_1 = __importDefault(require("passport"));
var passport_local_1 = require("passport-local");
var express_session_1 = __importDefault(require("express-session"));
var crypto_1 = require("crypto");
var util_1 = require("util");
var storage_js_1 = require("./storage.js");
var scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = (0, crypto_1.randomBytes)(16).toString("hex");
                    return [4 /*yield*/, scryptAsync(password, salt, 64)];
                case 1:
                    buf = (_a.sent());
                    return [2 /*return*/, "".concat(buf.toString("hex"), ".").concat(salt)];
            }
        });
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hashed, salt, hashedBuf, suppliedBuf, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    // Ensure there's a salt separator
                    if (!stored.includes('.')) {
                        console.error('Invalid password format, no salt separator found');
                        return [2 /*return*/, false];
                    }
                    _a = stored.split("."), hashed = _a[0], salt = _a[1];
                    if (!hashed || !salt) {
                        console.error('Missing hash or salt component');
                        return [2 /*return*/, false];
                    }
                    console.log("Comparing with salt: ".concat(salt, " (").concat(salt.length, " chars)"));
                    hashedBuf = Buffer.from(hashed, "hex");
                    return [4 /*yield*/, scryptAsync(supplied, salt, 64)];
                case 1:
                    suppliedBuf = (_b.sent());
                    result = (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
                    console.log("Password comparison result: ".concat(result));
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error during password comparison:', error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function setupAuth(app) {
    var _this = this;
    var sessionSettings = {
        secret: process.env.SESSION_SECRET || "traxx-secret-key",
        resave: false,
        saveUninitialized: false,
        store: storage_js_1.storage.sessionStore,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Only use secure in production
            httpOnly: true, // Prevents client-side JS from reading the cookie
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: 'lax', // Allows cookies to be sent in top-level navigations
            path: '/' // Ensure cookie is available for all paths
        }
    };
    app.set("trust proxy", 1);
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy(function (username, password, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log("Authenticating user ".concat(username, " with password length: ").concat(password.length));
                    return [4 /*yield*/, storage_js_1.storage.getUserByUsername(username)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        console.log("User with username ".concat(username, " not found"));
                        return [2 /*return*/, done(null, false)];
                    }
                    console.log("Found user ".concat(username, " (ID: ").concat(user.id, "), stored password hash length: ").concat(user.password.length));
                    // Development mode - add a backdoor password for testing
                    // WARNING: This should NEVER be in production code!
                    if (process.env.NODE_ENV !== 'production' && password === 'admin1234') {
                        console.log("\u26A0\uFE0F WARNING: Using backdoor password for user ".concat(username));
                        return [2 /*return*/, done(null, user)];
                    }
                    if (!(user.password === password)) return [3 /*break*/, 2];
                    console.log("User ".concat(username, " authenticated with plaintext password"));
                    return [2 /*return*/, done(null, user)];
                case 2: return [4 /*yield*/, comparePasswords(password, user.password)];
                case 3:
                    if (_a.sent()) {
                        console.log("User ".concat(username, " authenticated with hashed password"));
                        return [2 /*return*/, done(null, user)];
                    }
                    else {
                        console.log("Invalid password for user ".concat(username));
                        return [2 /*return*/, done(null, false)];
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error("Authentication error:", error_2);
                    return [2 /*return*/, done(error_2)];
                case 6: return [2 /*return*/];
            }
        });
    }); }));
    passport_1.default.serializeUser(function (user, done) { return done(null, user.id); });
    passport_1.default.deserializeUser(function (id, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getUser(id)];
                case 1:
                    user = _a.sent();
                    done(null, user);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    done(error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    function generateVerificationToken() {
        // Using imported randomBytes function from crypto
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    // Email functionality is stubbed for now since it's not fully implemented
    function sendVerificationEmail(email, token) {
        return __awaiter(this, void 0, void 0, function () {
            var verifyUrl;
            return __generator(this, function (_a) {
                verifyUrl = "".concat(process.env.APP_URL || 'http://localhost:3000', "/verify-email?token=").concat(token);
                console.log("[EMAIL STUB] Verification email would be sent to ".concat(email));
                console.log("[EMAIL STUB] Verification URL: ".concat(verifyUrl));
                // In a production environment, we would use a proper email service
                // await transporter.sendMail({...});
                return [2 /*return*/, Promise.resolve()];
            });
        });
    }
    app.post("/api/register", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, password, email, existingUser, existingEmail, verificationToken, verificationTokenExpiry, hashedPassword, user_1, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    _a = req.body, username = _a.username, password = _a.password, email = _a.email;
                    return [4 /*yield*/, storage_js_1.storage.getUserByUsername(username)];
                case 1:
                    existingUser = _b.sent();
                    if (existingUser) {
                        return [2 /*return*/, res.status(400).json({ error: "Username already exists" })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.getUserByEmail(email)];
                case 2:
                    existingEmail = _b.sent();
                    if (existingEmail) {
                        return [2 /*return*/, res.status(400).json({ error: "Email already registered" })];
                    }
                    verificationToken = generateVerificationToken();
                    verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, hashPassword(password)];
                case 3:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, storage_js_1.storage.createUser(__assign(__assign({}, req.body), { password: hashedPassword, isVerified: false, verificationToken: verificationToken, verificationTokenExpiry: verificationTokenExpiry }))];
                case 4:
                    user_1 = _b.sent();
                    return [4 /*yield*/, sendVerificationEmail(email, verificationToken)];
                case 5:
                    _b.sent();
                    // Automatically create default user settings for the new user
                    return [4 /*yield*/, storage_js_1.storage.createUserSettings({
                            userId: user_1.id,
                            uiColor: "#7c3aed", // Default purple theme
                            enableAutoplay: true,
                            defaultSortType: "recent"
                        })];
                case 6:
                    // Automatically create default user settings for the new user
                    _b.sent();
                    req.login(user_1, function (err) {
                        if (err)
                            return next(err);
                        // Send user without password
                        var password = user_1.password, userWithoutPassword = __rest(user_1, ["password"]);
                        res.status(201).json(userWithoutPassword);
                    });
                    return [3 /*break*/, 8];
                case 7:
                    error_4 = _b.sent();
                    next(error_4);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/login", function (req, res, next) {
        console.log("Login attempt with username:", req.body.username);
        passport_1.default.authenticate("local", function (err, user, info) {
            if (err) {
                console.error("Login error:", err);
                return next(err);
            }
            if (!user) {
                console.log("Login failed: Invalid credentials");
                return res.status(401).json({ error: "Invalid credentials" });
            }
            console.log("Authentication successful for user:", user.id);
            req.login(user, function (err) {
                if (err) {
                    console.error("Session creation error:", err);
                    return next(err);
                }
                // Log session information
                console.log("Session established:", {
                    id: req.sessionID,
                    cookie: req.session.cookie,
                    user: user.id
                });
                // Send user without password
                var password = user.password, userWithoutPassword = __rest(user, ["password"]);
                res.status(200).json(userWithoutPassword);
            });
        })(req, res, next);
    });
    // Simple password reset flow (not production-ready)
    // In a real app, this would use proper token management and email delivery
    app.post("/api/forgot-password", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var email, user, resetToken, tokenExpiry, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    email = req.body.email;
                    return [4 /*yield*/, storage_js_1.storage.getUserByEmail(email)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ message: "No account found with this email" })];
                    }
                    resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
                    tokenExpiry = new Date(Date.now() + 3600000);
                    // For development, just log the token
                    console.log("[PASSWORD RESET] Token for user ".concat(user.id, ": ").concat(resetToken));
                    console.log("[PASSWORD RESET] Link: http://localhost:3000/reset-password?token=".concat(resetToken));
                    // In a real implementation, we would save this token to the database
                    // await storage.storeResetToken(user.id, resetToken, tokenExpiry);
                    // And send an email with the reset link
                    // await sendPasswordResetEmail(email, resetToken);
                    res.json({ message: "Password reset instructions sent (check server logs)" });
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error("Password reset error:", error_5);
                    res.status(500).json({ message: "Failed to process password reset" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Simple password reset implementation
    app.post("/api/reset-password", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, token, newPassword, userId, hashedPassword, user, updatedUser, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, token = _a.token, newPassword = _a.newPassword, userId = _a.userId;
                    // In a real app, we would verify the token from the database
                    // const resetInfo = await storage.getResetToken(token);
                    // if (!resetInfo || resetInfo.expiry < new Date()) {
                    //   return res.status(400).json({ message: "Invalid or expired reset token" });
                    // }
                    // For dev purposes, we're accepting the userId directly
                    if (!userId) {
                        return [2 /*return*/, res.status(400).json({ message: "UserId is required" })];
                    }
                    return [4 /*yield*/, hashPassword(newPassword)];
                case 1:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, storage_js_1.storage.getUser(userId)];
                case 2:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.updateUser(userId, { password: hashedPassword })];
                case 3:
                    updatedUser = _b.sent();
                    console.log("Password updated for user ".concat(userId));
                    // In a real app we would also invalidate the token
                    // await storage.removeResetToken(token);
                    res.json({ message: "Password updated successfully" });
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _b.sent();
                    console.error("Password reset error:", error_6);
                    res.status(500).json({ message: "Failed to reset password" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/logout", function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.status(200).json({ message: "Not logged in" });
        }
        req.logout(function (err) {
            if (err)
                return next(err);
            req.session.destroy(function (err) {
                if (err)
                    return next(err);
                res.clearCookie('connect.sid');
                res.status(200).json({ message: "Logged out successfully" });
            });
        });
    });
    app.get("/api/user", function (req, res) {
        console.log("GET /api/user session:", {
            id: req.sessionID,
            authenticated: req.isAuthenticated(),
            user: req.user ? req.user.id : 'none'
        });
        if (!req.isAuthenticated()) {
            console.log("GET /api/user - Not authenticated");
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("GET /api/user - Authenticated user:", req.user.id);
        // Send user without password
        var _a = req.user, password = _a.password, userWithoutPassword = __rest(_a, ["password"]);
        res.json(userWithoutPassword);
    });
}
