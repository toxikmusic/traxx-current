import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { getWebSocketUrl } from '@/lib/websocketUtils';

// Component to test WebSocket connection
export default function TestWebSocketConnection() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [connectionInfo, setConnectionInfo] = useState<{url: string, readyState: number} | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [forcedRefresh, setForcedRefresh] = useState(0);
  
  // Connect to WebSocket
  const connectWebSocket = () => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setStatus('connecting');
    setErrorDetails(null);
    setMessages([]);
    
    try {
      // Get WebSocket URL using our utility
      const wsUrl = getWebSocketUrl({ endpoint: '/ws' });
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      setConnectionInfo({url: wsUrl, readyState: socket.readyState});
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setStatus('connected');
        setMessages(prev => [...prev, 'Connection established']);
        setConnectionInfo(prev => prev ? {...prev, readyState: socket.readyState} : prev);
        
        // Send a test message
        socket.send(JSON.stringify({ type: 'test', message: 'Hello from client' }));
      });
      
      // Listen for messages
      socket.addEventListener('message', (event) => {
        console.log('WebSocket message received:', event.data);
        setMessages(prev => [...prev, `Received: ${event.data}`]);
      });
      
      // Listen for errors
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        setStatus('error');
        setErrorDetails('WebSocket connection error (see console for details)');
        setConnectionInfo(prev => prev ? {...prev, readyState: socket.readyState} : prev);
      });
      
      // Connection closed
      socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setStatus('disconnected');
        setMessages(prev => [...prev, `Connection closed: ${event.code} ${event.reason || ''}`]);
        setConnectionInfo(prev => prev ? {...prev, readyState: socket.readyState} : prev);
      });
      
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setStatus('error');
      setErrorDetails(`Error setting up WebSocket: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setStatus('disconnected');
      setMessages(prev => [...prev, 'Manually disconnected']);
    }
  };
  
  // Send a test message
  const sendTestMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() });
      socketRef.current.send(message);
      setMessages(prev => [...prev, `Sent: ${message}`]);
    } else {
      setErrorDetails('Cannot send message: Socket not connected');
    }
  };
  
  // Forced refresh - useful to diagnose environment issues
  const forceRefresh = () => {
    setForcedRefresh(prev => prev + 1);
  };
  
  // Effect to connect on component mount or forced refresh
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [forcedRefresh]);
  
  // Update connection info every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current) {
        setConnectionInfo(prev => prev ? {...prev, readyState: socketRef.current?.readyState || -1} : prev);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>WebSocket Connection Test</CardTitle>
          <Badge 
            variant={
              status === 'connected' ? 'default' : 
              status === 'connecting' ? 'outline' : 
              status === 'error' ? 'destructive' : 'secondary'
            }
          >
            {status.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          Tests WebSocket connectivity between client and server
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Connection details */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Connection Details</h3>
          {connectionInfo ? (
            <div className="text-sm grid grid-cols-2 gap-2">
              <div className="font-medium">URL:</div>
              <div className="font-mono text-xs break-all">{connectionInfo.url}</div>
              
              <div className="font-medium">Ready State:</div>
              <div>
                {connectionInfo.readyState === 0 && 'CONNECTING'}
                {connectionInfo.readyState === 1 && 'OPEN'}
                {connectionInfo.readyState === 2 && 'CLOSING'}
                {connectionInfo.readyState === 3 && 'CLOSED'}
                {connectionInfo.readyState === -1 && 'UNKNOWN'}
                {' '}({connectionInfo.readyState})
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No connection information available</p>
          )}
        </div>
        
        {/* Error alert */}
        {errorDetails && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorDetails}</AlertDescription>
          </Alert>
        )}
        
        {/* Success alert */}
        {status === 'connected' && (
          <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>WebSocket connection established successfully</AlertDescription>
          </Alert>
        )}
        
        {/* Message log */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Message Log</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-32 overflow-y-auto font-mono text-xs">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-1">
                  <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> {message}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 flex-wrap">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={connectWebSocket}
            disabled={status === 'connecting' || status === 'connected'}
          >
            Connect
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWebSocket}
            disabled={status !== 'connected'}
          >
            Disconnect
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestMessage}
            disabled={status !== 'connected'}
          >
            Send Test Message
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={forceRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Restart
        </Button>
      </CardFooter>
    </Card>
  );
}