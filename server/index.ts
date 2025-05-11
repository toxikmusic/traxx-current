import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import path from "path";
import http from "http";
import cors from "cors";
import fs from 'fs';
import { isReplitEnvironment, getEnvironmentInfo } from './production-check.js';
import { WebSocketServer } from 'ws';

// Create environment variable for Replit host detection
process.env.VITE_ALLOW_SPECIFIC_HOST = process.env.REPL_SLUG && process.env.REPL_OWNER 
  ? `${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co`
  : '';

// Detect if running in Replit environment
const isReplitEnv = process.env.REPL_ID || process.env.REPL_SLUG || process.env.REPL_OWNER;
console.log(`[express] Running in ${isReplitEnv ? 'Replit' : 'local'} environment`);
if (isReplitEnv) {
  console.log(`[express] REPL_SLUG: ${process.env.REPL_SLUG}`);
  console.log(`[express] REPL_OWNER: ${process.env.REPL_OWNER}`);
}

// Create or update client-side env variables with our host information
try {
  // Write to .env file to ensure Vite picks up the host
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.existsSync(envPath) 
    ? fs.readFileSync(envPath, 'utf8') 
    : '';
  
  const updatedEnvContent = `${envContent}
# Added by server for Replit host detection
VITE_DISABLE_HOST_CHECK=true
VITE_ALLOW_HOSTS=all
VITE_FORCE_DEV_SERVER_HOSTNAME=true
`;
  fs.writeFileSync(envPath, updatedEnvContent);
  console.log('[express] Updated .env file with Replit host settings');
} catch (error) {
  console.error('[express] Error updating .env file:', error);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all routes with specific configuration for Replit
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// Set CORS headers manually to handle all potential hosts
app.use((req, res, next) => {
  // Get the origin from the request
  const origin = req.headers.origin || '*';
  
  // Special handling for Replit hosts
  const isReplitHost = origin && (
    origin.includes('.replit.dev') || 
    origin.includes('.repl.co') || 
    origin.includes('.replit.app') ||
    // Add specific host that's causing issues
    origin.includes('05f4d4a1-c19d-4aea-a667-82a3e8300460-00-1qphi7t8vwh9f.kirk.replit.dev')
  );
  
  // If it's a Replit host, always allow it
  if (isReplitHost) {
    console.log(`[CORS] Allowing Replit host: ${origin}`);
  }
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Add a simple direct health check endpoint
app.get("/api/health-check", (req, res) => {
  console.log("Health check requested");
  res.json({ 
    status: "ok", 
    appName: "Traxx", 
    timestamp: new Date().toISOString(),
    environment: app.get('env'),
    isReplit: isReplitEnvironment()
  });
});

// Add detailed environment info endpoint for debugging
app.get("/api/server-info", (req, res) => {
  console.log("Server info requested");
  res.json({
    ...getEnvironmentInfo(),
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
    host: req.headers.host,
    origin: req.headers.origin || 'unknown'
  });
});

// Serve the WebSocket test page - with special handling for Vite conflict
app.get("/test-websocket", (req, res) => {
  console.log("WebSocket test page requested");
  const testPagePath = path.join(process.cwd(), "test-websocket.html");
  try {
    // Check if the file exists
    if (fs.existsSync(testPagePath)) {
      console.log(`File found at ${testPagePath}`);
      // Override content type to ensure proper rendering
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Send the content directly instead of using sendFile
      const content = fs.readFileSync(testPagePath, 'utf8');
      res.send(content);
    } else {
      console.log(`File not found at ${testPagePath}`);
      res.status(404).send('Test page not found');
    }
  } catch (error) {
    console.error('Error serving test page:', error);
    res.status(500).send('Error serving test page');
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Adding direct non-API route before Vite setup for test page
  // Create a route for raw WebSocket testing
  app.get("/raw-websocket-test", (req, res) => {
    console.log("Raw WebSocket test page requested");
    const testPagePath = path.join(process.cwd(), "test-websocket.html");
    try {
      // Check if the file exists
      if (fs.existsSync(testPagePath)) {
        console.log(`File found at ${testPagePath}`);
        // Override content type to ensure proper rendering
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        // Send the content directly instead of using sendFile
        const content = fs.readFileSync(testPagePath, 'utf8');
        res.send(content);
      } else {
        console.log(`File not found at ${testPagePath}`);
        res.status(404).send('Test page not found');
      }
    } catch (error) {
      console.error('Error serving test page:', error);
      res.status(500).send('Error serving test page');
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on configured port or fallback to 5000
  // this serves both the API and the client
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Setup WebSocket server for real-time communication
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    log(`WebSocket connection established from ${req.socket.remoteAddress}`);
    
    // Send welcome message to the client
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Traxx WebSocket server',
      timestamp: new Date().toISOString()
    }));
    
    // Handle messages from client
    ws.on('message', (message) => {
      log(`WebSocket message received: ${message}`);
      
      // Echo the message back to demonstrate connection is working
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        // Send response back
        ws.send(JSON.stringify({
          type: 'echo',
          originalMessage: parsedMessage,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        // If message isn't JSON, just echo it back
        ws.send(JSON.stringify({
          type: 'echo',
          message: message.toString(),
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    // Handle connection close
    ws.on('close', (code, reason) => {
      log(`WebSocket connection closed: ${code} ${reason}`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      log(`WebSocket error: ${error.message}`);
    });
  });
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log(`Server environment: ${app.get('env')}`);
    
    // Check if running in Replit
    if (process.env.REPL_ID) {
      log(`Running in Replit environment`);
      log(`REPL_SLUG: ${process.env.REPL_SLUG || 'unknown'}`);
      log(`REPL_OWNER: ${process.env.REPL_OWNER || 'unknown'}`);
    }
    
    log(`WebSocket server running at ws://0.0.0.0:${port}/ws`);
  });
})();
