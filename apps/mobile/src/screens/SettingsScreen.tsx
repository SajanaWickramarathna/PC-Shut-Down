import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { getSettings, saveSettings } from '../store/settings';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      if (settings.ipAddress) setIpAddress(settings.ipAddress);
      if (settings.apiKey) setApiKey(settings.apiKey);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!ipAddress.trim() || !apiKey.trim()) {
      Alert.alert('Validation Error', 'Please fill in both fields.');
      return;
    }
    await saveSettings(ipAddress.trim(), apiKey.trim());
    Alert.alert('Success', 'Settings saved successfully!', [
      { text: 'OK', onPress: onBack }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 44 }} /> 
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Configure the connection to your PC's desktop service.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PC IP Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 192.168.1.5"
              placeholderTextColor="#999"
              value={ipAddress}
              onChangeText={setIpAddress}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>Find this using 'ipconfig' in Windows Command Prompt.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
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
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  content: {
    padding: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
