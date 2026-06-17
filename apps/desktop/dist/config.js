"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.resetApiKey = resetApiKey;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const APP_NAME = 'PowerTap';
function getAppDirectory() {
    const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
    return path_1.default.join(appData, APP_NAME);
}
function getConfigPath() {
    return path_1.default.join(getAppDirectory(), 'config.json');
}
function generateApiKey() {
    // Generate a random 6-digit PIN
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function getConfig() {
    const configPath = getConfigPath();
    // Ensure directory exists
    const appDir = getAppDirectory();
    if (!fs_1.default.existsSync(appDir)) {
        fs_1.default.mkdirSync(appDir, { recursive: true });
    }
    // Load or Create config
    if (fs_1.default.existsSync(configPath)) {
        try {
            const data = fs_1.default.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }
        catch (err) {
            console.error('Failed to read config, recreating...', err);
        }
    }
    // Generate new config
    const newConfig = { apiKey: generateApiKey() };
    fs_1.default.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    return newConfig;
}
function resetApiKey() {
    const configPath = getConfigPath();
    const newConfig = { apiKey: generateApiKey() };
    fs_1.default.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    return newConfig;
}
