import fs from 'fs';
import path from 'path';

const APP_NAME = 'PowerTap';

function getAppDirectory(): string {
  const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
  return path.join(appData, APP_NAME);
}

function getConfigPath(): string {
  return path.join(getAppDirectory(), 'config.json');
}

export interface AppConfig {
  apiKey: string;
}

function generateApiKey(): string {
  // Generate a random 6-digit PIN
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getConfig(): AppConfig {
  const configPath = getConfigPath();
  
  // Ensure directory exists
  const appDir = getAppDirectory();
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  // Load or Create config
  if (fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to read config, recreating...', err);
    }
  }

  // Generate new config
  const newConfig: AppConfig = { apiKey: generateApiKey() };
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
  return newConfig;
}

export function resetApiKey(): AppConfig {
  const configPath = getConfigPath();
  const newConfig: AppConfig = { apiKey: generateApiKey() };
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
  return newConfig;
}
