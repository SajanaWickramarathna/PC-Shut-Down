import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  IP_ADDRESS: 'pc_ip_address',
  API_KEY: 'pc_api_key',
};

export const saveSettings = async (ipAddress: string, apiKey: string) => {
  try {
    await AsyncStorage.setItem(KEYS.IP_ADDRESS, ipAddress);
    await AsyncStorage.setItem(KEYS.API_KEY, apiKey);
  } catch (e) {
    console.error('Failed to save settings.', e);
  }
};

export const getSettings = async () => {
  try {
    const ipAddress = await AsyncStorage.getItem(KEYS.IP_ADDRESS);
    const apiKey = await AsyncStorage.getItem(KEYS.API_KEY);
    return { ipAddress, apiKey };
  } catch (e) {
    console.error('Failed to get settings.', e);
    return { ipAddress: null, apiKey: null };
  }
};
