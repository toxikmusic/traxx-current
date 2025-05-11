// Simple Express server with ES modules
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 5001;
// Basic health check endpoint
app.get('/api/health-check', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Simple catch-all route
app.use('*', (req, res) => {
    res.send('Server is running. Try accessing /api/health-check');
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
