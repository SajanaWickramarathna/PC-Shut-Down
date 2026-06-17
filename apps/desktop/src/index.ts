import express from 'express';
import cors from 'cors';
import { shutdownPC, restartPC, lockPC, sleepPC } from './controllers';
import SysTray from 'systray2';
import fs from 'fs';
import path from 'path';
import { getConfig, resetApiKey } from './config';

const app = express();
const PORT = process.env.PORT || 3000;
let API_KEY = getConfig().apiKey;

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

  let systray: any = null;

  const setupTray = () => {
    try {
      if (systray) {
        try { systray.kill(false); } catch (e) {}
      }

      const iconPath = path.resolve(__dirname, '../assets/icon.ico');
    let iconData = '';
    if (fs.existsSync(iconPath)) {
      iconData = fs.readFileSync(iconPath).toString('base64');
    }

    // Get Local IP Addresses
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const ips: string[] = [];
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (iface) {
        for (let i = 0; i < iface.length; i++) {
          const alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
            ips.push(alias.address);
          }
        }
      }
    }

    const ipItems = ips.map(ip => ({
      title: `IP: ${ip}`,
      tooltip: 'Your Local IP Address (Type this in the mobile app)',
      checked: false,
      enabled: false
    }));

    systray = new SysTray({
      menu: {
        icon: iconData,
        title: 'PowerTap',
        tooltip: `PowerTap Service (Port: ${PORT})`,
        items: [
          {
            title: `API Key: ${API_KEY}`,
            tooltip: 'Type this secret key in the mobile app',
            checked: false,
            enabled: false
          },
          ...ipItems,
          {
            title: '---',
            tooltip: '',
            checked: false,
            enabled: false
          },
          {
            title: 'Reset API Key',
            tooltip: 'Generate a new random 6-digit API key',
            checked: false,
            enabled: true
          },
          {
            title: 'Exit',
            tooltip: 'Stop the service',
            checked: false,
            enabled: true
          }
        ]
      },
      debug: false,
      copyDir: true // copy binaries to a safe directory to avoid access issues
    });

    systray.onClick((action: any) => {
      if (action.item.title === 'Reset API Key') {
        API_KEY = resetApiKey().apiKey;
        setupTray();
      } else if (action.item.title === 'Exit') {
        systray.kill(false);
        process.exit(0);
      }
    });

    systray.ready().then(() => {
      console.log('System tray is ready.');
    }).catch((err: any) => {
      console.error('Failed to start system tray:', err);
    });

    } catch (err) {
      console.error('System tray initialization error:', err);
    }
  };

  setupTray();
});
