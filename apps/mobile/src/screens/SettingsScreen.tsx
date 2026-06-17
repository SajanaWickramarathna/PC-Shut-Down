import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { getProfiles, addOrUpdateProfile, deleteProfile, getActiveProfileId, setActiveProfileId, PCProfile } from '../store/settings';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [profiles, setProfiles] = useState<PCProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [apiKey, setApiKey] = useState('');

  const { colors } = useAppTheme();

  const loadData = async () => {
    const loadedProfiles = await getProfiles();
    const currentActiveId = await getActiveProfileId();
    setProfiles(loadedProfiles);
    setActiveId(currentActiveId);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update navigation title based on editing state
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? (editId ? 'Edit PC' : 'Add PC') : 'Settings',
    });
  }, [navigation, isEditing, editId]);

  const handleAddNew = () => {
    setEditId(null);
    setName('');
    setIpAddress('');
    setApiKey('');
    setIsEditing(true);
  };

  const handleEdit = (profile: PCProfile) => {
    setEditId(profile.id);
    setName(profile.name);
    setIpAddress(profile.ipAddress);
    setApiKey(profile.apiKey);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete PC', 'Are you sure you want to remove this PC?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteProfile(id);
        await loadData();
      }}
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !apiKey.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    await addOrUpdateProfile({
      id: editId || undefined,
      name: name.trim(),
      ipAddress: 'cloud', // Keep for type compat
      apiKey: apiKey.trim(),
    });
    
    setIsEditing(false);
    await loadData();
  };

  const handleSelectActive = async (id: string) => {
    await setActiveProfileId(id);
    setActiveId(id);
  };

  const renderProfileItem = ({ item }: { item: PCProfile }) => {
    const isActive = item.id === activeId;
    return (
      <TouchableOpacity 
        style={[
          styles.profileCard, 
          { 
            backgroundColor: colors.surface, 
            borderColor: isActive ? colors.primary : colors.border, 
            borderWidth: isActive ? 2 : 1 
          }
        ]}
        onPress={() => handleSelectActive(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.profileCardInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.profileIp, { color: colors.textSecondary }]}>{item.ipAddress}</Text>
        </View>
        
        {isActive && (
          <View style={[styles.activeBadge, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.activeBadgeText, { color: colors.primary }]}>Active</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
          <MaterialCommunityIcons name="pencil" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
          <MaterialCommunityIcons name="delete" size={22} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!isEditing ? (
          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Manage your saved PCs. Tap a PC to set it as the active connection.
            </Text>
            
            <FlatList
              data={profiles}
              keyExtractor={item => item.id}
              renderItem={renderProfileItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No PCs configured yet.</Text>
              }
            />

            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddNew} activeOpacity={0.8}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add New PC</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g. My Gaming Rig"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>API Key (Connection ID)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Your Secret API Key"
                placeholderTextColor={colors.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>Must match the API_KEY shown in your desktop app to connect globally.</Text>
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save PC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => setIsEditing(false)} activeOpacity={0.8}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, flex: 1 },
  description: { fontSize: 16, marginBottom: 20, lineHeight: 24 },
  listContent: { paddingBottom: 24 },
  emptyText: { textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileCardInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  profileIp: { fontSize: 14, fontWeight: '500' },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  activeBadgeText: { fontSize: 12, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  addButton: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16 },
  hint: { fontSize: 13, marginTop: 8 },
  saveButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  cancelButtonText: { fontSize: 18, fontWeight: '600' },
});
