import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface PCProfile {
  id: string;
  name: string;
  ipAddress: string;
  apiKey: string;
}

export const KEYS = {
  PROFILES: 'pc_profiles',
  ACTIVE_PROFILE_ID: 'active_profile_id',
  // Legacy keys for migration
  IP_ADDRESS: 'pc_ip_address',
  API_KEY: 'pc_api_key',
};

export const getProfiles = async (): Promise<PCProfile[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILES);
    if (data) {
      return JSON.parse(data);
    }
    
    // Migration: Check if legacy data exists
    const legacyIp = await AsyncStorage.getItem(KEYS.IP_ADDRESS);
    const legacyKey = await AsyncStorage.getItem(KEYS.API_KEY);
    
    if (legacyIp) {
      const migratedProfile: PCProfile = {
        id: uuidv4(),
        name: 'My PC',
        ipAddress: legacyIp,
        apiKey: legacyKey || '',
      };
      await saveProfiles([migratedProfile]);
      await setActiveProfileId(migratedProfile.id);
      
      // Clear legacy
      await AsyncStorage.removeItem(KEYS.IP_ADDRESS);
      await AsyncStorage.removeItem(KEYS.API_KEY);
      
      return [migratedProfile];
    }
    
    return [];
  } catch (e) {
    console.error('Failed to get profiles.', e);
    return [];
  }
};

export const saveProfiles = async (profiles: PCProfile[]) => {
  try {
    await AsyncStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles.', e);
  }
};

export const addOrUpdateProfile = async (profile: Omit<PCProfile, 'id'> & { id?: string }) => {
  const profiles = await getProfiles();
  const id = profile.id || uuidv4();
  const newProfile = { ...profile, id } as PCProfile;
  
  const existingIndex = profiles.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = newProfile;
  } else {
    profiles.push(newProfile);
  }
  
  await saveProfiles(profiles);
  
  // If it's the first profile, set it as active
  if (profiles.length === 1) {
    await setActiveProfileId(id);
  }
  
  return id;
};

export const deleteProfile = async (id: string) => {
  let profiles = await getProfiles();
  profiles = profiles.filter(p => p.id !== id);
  await saveProfiles(profiles);
  
  const activeId = await getActiveProfileId();
  if (activeId === id) {
    await setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
  }
};

export const getActiveProfileId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(KEYS.ACTIVE_PROFILE_ID);
  } catch (e) {
    console.error('Failed to get active profile ID.', e);
    return null;
  }
};

export const setActiveProfileId = async (id: string | null) => {
  try {
    if (id) {
      await AsyncStorage.setItem(KEYS.ACTIVE_PROFILE_ID, id);
    } else {
      await AsyncStorage.removeItem(KEYS.ACTIVE_PROFILE_ID);
    }
  } catch (e) {
    console.error('Failed to set active profile.', e);
  }
};

export const getActiveProfile = async (): Promise<PCProfile | null> => {
  const profiles = await getProfiles();
  const activeId = await getActiveProfileId();
  
  if (!activeId && profiles.length > 0) {
    // Auto-select first if none active
    await setActiveProfileId(profiles[0].id);
    return profiles[0];
  }
  
  return profiles.find(p => p.id === activeId) || null;
};
