import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from './firebaseConfig';
import { getActiveProfile } from '../store/settings';

export const checkStatus = async (): Promise<{ status: string }> => {
  const profile = await getActiveProfile();
  if (!profile || !profile.apiKey) {
    throw new Error('No active PC profile found or API Key not configured');
  }

  const statusRef = ref(database, `pcs/${profile.apiKey}/status`);
  const snapshot = await get(statusRef);
  const status = snapshot.val();

  return { status: status || 'offline' };
};

export const subscribeToStatus = async (callback: (status: string) => void) => {
  const profile = await getActiveProfile();
  if (!profile || !profile.apiKey) return () => {};

  const statusRef = ref(database, `pcs/${profile.apiKey}/status`);
  onValue(statusRef, (snapshot) => {
    callback(snapshot.val() || 'offline');
  });

  return () => off(statusRef);
};

export const executeAction = async (action: 'shutdown' | 'restart' | 'lock' | 'sleep') => {
  const profile = await getActiveProfile();
  if (!profile || !profile.apiKey) {
    throw new Error('No active PC profile found or API Key not configured');
  }

  const commandRef = ref(database, `pcs/${profile.apiKey}/command`);
  await set(commandRef, {
    action,
    timestamp: Date.now()
  });

  return { message: `${action} command sent to PC via Firebase!` };
};
