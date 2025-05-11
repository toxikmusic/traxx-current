/**
 * HLS (HTTP Live Streaming) handler for livestreams
 * Manages dynamic M3U8 playlist creation and segment handling
 * 
 * Enhanced with cloud object storage support for temporary and permanent recordings
 */

import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Stream } from '../shared/schema';
import { storage } from './storage';
import { objectStorage } from './object-storage';

// Maps active streams to their HLS info
interface HLSStreamInfo {
  userId: number;
  streamId: number;
  segments: string[];
  lastUpdated: Date;
  startTime: Date;
  duration: number; // Total stream duration in seconds
  sequence: number; // Media sequence number
  bandwidth: number; // Estimated bandwidth in bits/s
  useObjectStorage: boolean; // Whether to use object storage for this stream
}

// In-memory store of active HLS streams
const hlsStreams = new Map<string, HLSStreamInfo>();

// Directory for storing temporary HLS segments 
// (fallback if object storage isn't configured)
const HLS_TEMP_DIR = path.join(process.cwd(), 'uploads', 'hls');

// Ensure HLS directory exists
if (!fs.existsSync(HLS_TEMP_DIR)) {
  fs.mkdirSync(HLS_TEMP_DIR, { recursive: true });
}

/**
 * Creates or updates a stream's HLS playlist
 */
