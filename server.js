import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const distPath = path.join(__dirname, 'dist');

// Serve static assets from built frontend
app.use(express.static(distPath));

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// SPA fallback: return index.html for all non-static requests
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Edunexa ERP production server running on http://${HOST}:${PORT}`);
});
