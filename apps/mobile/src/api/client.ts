import axios from 'axios';
import { getSettings } from '../store/settings';

export const createApiClient = async () => {
  const { ipAddress, apiKey } = await getSettings();

  if (!ipAddress) {
    throw new Error('IP Address not configured');
  }

  // Use http:// by default if not specified
  const baseURL = ipAddress.startsWith('http') ? ipAddress : `http://${ipAddress}:3000`;

  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'x-api-key': apiKey || '',
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
