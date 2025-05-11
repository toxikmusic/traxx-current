import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, Key, Share2, Globe, Users, Clock, Shield, MessageCircle, Send, Play, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
}

interface StreamDashboardProps {
  streamId: number;
  streamKey: string;
  externalStreamId: string;
  // Alternative naming props for compatibility
  privateStreamKey?: string;
  publicStreamId?: string;
  title: string;
  description?: string;
  isLive: boolean;
  viewerCount: number;
  startTime?: Date;
  protocol?: 'webrtc' | 'hls' | 'cloudflare';
  streamType?: 'video' | 'audio';
  user: User | null;
  onEndStream?: () => void;
  onStartStream?: () => void; // New prop for starting the stream
}

export default function StreamDashboard({
  streamId,
  streamKey,
  externalStreamId,
  privateStreamKey,
  publicStreamId,
  title,
  description,
  isLive,
  viewerCount,
  startTime,
  protocol = 'webrtc',
  streamType = 'video',
  user,
  onEndStream,
  onStartStream
}: StreamDashboardProps) {
  // Use the appropriate name conventions for stream key/id with verification
  // Log all possible key sources for debugging
  console.log("StreamDashboard key inputs:", { streamKey, privateStreamKey });
  console.log("StreamDashboard ID inputs:", { externalStreamId, publicStreamId });
  
  const effectiveStreamKey = (() => {
    // Check all possible sources for the stream key
    // Log every possible source for debugging
    console.log("Stream key sources:", {
      streamKey: streamKey || "[empty]",
      privateStreamKey: privateStreamKey || "[empty]"
    });
    
    // Use first non-empty value (don't return N/A)
    const key = privateStreamKey || streamKey || "";
    console.log("Selected effective stream key:", key);
    return key;
  })();
  
  const effectiveStreamId = (() => {
    // Check all possible sources for the stream ID
    // Log every possible source for debugging
    console.log("Stream ID sources:", {
      externalStreamId: externalStreamId || "[empty]",
      publicStreamId: publicStreamId || "[empty]"
    });
    
    // Use first non-empty value (don't return N/A)
    const id = publicStreamId || externalStreamId || "";
    console.log("Selected effective stream ID:", id);
    return id;
  })();
  const { toast } = useToast();
  const [keyVisible, setKeyVisible] = useState(true); // Key visible by default on the dashboard
  const [keyJustCopied, setKeyJustCopied] = useState(false);
  const [idJustCopied, setIdJustCopied] = useState(false);
  const [linkJustCopied, setLinkJustCopied] = useState(false);
  
  // Debug logger for stream details
  useEffect(() => {
    console.log("StreamDashboard props:", { 
      streamId, 
      streamKey, 
      privateStreamKey, 
      effectiveStreamKey, 
      externalStreamId, 
      publicStreamId, 
      effectiveStreamId 
    });
  }, [streamId, streamKey, privateStreamKey, effectiveStreamKey, externalStreamId, publicStreamId, effectiveStreamId]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("info");
  const socketRef = useRef<Socket | null>(null);
  
  // Initialize Socket.IO connection and chat when component mounts or streamId changes
  useEffect(() => {
    // Only connect if we have a valid streamId
    if (!streamId) return;
    
    // Connect to Socket.IO server
    const socket = io(`${window.location.origin}/stream`, {
      query: {
        streamId: String(streamId),
        userId: user ? String(user.id) : '0',
        username: user ? user.username : 'Guest',
        role: 'host', // This user is the host of the stream
        streamKey: effectiveStreamKey // Include stream key for authentication
      },
      transports: ['websocket', 'polling']
    });
    
    // Store socket in ref
    socketRef.current = socket;
    
    // Listen for chat messages
    socket.on('chat-message', (data: {
      senderId: string;
      message: string;
      timestamp: string;
      username?: string;
    }) => {
      // Create a new message
      const newMessage: ChatMessage = {
        id: `${data.senderId}-${Date.now()}`,
        userId: parseInt(data.senderId) || 0,
        username: data.username || 'User',
        message: data.message,
        timestamp: new Date(data.timestamp)
      };
      
      // Add to messages
      setChatMessages(prev => [...prev, newMessage]);
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [streamId, user, effectiveStreamKey]);
  
  // Initialize chat when tab is selected
  useEffect(() => {
    if (activeTab === "chat") {
      // No need to reset messages when switching to chat tab
      // They are now managed by the socket connection
    }
  }, [activeTab]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
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
  
  // Format timestamp for chat
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle copying stream key
  const copyStreamKey = () => {
    navigator.clipboard.writeText(effectiveStreamKey).then(() => {
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
    navigator.clipboard.writeText(effectiveStreamId).then(() => {
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
    // Check if we have a valid stream ID
    if (!effectiveStreamId || effectiveStreamId === "") {
      console.warn("No effectiveStreamId available to create shareable link");
      
      // Return a base URL if no ID is available (includes the slash for clarity)
      const baseUrl = `${window.location.origin}/stream/`;
      console.log("Generated base URL (no ID):", baseUrl);
      return baseUrl;
    }
    
    // Generate and log the complete link with the stream ID
    const link = `${window.location.origin}/stream/${effectiveStreamId}`;
    console.log("Generated shareable link:", link);
    return link;
  };
  
  // Handle copying shareable link
  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink()).then(() => {
      setLinkJustCopied(true);
      setTimeout(() => setLinkJustCopied(false), 3000);
      
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
  
  // Handle sending a chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !user || !socketRef.current) return;
    
    // Create a new message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      message: messageInput,
      timestamp: new Date()
    };
    
    // Send message via Socket.IO
    socketRef.current.emit("chat-message", {
      streamId: streamId, 
      message: messageInput,
      username: user.username,
      senderId: String(user.id),
      timestamp: new Date().toISOString()
    });
    
    // Add to local messages immediately for a responsive feel
    setChatMessages(prev => [...prev, newMessage]);
    
    // Clear input
    setMessageInput("");
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Column: Stream Information */}
      <div className="md:col-span-2">
        <Card className="h-full">
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
                  <Clock className="h-3 w-3" /> {getElapsedTime()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Stream Info</TabsTrigger>
                <TabsTrigger value="chat">Live Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                {/* Stream Key section - prominently displayed */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" /> Stream Key
                    <Badge variant="outline" className="ml-auto text-red-500 border-red-500">Private</Badge>
                  </h3>
                  
                  <div className="flex gap-2">
                    <Input 
                      type={keyVisible ? "text" : "password"} 
                      value={effectiveStreamKey || "No stream key available"}
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
                    >
                      {keyJustCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Shield className="h-3 w-3 text-red-500" />
                    Keep your stream key private! It gives full broadcasting access to your channel.
                  </p>
                </div>
                
                {/* Public Stream ID section */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Stream ID
                    <Badge variant="outline" className="ml-auto">Public</Badge>
                  </h3>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={effectiveStreamId || "No stream ID available"} 
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
                
                {/* Shareable link */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> Shareable Link
                  </h3>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={getShareableLink()} 
                      readOnly 
                    />
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyShareableLink}
                    >
                      {linkJustCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct link that viewers can use to join your stream.
                  </p>
                </div>
                
                <div className="rounded-md bg-muted p-4 mt-6">
                  <h3 className="font-medium mb-2">Streaming Tips</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Make sure you have a stable internet connection</li>
                    <li>• Speak clearly and check your audio levels</li>
                    <li>• Interact with your audience through chat</li>
                    <li>• Remember to save your stream when finished</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="h-[500px] flex flex-col">
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 border rounded-md"
                >
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Chat messages will appear here</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {msg.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm">
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Stream Protocol: <span className="font-medium">{protocol.toUpperCase()}</span>
            </p>
            
            <div className="flex gap-2">
              {!isLive && (
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onStartStream ? onStartStream : () => console.log('onStartStream not provided')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
              )}
              
              {isLive && (
                <Button variant="destructive" onClick={onEndStream}>
                  End Stream
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right Column: Stream Status and Preview */}
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Stream Status</CardTitle>
            <CardDescription>
              Monitor your stream's performance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status Indicators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={isLive ? "destructive" : "outline"}>
                  {isLive ? "LIVE" : "OFFLINE"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Viewers:</span>
                <span className="font-mono">{viewerCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Duration:</span>
                <span className="font-mono">{getElapsedTime()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stream Type:</span>
                <span className="font-mono uppercase">{streamType}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Protocol:</span>
                <span className="font-mono uppercase">{protocol}</span>
              </div>
            </div>
            
            <Separator />
            
            {/* Stream Preview Placeholder */}
            <div className="bg-zinc-900 aspect-video rounded-md flex flex-col items-center justify-center text-center p-4">
              <h3 className="text-white mb-2">Stream Preview</h3>
              <p className="text-zinc-400 text-sm">Preview of your stream will appear here when you start broadcasting</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copyShareableLink} className="text-xs">
                  <Share2 className="h-3 w-3 mr-1" /> Copy Link
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("chat")} className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" /> View Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}