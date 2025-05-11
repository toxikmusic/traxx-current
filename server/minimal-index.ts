// Minimal version of index.ts to test deployment
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import path from "path";
import http from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Add a simple direct health check endpoint
app.get("/api/health-check", (req, res) => {
  console.log("Health check requested");
  res.json({ status: "ok", appName: "Traxx", timestamp: new Date().toISOString() });
});

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Simple error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Create HTTP server and setup routes
(async () => {
  try {
    const server = await registerRoutes(app);
    
    // Simple static serving for production
    app.use(express.static(path.join(process.cwd(), "dist")));
    
    // Fall through to index.html
    app.use("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
    
    // Use port 5000 for deployment
    const port = parseInt(process.env.PORT || "5000", 10);
    
    server.listen(port, "0.0.0.0", () => {
      console.log(`Serving on port ${port}`);
      console.log(`Server environment: ${app.get('env')}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();