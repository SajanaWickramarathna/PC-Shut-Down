import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { checkStatus, executeAction } from '../api/client';
import { getActiveProfile, PCProfile } from '../store/settings';
import { ActionCard } from '../components/ActionCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [activeProfile, setActiveProfile] = useState<PCProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const { colors } = useAppTheme();

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
    // Fetch immediately on mount, and whenever returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStatus();
    });

    const interval = setInterval(fetchStatus, 10000);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [navigation, fetchStatus]);

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

  const actions: { id: 'shutdown' | 'restart' | 'lock' | 'sleep', title: string, icon: any, color: string }[] = [
    { id: 'shutdown', title: 'Shutdown', icon: 'power', color: colors.error },
    { id: 'restart', title: 'Restart', icon: 'restart', color: colors.warning },
    { id: 'lock', title: 'Lock', icon: 'lock', color: colors.primary },
    { id: 'sleep', title: 'Sleep', icon: 'sleep', color: '#9C27B0' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {activeProfile ? activeProfile.name : 'No PC Selected'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: activeProfile ? (isOnline ? colors.success : colors.error) : colors.textSecondary }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {activeProfile ? (isOnline ? 'Online' : 'Offline') : 'Tap gear to add PC'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')} 
          style={[styles.settingsButton, { backgroundColor: colors.surface }]}
        >
          <MaterialCommunityIcons name="cog" size={28} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <ActionCard
            title={item.title}
            iconName={item.icon}
            color={item.color}
            onPress={() => handleAction(item.id, item.title)}
            isLoading={loadingAction === item.id}
          />
        )}
      />
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
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridContent: {
    padding: 16,
  },
});
