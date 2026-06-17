"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const controllers_1 = require("./controllers");
const systray2_1 = __importDefault(require("systray2"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
if (!process.argv.includes('--daemon')) {
    const child = (0, child_process_1.spawn)(process.execPath, process.argv.slice(1).concat(['--daemon']), {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
    });
    child.unref();
    process.exit(0);
}
const config_1 = require("./config");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
let API_KEY = (0, config_1.getConfig)().apiKey;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Authentication Middleware
const authenticate = (req, res, next) => {
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
        await (0, controllers_1.shutdownPC)();
        res.json({ message: 'Shutting down PC...' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to shutdown PC', details: error.message });
    }
});
app.post('/restart', authenticate, async (req, res) => {
    try {
        await (0, controllers_1.restartPC)();
        res.json({ message: 'Restarting PC...' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to restart PC', details: error.message });
    }
});
app.post('/lock', authenticate, async (req, res) => {
    try {
        await (0, controllers_1.lockPC)();
        res.json({ message: 'Locking PC...' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to lock PC', details: error.message });
    }
});
app.post('/sleep', authenticate, async (req, res) => {
    try {
        await (0, controllers_1.sleepPC)();
        res.json({ message: 'Putting PC to sleep...' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to sleep PC', details: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Desktop Service running on port ${PORT}`);
    console.log(`Local API Key configured: ${API_KEY}`);
    let systray = null;
    const setupTray = () => {
        try {
            if (systray) {
                try {
                    systray.kill(false);
                }
                catch (e) { }
            }
            const iconPath = path_1.default.resolve(__dirname, '../assets/icon.ico');
            let iconData = '';
            if (fs_1.default.existsSync(iconPath)) {
                iconData = fs_1.default.readFileSync(iconPath).toString('base64');
            }
            // Get Local IP Addresses
            const os = require('os');
            const interfaces = os.networkInterfaces();
            const ips = [];
            for (const devName in interfaces) {
                const iface = interfaces[devName];
                if (iface) {
                    for (let i = 0; i < iface.length; i++) {
                        const alias = iface[i];
                        if ((alias.family === 'IPv4' || alias.family === 4) && alias.address !== '127.0.0.1' && !alias.internal) {
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
            systray = new systray2_1.default({
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
            systray.onClick((action) => {
                if (action.item.title === 'Reset API Key') {
                    API_KEY = (0, config_1.resetApiKey)().apiKey;
                    setupTray();
                }
                else if (action.item.title === 'Exit') {
                    systray.kill(false);
                    process.exit(0);
                }
            });
            systray.ready().then(() => {
                console.log('System tray is ready.');
            }).catch((err) => {
                console.error('Failed to start system tray:', err);
            });
        }
        catch (err) {
            console.error('System tray initialization error:', err);
        }
    };
    setupTray();
});
