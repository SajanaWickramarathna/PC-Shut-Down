import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, useColorScheme } from 'react-native';
import { checkStatus, executeAction } from '../api/client';
import { getActiveProfile, PCProfile } from '../store/settings';
import { ActionCard } from '../components/ActionCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HomeScreenProps {
  onNavigateToSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSettings }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [activeProfile, setActiveProfile] = useState<PCProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#121212' : '#F5F7FA';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const settingsBg = isDark ? '#333333' : '#EAECEF';
  const iconColor = isDark ? '#DDDDDD' : '#555';

  const fetchStatus = useCallback(async () => {
    try {
      const profile = await getActiveProfile();
      setActiveProfile(profile);
      
      if (profile) {
        const result = await checkStatus();
        setIsOnline(result.status === 'online');
      } else {
        setIsOnline(false);
      }
    } catch (e) {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setIsRefreshing(false);
  };

  const handleAction = (action: 'shutdown' | 'restart' | 'lock' | 'sleep', title: string) => {
    Alert.alert(
      `Confirm ${title}`,
      `Are you sure you want to ${title.toLowerCase()} your PC?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            if (!activeProfile) {
              Alert.alert('No PC Selected', 'Please configure a PC in Settings first.');
              return;
            }
            setLoadingAction(action);
            try {
              await executeAction(action);
              Alert.alert('Success', `Command '${title}' sent to PC.`);
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.error || 'Failed to communicate with PC. Check settings and ensure server is running.');
            } finally {
              setLoadingAction(null);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {activeProfile ? activeProfile.name : 'No PC Selected'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>
              {activeProfile ? (isOnline ? 'Online' : 'Offline') : 'Go to Settings to add a PC'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onNavigateToSettings} style={[styles.settingsButton, { backgroundColor: settingsBg }]}>
          <MaterialCommunityIcons name="cog" size={28} color={iconColor} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <ActionCard
          title="Shutdown"
          iconName="power"
          color="#F44336"
          onPress={() => handleAction('shutdown', 'Shutdown')}
          isLoading={loadingAction === 'shutdown'}
        />
        <ActionCard
          title="Restart"
          iconName="restart"
          color="#FF9800"
          onPress={() => handleAction('restart', 'Restart')}
          isLoading={loadingAction === 'restart'}
        />
        <ActionCard
          title="Lock"
          iconName="lock"
          color="#2196F3"
          onPress={() => handleAction('lock', 'Lock')}
          isLoading={loadingAction === 'lock'}
        />
        <ActionCard
          title="Sleep"
          iconName="sleep"
          color="#9C27B0"
          onPress={() => handleAction('sleep', 'Sleep')}
          isLoading={loadingAction === 'sleep'}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 24,
  },
});
