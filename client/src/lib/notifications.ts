
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: number;
  userId: number;
  type: 'follow' | 'like' | 'comment' | 'stream';
  message: string;
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private socket: WebSocket | null = null;
  
  connect(userId: number) {
    // Use a secure protocol if the page is loaded over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Use a better approach for host detection with Replit
    const isReplit = window.location.hostname.includes('.replit.dev') || 
                    window.location.hostname.includes('.repl.co') ||
                    window.location.hostname.includes('.replit.app') ||
                    window.location.hostname.includes('.kirk.replit.dev');
    
    // For Replit environment, use port 5000 explicitly
    let host = window.location.host;
    if (isReplit) {
      // If we have a specific port, don't modify it
      if (!host.includes(':')) {
        host = `${window.location.hostname}:5000`;
      }
    }
    
    // Build the WebSocket URL
    const wsUrl = `${protocol}//${host}/notifications?userId=${userId}`;
    console.log("Connecting to notifications WebSocket:", wsUrl);
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      this.showNotification(notification);
    };
  }

  private showNotification(notification: Notification) {
    toast({
      title: "New Notification",
      description: notification.message,
    });
  }
}

export const notificationService = new NotificationService();
