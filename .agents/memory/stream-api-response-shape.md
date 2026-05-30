---
name: Stream API response shape
description: GET stream endpoints wrap data as {success, stream}; client helpers must unwrap, and go-live's refetch must not clobber.
---

# Stream endpoints return a wrapped envelope

`GET /api/streams/:id` and `GET /api/streams/public/:publicId` respond with
`{ success: true, stream: {...} }` — NOT the bare stream object. The `stream`
includes `externalStreamId`/`publicStreamId`, and (only when the requester is the
authenticated owner) `streamKey`/`privateStreamKey`.

**Rule:** every client caller of these endpoints must unwrap `res.stream` before
reading fields. `getStreamById` (client/src/lib/api.ts) and the viewer page
(client/src/pages/stream.tsx) both do this.

**Why:** a past bug — after "Go Live", the StreamDashboard showed empty Stream ID
and "No share link". `getStreamById` returned the raw envelope, so the go-live
refetch `useEffect` (deps `[streamId, streamType]`, fires right after
`handleGoLive` sets `streamId`) read `streamData.externalStreamId` as `undefined`
and overwrote the good values `handleGoLive` had just set with `""`.

**How to apply:**
- When adding a new caller of a stream GET endpoint, unwrap `res.stream`.
- The go-live refetch merges into previous state and falls back to prior values
  (`effectiveX || prev.X`) so it can never replace a known id/key with empty —
  keep that pattern if you touch it, because the create-then-refetch sequence is
  inherently racy.
