"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCommentSchema = exports.comments = exports.insertLikeSchema = exports.likes = exports.insertPostSchema = exports.posts = exports.PostType = exports.insertFollowSchema = exports.follows = exports.insertGenreSchema = exports.genres = exports.insertTrackSchema = exports.tracks = exports.insertStreamSchema = exports.streams = exports.insertUserSettingsSchema = exports.userSettings = exports.insertUserSchema = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
// User model
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(), // Added email field
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    bio: (0, pg_core_1.text)("bio"),
    profileImageUrl: (0, pg_core_1.text)("profile_image_url"),
    isStreaming: (0, pg_core_1.boolean)("is_streaming").default(false),
    followerCount: (0, pg_core_1.integer)("follower_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false), // Added isVerified field
    verificationToken: (0, pg_core_1.text)("verification_token"), // Added verificationToken field
    verificationTokenExpiry: (0, pg_core_1.timestamp)("verification_token_expiry") // Added verificationTokenExpiry field
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
    email: true, // Added email to the insert schema
    displayName: true,
    bio: true,
    profileImageUrl: true,
    isStreaming: true // Added isStreaming for stream status updates
});
// User Settings model
exports.userSettings = (0, pg_core_1.pgTable)("user_settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().unique(),
    uiColor: (0, pg_core_1.text)("ui_color").default("#8B5CF6"), // Default purple color
    enableAutoplay: (0, pg_core_1.boolean)("enable_autoplay").default(true),
    defaultSortType: (0, pg_core_1.text)("default_sort_type").default("recent"), // Options: recent, popular, etc.
    highContrastMode: (0, pg_core_1.boolean)("high_contrast_mode").default(false), // Accessibility setting
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertUserSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userSettings).pick({
    userId: true,
    uiColor: true,
    enableAutoplay: true,
    defaultSortType: true,
    highContrastMode: true
});
// Stream model
exports.streams = (0, pg_core_1.pgTable)("streams", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    thumbnailUrl: (0, pg_core_1.text)("thumbnail_url"),
    streamKey: (0, pg_core_1.text)("stream_key"), // Stream key for secure broadcasting 
    isLive: (0, pg_core_1.boolean)("is_live").default(false),
    viewerCount: (0, pg_core_1.integer)("viewer_count").default(0),
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow(),
    endedAt: (0, pg_core_1.timestamp)("ended_at"),
    category: (0, pg_core_1.text)("category"),
    tags: (0, pg_core_1.text)("tags").array(),
    streamType: (0, pg_core_1.text)("stream_type").default("video"), // "video" or "audio"
    protocol: (0, pg_core_1.text)("protocol").default("webrtc"), // "webrtc" or "hls"
    useCamera: (0, pg_core_1.boolean)("use_camera").default(true),
    useMicrophone: (0, pg_core_1.boolean)("use_microphone").default(true),
    useSystemAudio: (0, pg_core_1.boolean)("use_system_audio").default(false),
    hasVisualElement: (0, pg_core_1.boolean)("has_visual_element").default(false),
    visualElementType: (0, pg_core_1.text)("visual_element_type"), // "image" or "video"
    visualElementUrl: (0, pg_core_1.text)("visual_element_url"), // URL to uploaded image or video
    hlsPlaylistUrl: (0, pg_core_1.text)("hls_playlist_url"), // M3U8 playlist URL
    hlsSegmentUrl: (0, pg_core_1.text)("hls_segment_url"), // Base URL for uploading segments
    hlsFolderPath: (0, pg_core_1.text)("hls_folder_path"), // Server-side folder where segments are stored
    hasRecording: (0, pg_core_1.boolean)("has_recording").default(false), // Whether the stream has a VOD recording
    recordingUrl: (0, pg_core_1.text)("recording_url"), // URL to the VOD recording if available
    peakViewerCount: (0, pg_core_1.integer)("peak_viewer_count").default(0), // Track peak concurrent viewers
    externalStreamId: (0, pg_core_1.text)("external_stream_id"), // For external streaming services like Cloudflare Stream
});
exports.insertStreamSchema = (0, drizzle_zod_1.createInsertSchema)(exports.streams);
// Track model
exports.tracks = (0, pg_core_1.pgTable)("tracks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    artistName: (0, pg_core_1.text)("artist_name").notNull(),
    coverUrl: (0, pg_core_1.text)("cover_url"),
    audioUrl: (0, pg_core_1.text)("audio_url").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(),
    playCount: (0, pg_core_1.integer)("play_count").default(0),
    likeCount: (0, pg_core_1.integer)("like_count").default(0),
    uploadedAt: (0, pg_core_1.timestamp)("uploaded_at").defaultNow(),
    genre: (0, pg_core_1.text)("genre")
});
exports.insertTrackSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tracks).pick({
    userId: true,
    title: true,
    artistName: true,
    coverUrl: true,
    audioUrl: true,
    duration: true,
    genre: true
});
// Genre model
exports.genres = (0, pg_core_1.pgTable)("genres", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique()
});
exports.insertGenreSchema = (0, drizzle_zod_1.createInsertSchema)(exports.genres).pick({
    name: true
});
// Follow model (for user following relationships)
exports.follows = (0, pg_core_1.pgTable)("follows", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    followerId: (0, pg_core_1.integer)("follower_id").notNull(),
    followedId: (0, pg_core_1.integer)("followed_id").notNull()
});
exports.insertFollowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.follows).pick({
    followerId: true,
    followedId: true
});
// Post model (for user's images and text posts)
exports.PostType = {
    TEXT: "text",
    IMAGE: "image"
};
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    imageUrl: (0, pg_core_1.text)("image_url"),
    likeCount: (0, pg_core_1.integer)("like_count").default(0),
    commentCount: (0, pg_core_1.integer)("comment_count").default(0),
    postType: (0, pg_core_1.text)("post_type").default("text").$type(), // Options: text, image
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    tags: (0, pg_core_1.text)("tags").array()
});
exports.insertPostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posts).pick({
    userId: true,
    title: true,
    content: true,
    imageUrl: true,
    postType: true,
    tags: true
});
// Likes model (for tracks and posts)
exports.likes = (0, pg_core_1.pgTable)("likes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    contentId: (0, pg_core_1.integer)("content_id").notNull(),
    contentType: (0, pg_core_1.text)("content_type").notNull(), // "track" or "post"
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.insertLikeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.likes).pick({
    userId: true,
    contentId: true,
    contentType: true
});
// Comments model (for tracks and posts)
exports.comments = (0, pg_core_1.pgTable)("comments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    contentId: (0, pg_core_1.integer)("content_id").notNull(),
    contentType: (0, pg_core_1.text)("content_type").notNull(), // "track" or "post"
    text: (0, pg_core_1.text)("text").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    likeCount: (0, pg_core_1.integer)("like_count").default(0),
    parentId: (0, pg_core_1.integer)("parent_id") // For nested comments/replies, null for top-level comments
});
exports.insertCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.comments).pick({
    userId: true,
    contentId: true,
    contentType: true,
    text: true,
    parentId: true
});
