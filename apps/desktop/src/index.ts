import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { shutdownPC, restartPC, lockPC, sleepPC } from './controllers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'default_secret_key';

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

app.get('/status', authenticate, (req, res) => {
  res.json({ status: 'online', message: 'PC is online and reachable.' });
});

app.post('/shutdown', authenticate, async (req, res) => {
  try {
    await shutdownPC();
    res.json({ message: 'Shutting down PC...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to shutdown PC', details: error.message });
  }
});

app.post('/restart', authenticate, async (req, res) => {
  try {
    await restartPC();
    res.json({ message: 'Restarting PC...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to restart PC', details: error.message });
  }
});

app.post('/lock', authenticate, async (req, res) => {
  try {
    await lockPC();
    res.json({ message: 'Locking PC...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to lock PC', details: error.message });
  }
});

app.post('/sleep', authenticate, async (req, res) => {
  try {
    await sleepPC();
    res.json({ message: 'Putting PC to sleep...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sleep PC', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Desktop Service running on port ${PORT}`);
  console.log(`Local API Key configured: ${API_KEY}`);
});
