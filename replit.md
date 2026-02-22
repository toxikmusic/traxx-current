# Traxx - Music Streaming Platform

## Overview
Traxx is a music streaming and community platform for musicians to connect with fans, live stream performances, upload tracks, and share content. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-02-22: Initial setup - fixed database config, Vite HMR issues, import path errors, removed stale compiled JS files

## Project Architecture
- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui components, Wouter for routing
- **Backend**: Express.js with TypeScript (tsx runner)
- **Database**: PostgreSQL via Drizzle ORM
- **Real-time**: WebSocket (ws) + Socket.IO for streaming
- **Auth**: Passport.js with local strategy, session-based
- **Streaming**: WebRTC + HLS support with stream key security

## Key Directories
- `client/` - React frontend (Vite dev server in middleware mode)
- `server/` - Express backend (routes, auth, storage, HLS, etc.)
- `shared/` - Shared TypeScript schemas and utilities (Drizzle + Zod)
- `migrations/` - Drizzle database migrations
- `uploads/` - User uploaded files and stream recordings

## Configuration
- Vite config: `vite.config.ts` (main), `vite.config.js` (extended with server/CORS settings)
- Drizzle config: `drizzle.config.ts`
- Server entry: `server/index.ts`
- Dev command: `npm run dev` (runs tsx server/index.ts on port 5000)

## User Preferences
- None recorded yet
