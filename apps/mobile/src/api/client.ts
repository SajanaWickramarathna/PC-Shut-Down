import axios from 'axios';
import { getActiveProfile } from '../store/settings';

export const createApiClient = async () => {
  const profile = await getActiveProfile();

  if (!profile || !profile.ipAddress) {
    throw new Error('No active PC profile found or IP Address not configured');
  }

  // Use http:// by default if not specified
  const baseURL = profile.ipAddress.startsWith('http') ? profile.ipAddress : `http://${profile.ipAddress}:3000`;

  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'x-api-key': profile.apiKey || '',
      'Content-Type': 'application/json',
    },
  });
};

export const checkStatus = async () => {
  const client = await createApiClient();
  const response = await client.get('/status');
  return response.data;
};

export const executeAction = async (action: 'shutdown' | 'restart' | 'lock' | 'sleep') => {
  const client = await createApiClient();
  const response = await client.post(`/${action}`);
  return response.data;
};
