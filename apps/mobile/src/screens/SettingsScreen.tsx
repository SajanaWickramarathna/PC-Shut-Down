import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, useColorScheme, FlatList } from 'react-native';
import { getProfiles, addOrUpdateProfile, deleteProfile, getActiveProfileId, setActiveProfileId, PCProfile } from '../store/settings';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<PCProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [apiKey, setApiKey] = useState('');

  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#121212' : '#F5F7FA';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const iconColor = isDark ? '#DDDDDD' : '#333';
  const labelColor = isDark ? '#DDDDDD' : '#333';
  const inputBg = isDark ? '#1E1E1E' : '#fff';
  const inputBorder = isDark ? '#333' : '#E0E0E0';
  const inputText = isDark ? '#FFF' : '#333';
  const descriptionColor = isDark ? '#AAA' : '#666';
  const cardBg = isDark ? '#1E1E1E' : '#FFF';
  const cardBorder = isDark ? '#333' : '#E0E0E0';

  const loadData = async () => {
    const loadedProfiles = await getProfiles();
    const currentActiveId = await getActiveProfileId();
    setProfiles(loadedProfiles);
    setActiveId(currentActiveId);
  };

  useEffect(() => {
    loadData();
  }, []);

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
    if (!name.trim() || !ipAddress.trim() || !apiKey.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    await addOrUpdateProfile({
      id: editId || undefined,
      name: name.trim(),
      ipAddress: ipAddress.trim(),
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
        style={[styles.profileCard, { backgroundColor: cardBg, borderColor: isActive ? '#2196F3' : cardBorder, borderWidth: isActive ? 2 : 1 }]}
        onPress={() => handleSelectActive(item.id)}
      >
        <View style={styles.profileCardInfo}>
          <Text style={[styles.profileName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.profileIp, { color: descriptionColor }]}>{item.ipAddress}</Text>
        </View>
        
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
          <MaterialCommunityIcons name="pencil" size={20} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
          <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: bgColor }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { isEditing ? setIsEditing(false) : onBack() }} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>{isEditing ? (editId ? 'Edit PC' : 'Add PC') : 'Settings'}</Text>
          <View style={{ width: 44 }} /> 
        </View>

        {!isEditing ? (
          <View style={styles.content}>
            <Text style={[styles.description, { color: descriptionColor }]}>
              Manage your saved PCs. Tap a PC to set it as the active connection.
            </Text>
            
            <FlatList
              data={profiles}
              keyExtractor={item => item.id}
              renderItem={renderProfileItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: descriptionColor }]}>No PCs configured yet.</Text>
              }
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add New PC</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: labelColor }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
                placeholder="e.g. My Gaming Rig"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: labelColor }]}>PC IP Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
                placeholder="e.g. 192.168.1.5"
                placeholderTextColor="#999"
                value={ipAddress}
                onChangeText={setIpAddress}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>Click the PowerTap icon in your Windows system tray (near the clock) to see your IP Address.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: labelColor }]}>API Key</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
                placeholder="Your Secret API Key"
                placeholderTextColor="#999"
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>Must match the API_KEY in your desktop service .env file.</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save PC</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 24, flex: 1 },
  description: { fontSize: 16, marginBottom: 20, lineHeight: 24 },
  listContent: { paddingBottom: 24 },
  emptyText: { textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileCardInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  profileIp: { fontSize: 14 },
  activeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  activeBadgeText: { color: '#1976D2', fontSize: 12, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  hint: { fontSize: 12, color: '#888', marginTop: 6 },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
