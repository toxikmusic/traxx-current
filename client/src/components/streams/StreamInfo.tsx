import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Key, Globe, Users, Clock, Video, Mic, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface StreamInfoProps {
  streamId: string | number;
  streamKey?: string;
  title: string;
  description?: string;
  isLive: boolean;
  viewerCount: number;
  startTime?: Date;
  duration?: number;
  protocol?: 'webrtc' | 'hls' | 'cloudflare';
  streamType?: 'video' | 'audio';
  isHost: boolean;
}

export default function StreamInfo({
  streamId,
  streamKey,
  title,
  description,
  isLive,
  viewerCount,
  startTime,
  duration,
  protocol = 'webrtc',
  streamType = 'video',
  isHost
}: StreamInfoProps) {
  const { toast } = useToast();
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyJustCopied, setKeyJustCopied] = useState(false);
  const [idJustCopied, setIdJustCopied] = useState(false);
  
  // Format the stream duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    const elapsed = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000);
    return formatDuration(elapsed);
  };
  
  // Handle copying stream key
  const copyStreamKey = () => {
    if (!streamKey) return;
    
    navigator.clipboard.writeText(streamKey).then(() => {
      setKeyJustCopied(true);
      setTimeout(() => setKeyJustCopied(false), 3000);
      
      toast({
        title: "Stream Key Copied",
        description: "Keep your stream key private! It gives full broadcasting access to your channel.",
      });
    }).catch(err => {
      console.error('Failed to copy stream key:', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy stream key to clipboard.",
        variant: "destructive"
      });
    });
  };
  
  // Handle copying stream ID
  const copyStreamId = () => {
    navigator.clipboard.writeText(streamId.toString()).then(() => {
      setIdJustCopied(true);
      setTimeout(() => setIdJustCopied(false), 3000);
      
      toast({
        title: "Stream ID Copied",
        description: "Share this ID so viewers can join your stream.",
      });
    }).catch(err => {
      console.error('Failed to copy stream ID:', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy stream ID to clipboard.",
        variant: "destructive"
      });
    });
  };
  
  // Generate shareable link
  const getShareableLink = () => {
    return `${window.location.origin}/stream/${streamId}`;
  };
  
  // Handle copying shareable link
  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink()).then(() => {
      toast({
        title: "Link Copied",
        description: "Share this link so viewers can join your stream.",
      });
    }).catch(err => {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="px-2 py-1">
                LIVE
              </Badge>
            )}
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {viewerCount}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {duration ? formatDuration(duration) : getElapsedTime()}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              {streamType === 'video' ? <Video className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              {streamType.charAt(0).toUpperCase() + streamType.slice(1)}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              {protocol.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stream ID section - visible to all */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Stream ID
            <Badge variant="outline" className="ml-auto">Public</Badge>
          </h3>
          
          <div className="flex gap-2">
            <Input 
              value={streamId.toString()} 
              readOnly 
              className="font-mono"
            />
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyStreamId}
            >
              {idJustCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            Share this ID with viewers so they can join your stream.
          </p>
        </div>
        
        {/* Stream Key section - only visible to host */}
        {isHost && streamKey && (
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Key className="h-4 w-4" /> Stream Key
              <Badge variant="outline" className="ml-auto text-red-500 border-red-500">Private</Badge>
            </h3>
            
            <div className="flex gap-2">
              <Input 
                type={keyVisible ? "text" : "password"} 
                value={keyVisible ? streamKey : "•".repeat(24)} 
                readOnly 
                className="font-mono"
              />
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setKeyVisible(!keyVisible)}
              >
                <Shield className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyStreamKey}
                disabled={!keyVisible}
              >
                {keyJustCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Shield className="h-3 w-3 text-red-500" />
              Keep your stream key private! It gives full broadcasting access to your channel.
            </p>
          </div>
        )}
        
        {/* Shareable link */}
        <div>
          <h3 className="text-sm font-medium mb-2">Shareable Link</h3>
          
          <div className="flex gap-2">
            <Input 
              value={getShareableLink()} 
              readOnly 
            />
            
            <Button 
              variant="outline" 
              onClick={copyShareableLink}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Stream Protocol: <span className="font-medium">{protocol.toUpperCase()}</span>
        </p>
        
        {isHost && (
          <Button variant="destructive">
            End Stream
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}