export async function createOrUpdateHLSPlaylist(
  streamId: number,
  userId: number,
  segment?: Buffer,
  mimeType: string = 'video/mp4'
): Promise<string> {
  try {
    // Get stream from database to verify it exists
    const stream = await storage.getStream(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    // Validate the user is the stream owner
    if (stream.userId !== userId) {
      throw new Error('Not authorized to update this stream');
    }

    // Get or create stream HLS info
    let streamInfo = hlsStreams.get(streamId.toString());
    if (!streamInfo) {
      // Check if object storage is available
      const useObjectStorage = process.env.OBJECT_STORAGE_BUCKET ? true : false;
      
      const newStreamInfo: HLSStreamInfo = {
        userId,
        streamId,
        segments: [],
        lastUpdated: new Date(),
        startTime: new Date(),
        duration: 0,
        sequence: 0,
        bandwidth: 800000, // Default bandwidth (800kbps)
        useObjectStorage // Use object storage if available
      };
      
      streamInfo = newStreamInfo;
      hlsStreams.set(streamId.toString(), streamInfo);
      
      // If not using object storage, ensure local directory exists
      if (!useObjectStorage) {
        const streamDir = path.join(HLS_TEMP_DIR, streamId.toString());
        if (!fs.existsSync(streamDir)) {
          fs.mkdirSync(streamDir, { recursive: true });
        }
      }
      
      console.log(`Created new HLS stream ${streamId} with ${useObjectStorage ? 'object storage' : 'local storage'}`);
    }

    // If a new segment was provided
    if (segment && streamInfo) {
      // Calculate segment filename based on sequence
      const segmentIndex = streamInfo.segments.length;
      const segmentName = `segment_${segmentIndex}.ts`;
      
      // Store the segment (either local or object storage)
      let segmentUrl: string;
      
      if (streamInfo.useObjectStorage) {
        // Store in object storage
        segmentUrl = await objectStorage.storeSegment(
          streamId,
          userId,
          segment,
          segmentIndex
        );
        
        // Add to segments list with the returned URL
        streamInfo.segments.push(segmentUrl);
      } else {
        // Store locally
        const segmentPath = path.join(HLS_TEMP_DIR, streamId.toString(), segmentName);
        fs.writeFileSync(segmentPath, segment);
        
        // Add to segments list with just the filename for local storage
        streamInfo.segments.push(segmentName);
      }
      
      // Update stream info
      streamInfo.lastUpdated = new Date();
      streamInfo.duration += 6; // Assume each segment is ~6 seconds
      streamInfo.sequence = Math.max(0, streamInfo.segments.length - 10); // Keep a sliding window
      
      // Update bandwidth estimation based on segment size
      const segmentSizeKbits = (segment.length * 8) / 1000;
      const segmentDurationSec = 6; // Assume fixed segment duration
      const segmentBitrate = segmentSizeKbits / segmentDurationSec;
      
      // Smooth bandwidth calculation (exponential moving average)
      streamInfo.bandwidth = Math.round(
        0.7 * streamInfo.bandwidth + 0.3 * segmentBitrate * 1000
      );

      // Update the map
      hlsStreams.set(streamId.toString(), streamInfo);
      
      // Update stream in database as being live
      if (stream && !stream.isLive) {
        await storage.updateStream(streamId, { isLive: true });
      }
      
      // If using object storage, update the playlist too
      if (streamInfo.useObjectStorage) {
        await objectStorage.updatePlaylist(streamId, streamInfo.segments);
      }
    }

    // Generate the playlist URL based on storage type
    let playlistUrl: string;
    
    if (streamInfo.useObjectStorage) {
      playlistUrl = `/stream-recordings/stream-${streamId}/playlist.m3u8`;
    } else {
      playlistUrl = `/hls/${streamId}/playlist.m3u8`;
    }
    
    return playlistUrl;
    
  } catch (error) {
    console.error('Error creating/updating HLS playlist:', error);
    throw error;
  }
}

/**
 * Ends a stream's HLS playlist
 * 
 * @returns An object with stream details and a flag indicating if a save prompt should be shown
 */
export async function endHLSStream(streamId: number, userId: number): Promise<{
  success: boolean;
  showSavePrompt: boolean;
  temporaryUrl?: string;
  message: string;
}> {
  try {
    // Get stream from database to verify it exists
    const stream = await storage.getStream(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    // Validate the user is the stream owner
    if (stream.userId !== userId) {
      throw new Error('Not authorized to end this stream');
    }

    // Get stream info
    const streamInfo = hlsStreams.get(streamId.toString());
    const useObjectStorage = streamInfo?.useObjectStorage || false;
    
    // Remove from active HLS streams
    hlsStreams.delete(streamId.toString());
    
    // Update stream in database
    await storage.updateStream(streamId, { isLive: false });
    
    // If using object storage, we should prompt the user to save
    if (useObjectStorage) {
      // Get details about the recording
      const recordingDetails = objectStorage.getRecordingDetails(streamId);
      
      if (recordingDetails) {
        return {
          success: true,
          showSavePrompt: true,
          temporaryUrl: `/stream-recordings/stream-${streamId}/playlist.m3u8`,
          message: 'Stream ended. The recording is temporarily available.'
        };
      }
    }
    
    // Default response (local storage or no recording)
    return {
      success: true,
      showSavePrompt: false,
      message: 'Stream ended.'
    };
  } catch (error) {
    console.error('Error ending HLS stream:', error);
    throw error;
  }
}

/**
 * Finalizes a stream recording - either saves it permanently or deletes it
 */
export async function finalizeStreamRecording(
  streamId: number, 
  userId: number, 
  savePermanently: boolean
): Promise<{
  success: boolean;
  message: string;
  permanentUrl?: string;
}> {
  try {
    // Get stream from database to verify it exists
    const stream = await storage.getStream(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    // Validate the user is the stream owner
    if (stream.userId !== userId) {
      throw new Error('Not authorized to manage this stream recording');
    }
    
    // Finalize the recording
    const result = await objectStorage.finalizeRecording(streamId, savePermanently);
    
    if (result) {
      if (savePermanently) {
        // Get the permanent URL
        const recordingDetails = objectStorage.getRecordingDetails(streamId);
        return {
          success: true,
          message: 'Stream recording saved permanently',
          permanentUrl: recordingDetails?.playlistUrl
        };
      } else {
        return {
          success: true,
          message: 'Stream recording deleted'
        };
      }
    } else {
      return {
        success: false,
        message: 'Stream recording not found'
      };
    }
  } catch (error) {
    console.error('Error finalizing stream recording:', error);
    throw error;
  }
}

/**
 * Serves the master playlist for a stream
 */
export function handleMasterPlaylist(req: Request, res: Response) {
  const streamId = req.params.streamId;
  const streamInfo = hlsStreams.get(streamId);
  
  if (!streamInfo) {
    // If stream isn't live but exists in database, serve VOD playlist if available
    storage.getStream(parseInt(streamId))
      .then(stream => {
        if (stream) {
          // Check if recorded playlist exists
          const vodPath = path.join(HLS_TEMP_DIR, streamId, 'vod.m3u8');
          if (fs.existsSync(vodPath)) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            return res.status(200).send(fs.readFileSync(vodPath));
          }
          
          res.status(404).send('Stream is not currently live and no recording is available');
        } else {
          res.status(404).send('Stream not found');
        }
      })
      .catch(err => {
        console.error(`Error checking stream ${streamId}:`, err);
        res.status(500).send('Server error');
      });
    return;
  }

  // Create master playlist with multiple bitrates if needed
  // For now, we'll use a simple single-bitrate playlist
  const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=${streamInfo.bandwidth},RESOLUTION=1280x720
playlist.m3u8
`;

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.status(200).send(playlist);
}

/**
 * Serves the media playlist for a stream
 */
export function handleMediaPlaylist(req: Request, res: Response) {
  const streamId = req.params.streamId;
  const streamInfo = hlsStreams.get(streamId);
  
  if (!streamInfo) {
    // Stream isn't live
    res.status(404).send('Stream is not currently live');
    return;
  }

  // Build the media playlist
  let playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:${streamInfo.sequence}
`;

  // Include only the last 10 segments to keep playlist small
  const recentSegments = streamInfo.segments.slice(-10);
  
  // Add segment entries
  recentSegments.forEach(segment => {
    playlist += `#EXTINF:6.0,\n`;
    playlist += `${segment}\n`;
  });

  // Only add endlist tag if stream is explicitly ended
  if (!hlsStreams.has(streamId)) {
    playlist += `#EXT-X-ENDLIST\n`;
  }

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.status(200).send(playlist);
}

/**
 * Serves a segment file
 */
export function handleSegment(req: Request, res: Response) {
  const streamId = req.params.streamId;
  const segmentId = req.params.segment;
  
  // Validate segment name to prevent directory traversal
  if (!segmentId.match(/^segment_\d+\.ts$/)) {
    return res.status(400).send('Invalid segment name');
  }

  const segmentPath = path.join(HLS_TEMP_DIR, streamId, segmentId);
  
  if (!fs.existsSync(segmentPath)) {
    return res.status(404).send('Segment not found');
  }

  res.setHeader('Content-Type', 'video/MP2T');
  fs.createReadStream(segmentPath).pipe(res);
}

/**
 * Uploads a new segment for a stream
 */
export async function uploadSegment(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No segment file provided' });
  }

  const streamId = parseInt(req.params.streamId);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const segmentBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    
    const playlistUrl = await createOrUpdateHLSPlaylist(
      streamId,
      userId,
      segmentBuffer,
      mimeType
    );
    
    res.status(200).json({ 
      success: true, 
      playlistUrl,
      message: 'Segment uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading segment:', error);
    res.status(500).json({ error: 'Failed to process segment' });
  }
}

/**
 * Converts a WebRTC media stream chunk to an HLS segment
 * Note: In a production environment, you would use FFmpeg for this
 * Here we're creating a simplified version
 */
export async function processWebRTCChunk(
  streamId: number,
  userId: number,
  chunk: Buffer
): Promise<string | null> {
  try {
    // Here we would normally use FFmpeg to convert the chunk to an HLS segment
    // For simplicity, we'll just use the chunk directly
    // In production, implement proper transcoding here

    // Update the HLS playlist with this segment
    const playlistUrl = await createOrUpdateHLSPlaylist(
      streamId, 
      userId,
      chunk, 
      'video/mp4'
    );
    
    return playlistUrl;
  } catch (error) {
    console.error('Error processing WebRTC chunk:', error);
    return null;
  }
}

/**
 * Cleans up old HLS data
 * Should be called periodically or when server starts
 */
export function cleanupHLSData(maxAgeHours = 24): void {
  try {
    // Get all subdirectories in the HLS directory
    const dirs = fs.readdirSync(HLS_TEMP_DIR)
      .filter(file => fs.statSync(path.join(HLS_TEMP_DIR, file)).isDirectory());
    
    const now = new Date();
    
    dirs.forEach(dir => {
      const dirPath = path.join(HLS_TEMP_DIR, dir);
      const stats = fs.statSync(dirPath);
      
      // Check if directory is older than maxAgeHours
      const ageHours = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > maxAgeHours) {
        // Delete directory and all contents
        fs.rmdirSync(dirPath, { recursive: true });
        console.log(`Cleaned up old HLS data for stream ${dir}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up HLS data:', error);
  }
}

// Call cleanup on module import (when server starts)
cleanupHLSData();

// Export HLS streams info (for debugging)
export function getHLSStreamsInfo(): { [key: string]: HLSStreamInfo } {
  const info: { [key: string]: HLSStreamInfo } = {};
  hlsStreams.forEach((value, key) => {
    info[key] = { ...value };
  });
  return info;
}