import { useRef, useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, Video, Mic, MicOff, Key, Globe } from 'lucide-react';

interface VideoPlayerProps {
  streamId?: string | number;
  stream?: MediaStream | null;
  protocol?: 'webrtc' | 'hls' | 'cloudflare';
  isHost?: boolean;
  viewerCount?: number;
  cloudflareStreamId?: string;
  hlsUrl?: string;
  audioOnly?: boolean;
}

export default function VideoPlayer({
  streamId,
  stream,
  protocol = 'webrtc',
  isHost = false,
  viewerCount = 0,
  cloudflareStreamId,
  hlsUrl,
  audioOnly = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [hasVideo, setHasVideo] = useState<boolean>(!audioOnly);
  const [hasAudio, setHasAudio] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Handle direct WebRTC stream connection
  useEffect(() => {
    if (protocol === 'webrtc' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Check if the stream has video tracks
      const videoTracks = stream.getVideoTracks();
      setHasVideo(videoTracks.length > 0 && !audioOnly);
      
      // Check if the stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      setHasAudio(audioTracks.length > 0);
      
      // Auto-play the stream
      videoRef.current.play().catch(error => {
        console.error('Error auto-playing video:', error);
        setIsPlaying(false);
      });
    }
  }, [stream, protocol, audioOnly]);
  
  // Handle stream changes
  useEffect(() => {
    if (videoRef.current && protocol === 'hls' && hlsUrl) {
      videoRef.current.src = hlsUrl;
      videoRef.current.play().catch(error => {
        console.error('Error playing HLS stream:', error);
        setIsPlaying(false);
      });
    }
  }, [hlsUrl, protocol]);

  // Function to handle video play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Error playing video:', error);
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gray-900">
      {/* Protocol indicator & viewer count */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {protocol === 'webrtc' ? 'WebRTC' : protocol === 'hls' ? 'HLS' : 'Cloudflare'}
          </Badge>
          
          {isHost && (
            <Badge variant="secondary" className="bg-red-600/90 text-white">
              LIVE
            </Badge>
          )}
        </div>
        
        <Badge variant="secondary" className="bg-black/70 text-white">
          <Users className="h-3.5 w-3.5 mr-1" /> {viewerCount}
        </Badge>
      </div>
      
      {/* Video indicators */}
      <div className="absolute bottom-3 left-3 z-10 flex gap-2">
        {hasVideo ? (
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Video className="h-3.5 w-3.5 mr-1" /> Video
          </Badge>
        ) : null}
        
        {hasAudio ? (
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Mic className="h-3.5 w-3.5 mr-1" /> Audio
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-black/70 text-white">
            <MicOff className="h-3.5 w-3.5 mr-1" /> Muted
          </Badge>
        )}
        
        {isHost && (
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Key className="h-3.5 w-3.5 mr-1" /> Host
          </Badge>
        )}
        
        {streamId && (
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Globe className="h-3.5 w-3.5 mr-1" /> ID: {streamId.toString().substring(0, 6)}...
          </Badge>
        )}
      </div>
      
      {/* Video/Audio Player */}
      <div 
        className={`relative w-full ${
          aspectRatio === '16:9' ? 'aspect-video' : 
          aspectRatio === '4:3' ? 'aspect-4/3' : 'aspect-square'
        } bg-gray-900 overflow-hidden`}
      >
        {protocol === 'cloudflare' && cloudflareStreamId ? (
          // Cloudflare Stream iframe player
          <iframe 
            ref={iframeRef}
            src={`https://customer-t2aair0gpwhh9qzs.cloudflarestream.com/${cloudflareStreamId}/iframe`}
            title="Cloudflare Stream Player"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          // WebRTC or HLS video player
          <>
            {/* For audioOnly streams, we show a waveform visualization instead of video */}
            {audioOnly ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900">
                <div className="text-center">
                  <div className="mb-2">
                    <Mic className="h-12 w-12 mx-auto text-white/70" />
                  </div>
                  <p className="text-white text-lg font-medium">Audio Stream</p>
                </div>
              </div>
            ) : null}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-contain ${audioOnly ? 'hidden' : ''}`}
              controls={!isHost} // Only show controls for viewers
              muted={isHost} // Mute for hosts to prevent feedback
              onClick={togglePlay}
            />
          </>
        )}
      </div>
    </div>
  );
}