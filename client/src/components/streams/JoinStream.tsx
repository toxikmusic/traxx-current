import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Globe, ArrowRight } from "lucide-react";

export default function JoinStream() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [streamId, setStreamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinStream = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamId.trim()) {
      toast({
        title: "Stream ID Required",
        description: "Please enter a stream ID to join.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the stream exists using the public ID
      const response = await fetch(`/api/streams/${streamId}/check`);
      const data = await response.json();
      
      if (response.ok && data.exists) {
        // Navigate to the stream page using the public ID (publicStreamId or externalStreamId)
        navigate(`/stream/${streamId}`);
        
        console.log("Joining stream with public ID:", streamId);
      } else {
        toast({
          title: "Stream Not Found",
          description: "The stream ID you entered does not exist or the stream is no longer live.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking stream:", error);
      toast({
        title: "Connection Error",
        description: "Could not verify the stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join a Stream</CardTitle>
        <CardDescription>
          Enter a stream ID to join a live stream.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleJoinStream} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="streamId" className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> Stream ID
            </label>
            
            <Input
              id="streamId"
              placeholder="Enter stream ID"
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              className="font-mono"
            />
            
            <p className="text-xs text-muted-foreground">
              The stream ID is provided by the host of the stream.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                Join Stream <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground">
          Don't have a stream ID? Check out our 
          <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate("/streams")}>
            featured streams
          </Button>.
        </div>
        
        <div className="text-sm text-muted-foreground">
          Want to create your own stream? 
          <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate("/go-live")}>
            Go live now
          </Button>.
        </div>
      </CardFooter>
    </Card>
  );
}